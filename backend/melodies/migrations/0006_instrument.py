import uuid
from django.db import migrations, models


SEED_INSTRUMENTS = [
    {'name': 'Piano', 'pitch': 'C', 'offset': 0},
    {'name': 'Saxophone', 'pitch': 'Eb', 'offset': 9},
    {'name': 'Trumpet', 'pitch': 'Bb', 'offset': 2},
    {'name': 'Trombone', 'pitch': 'C', 'offset': 0},
]


def seed_instruments(apps, schema_editor):
    Instrument = apps.get_model('melodies', 'Instrument')
    for data in SEED_INSTRUMENTS:
        Instrument.objects.create(
            id=uuid.uuid4(),
            name=data['name'],
            pitch=data['pitch'],
            offset=data['offset'],
        )


def unseed_instruments(apps, schema_editor):
    Instrument = apps.get_model('melodies', 'Instrument')
    Instrument.objects.filter(
        name__in=[i['name'] for i in SEED_INSTRUMENTS]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('melodies', '0005_migrate_notation_format'),
    ]

    operations = [
        migrations.CreateModel(
            name='Instrument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('pitch', models.CharField(choices=[
                    ('C', 'C'), ('Db', 'Db'), ('D', 'D'), ('Eb', 'Eb'),
                    ('E', 'E'), ('F', 'F'), ('F#', 'F#'), ('G', 'G'),
                    ('Ab', 'Ab'), ('A', 'A'), ('Bb', 'Bb'), ('B', 'B'),
                ], max_length=2)),
                ('offset', models.IntegerField(editable=False)),
            ],
            options={
                'db_table': 'instruments',
                'ordering': ['name'],
            },
        ),
        migrations.RunPython(seed_instruments, unseed_instruments),
    ]
