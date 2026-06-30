"""Migrate notation from old format [syllable][accidental][octave] to new [syllable][octave][accidental]."""

import re

from django.db import migrations


OLD_FORMAT_REGEX = re.compile(
    r'(sol|la|si|do|re|mi|fa)(#|b)(\d)',
    re.IGNORECASE
)

NEW_FORMAT_REGEX = re.compile(
    r'(sol|la|si|do|re|mi|fa)(\d)(#|b)',
    re.IGNORECASE
)

NOTE_REGEX = re.compile(
    r'^(sol|la|si|do|re|mi|fa)(?:(\d)?(#|b)?|(#|b)(\d))$',
    re.IGNORECASE
)

IGNORED_SYMBOL_REGEX = re.compile(r'^[|:\-./()0-9,;]+$')
STRIP_SYMBOLS_REGEX = re.compile(r'^[|:\-./()]*(.*?)[|:\-./()]*$')


def _strip_symbols(token):
    match = STRIP_SYMBOLS_REGEX.match(token)
    return match.group(1) if match else token


def _is_ignored_symbol(token):
    return IGNORED_SYMBOL_REGEX.match(token) is not None


def _is_note_token(token):
    stripped = _strip_symbols(token)
    if not stripped:
        return False
    return NOTE_REGEX.match(stripped) is not None


def _is_note_line(line):
    if not line or not line.strip():
        return False
    tokens = line.strip().split()
    non_ignored = [t for t in tokens if not _is_ignored_symbol(t)]
    if not non_ignored:
        return False
    note_count = sum(1 for t in non_ignored if _is_note_token(t))
    return note_count > len(non_ignored) / 2


def migrate_forward(text):
    """Convert old format to new format."""
    if not text or not text.strip():
        return text
    lines = text.split('\n')
    result = []
    for line in lines:
        if not _is_note_line(line):
            result.append(line)
            continue
        result.append(OLD_FORMAT_REGEX.sub(r'\1\3\2', line))
    return '\n'.join(result)


def migrate_reverse(text):
    """Convert new format back to old format."""
    if not text or not text.strip():
        return text
    lines = text.split('\n')
    result = []
    for line in lines:
        if not _is_note_line(line):
            result.append(line)
            continue
        result.append(NEW_FORMAT_REGEX.sub(r'\1\3\2', line))
    return '\n'.join(result)


def forwards(apps, schema_editor):
    Melody = apps.get_model('melodies', 'Melody')
    MelodyTab = apps.get_model('melodies', 'MelodyTab')

    for melody in Melody.objects.all().iterator():
        new_notation = migrate_forward(melody.notation)
        if new_notation != melody.notation:
            melody.notation = new_notation
            melody.save(update_fields=['notation'])

    for tab in MelodyTab.objects.all().iterator():
        new_notation = migrate_forward(tab.notation)
        if new_notation != tab.notation:
            tab.notation = new_notation
            tab.save(update_fields=['notation'])


def backwards(apps, schema_editor):
    Melody = apps.get_model('melodies', 'Melody')
    MelodyTab = apps.get_model('melodies', 'MelodyTab')

    for melody in Melody.objects.all().iterator():
        old_notation = migrate_reverse(melody.notation)
        if old_notation != melody.notation:
            melody.notation = old_notation
            melody.save(update_fields=['notation'])

    for tab in MelodyTab.objects.all().iterator():
        old_notation = migrate_reverse(tab.notation)
        if old_notation != tab.notation:
            tab.notation = old_notation
            tab.save(update_fields=['notation'])


class Migration(migrations.Migration):

    dependencies = [
        ('melodies', '0004_add_is_public_created_at_index'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
