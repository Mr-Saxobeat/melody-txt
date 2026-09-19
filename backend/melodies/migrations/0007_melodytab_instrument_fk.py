import django.db.models.deletion
from django.db import migrations, models


SLUG_TO_NAME = {
    'piano': 'Piano',
    'saxophone': 'Saxophone',
    'trumpet': 'Trumpet',
    'trombone': 'Trombone',
}


def migrate_instrument_strings_to_fk(apps, schema_editor):
    MelodyTab = apps.get_model('melodies', 'MelodyTab')
    Instrument = apps.get_model('melodies', 'Instrument')

    instrument_map = {}
    for slug, name in SLUG_TO_NAME.items():
        try:
            instrument_map[slug] = Instrument.objects.get(name=name)
        except Instrument.DoesNotExist:
            pass

    for tab in MelodyTab.objects.all():
        instrument = instrument_map.get(tab.instrument_old)
        if instrument:
            tab.instrument_new = instrument
            tab.save(update_fields=['instrument_new'])


def migrate_fk_back_to_strings(apps, schema_editor):
    MelodyTab = apps.get_model('melodies', 'MelodyTab')
    Instrument = apps.get_model('melodies', 'Instrument')

    name_to_slug = {v: k for k, v in SLUG_TO_NAME.items()}

    for tab in MelodyTab.objects.select_related('instrument_new').all():
        if tab.instrument_new:
            tab.instrument_old = name_to_slug.get(tab.instrument_new.name, 'piano')
            tab.save(update_fields=['instrument_old'])


class Migration(migrations.Migration):

    dependencies = [
        ('melodies', '0006_instrument'),
    ]

    operations = [
        # Step 0: Remove old index on (melody, instrument)
        migrations.RemoveIndex(
            model_name='melodytab',
            name='melody_tabs_melody__795c34_idx',
        ),
        # Step 1: Rename old instrument field
        migrations.RenameField(
            model_name='melodytab',
            old_name='instrument',
            new_name='instrument_old',
        ),
        # Step 2: Add new FK field (nullable initially)
        migrations.AddField(
            model_name='melodytab',
            name='instrument_new',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tabs_new',
                to='melodies.instrument',
            ),
        ),
        # Step 3: Data migration
        migrations.RunPython(
            migrate_instrument_strings_to_fk,
            migrate_fk_back_to_strings,
        ),
        # Step 4: Remove old field
        migrations.RemoveField(
            model_name='melodytab',
            name='instrument_old',
        ),
        # Step 5: Rename new field to instrument
        migrations.RenameField(
            model_name='melodytab',
            old_name='instrument_new',
            new_name='instrument',
        ),
        # Step 6: Make FK non-nullable and set proper related_name
        migrations.AlterField(
            model_name='melodytab',
            name='instrument',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tabs',
                to='melodies.instrument',
            ),
        ),
        # Step 7: Recreate index for melody+instrument
        migrations.AddIndex(
            model_name='melodytab',
            index=models.Index(fields=['melody', 'instrument'], name='melody_tabs_melody__a2c1e7_idx'),
        ),
    ]
