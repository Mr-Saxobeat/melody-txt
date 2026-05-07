import uuid

from django.conf import settings
from django.db import models

from melodies.utils import generate_share_id


class Setlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='setlists',
    )
    title = models.CharField(max_length=200)
    share_id = models.CharField(max_length=12, unique=True, db_index=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'setlists'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.share_id:
            self.share_id = generate_share_id()
        super().save(*args, **kwargs)


class SetlistEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    setlist = models.ForeignKey(
        Setlist,
        on_delete=models.CASCADE,
        related_name='entries',
    )
    melody = models.ForeignKey(
        'melodies.Melody',
        on_delete=models.CASCADE,
        related_name='setlist_entries',
    )
    position = models.IntegerField()
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'setlist_entries'
        ordering = ['position']
        indexes = [
            models.Index(fields=['setlist', 'position']),
        ]

    def __str__(self):
        return f"{self.setlist.title} - #{self.position}"
