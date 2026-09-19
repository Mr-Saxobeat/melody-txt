import uuid

from django.conf import settings
from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .utils import is_valid_solfege_notation, generate_share_id, strip_quoted_segments


class Instrument(models.Model):
    PITCH_CHOICES = [
        ('C', 'C'), ('Db', 'Db'), ('D', 'D'), ('Eb', 'Eb'),
        ('E', 'E'), ('F', 'F'), ('F#', 'F#'), ('G', 'G'),
        ('Ab', 'Ab'), ('A', 'A'), ('Bb', 'Bb'), ('B', 'B'),
    ]

    PITCH_TO_OFFSET = {
        'C': 0, 'Db': 11, 'D': 10, 'Eb': 9, 'E': 8, 'F': 7,
        'F#': 6, 'G': 5, 'Ab': 4, 'A': 3, 'Bb': 2, 'B': 1,
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    pitch = models.CharField(max_length=2, choices=PITCH_CHOICES)
    offset = models.IntegerField(editable=False)

    class Meta:
        db_table = 'instruments'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} in {self.pitch}"

    def save(self, *args, **kwargs):
        if self.pk and not kwargs.pop('_skip_pitch_check', False):
            try:
                existing = Instrument.objects.get(pk=self.pk)
                if existing.pitch != self.pitch:
                    from django.core.exceptions import ValidationError
                    raise ValidationError(
                        {'pitch': 'Pitch cannot be changed after creation.'}
                    )
            except Instrument.DoesNotExist:
                pass
        self.offset = self.PITCH_TO_OFFSET[self.pitch]
        super().save(*args, **kwargs)


class Melody(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='melodies',
    )
    title = models.CharField(max_length=200)
    notation = models.TextField()
    key = models.CharField(max_length=3, default='C')
    share_id = models.CharField(max_length=12, unique=True, db_index=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    note_count = models.IntegerField(editable=False)
    duration_seconds = models.FloatField(editable=False)

    VALID_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

    class Meta:
        db_table = 'melodies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_public', '-created_at']),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        from django.core.exceptions import ValidationError

        if not self.notation or not self.notation.strip():
            raise ValidationError({'notation': 'Notation cannot be empty.'})

        if not is_valid_solfege_notation(self.notation):
            raise ValidationError({'notation': 'Notation contains invalid solfege syllables.'})

        if self.key and self.key not in self.VALID_KEYS:
            raise ValidationError({'key': f'Key must be one of: {", ".join(self.VALID_KEYS)}'})

    def save(self, *args, **kwargs):
        if not self.share_id:
            self.share_id = generate_share_id()

        stripped = strip_quoted_segments(self.notation)
        syllables = stripped.split()
        self.note_count = len(syllables)
        self.duration_seconds = self.note_count * 0.5

        super().save(*args, **kwargs)


class MelodyTab(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    melody = models.ForeignKey(
        Melody,
        on_delete=models.CASCADE,
        related_name='tabs',
    )
    instrument = models.ForeignKey(
        Instrument,
        on_delete=models.CASCADE,
        related_name='tabs',
    )
    notation = models.TextField()
    position = models.IntegerField(default=0)
    suffix = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'melody_tabs'
        ordering = ['position']
        indexes = [
            models.Index(fields=['melody', 'position']),
            models.Index(fields=['melody', 'instrument']),
        ]

    def __str__(self):
        label = str(self.instrument)
        if self.suffix:
            label = f"{label} - {self.suffix}"
        return f"{self.melody.title} / {label}"


@receiver(pre_delete, sender=Instrument)
def create_fallback_tabs_on_instrument_delete(sender, instance, **kwargs):
    """Before deleting an instrument, create Piano fallback tabs for melodies
    that would lose their last tab."""
    piano = Instrument.objects.filter(pitch='C', name='Piano').first()
    if not piano or piano.pk == instance.pk:
        return

    melody_ids_with_only_this_instrument = (
        MelodyTab.objects.filter(instrument=instance)
        .values('melody_id')
        .exclude(melody_id__in=(
            MelodyTab.objects.exclude(instrument=instance).values('melody_id')
        ))
    )

    for entry in melody_ids_with_only_this_instrument:
        melody = Melody.objects.get(pk=entry['melody_id'])
        MelodyTab.objects.create(
            melody=melody,
            instrument=piano,
            notation=melody.notation,
            position=0,
        )
