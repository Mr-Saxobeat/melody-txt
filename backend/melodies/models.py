import uuid

from django.conf import settings
from django.db import models

from .utils import is_valid_solfege_notation, generate_share_id


INSTRUMENT_CHOICES = [
    ('piano', 'Piano in C'),
    ('saxophone', 'Saxophone in Eb'),
    ('trumpet', 'Trumpet in Bb'),
    ('trombone', 'Trombone in C'),
]

INSTRUMENT_OFFSETS = {
    'piano': 0,
    'saxophone': 9,
    'trumpet': 2,
    'trombone': 0,
}


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

        syllables = self.notation.split()
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
    instrument = models.CharField(max_length=20, choices=INSTRUMENT_CHOICES)
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
        label = dict(INSTRUMENT_CHOICES).get(self.instrument, self.instrument)
        if self.suffix:
            label = f"{label} - {self.suffix}"
        return f"{self.melody.title} / {label}"
