import config.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('site_title', models.CharField(default='Melody Txt', max_length=200)),
                ('primary_color', models.CharField(default='#1976d2', max_length=7, validators=[config.models.validate_hex_color])),
                ('header_background_color', models.CharField(default='#282c34', max_length=7, validators=[config.models.validate_hex_color])),
                ('logo_text_color', models.CharField(default='#61dafb', max_length=7, validators=[config.models.validate_hex_color])),
            ],
            options={
                'db_table': 'site_settings',
                'verbose_name': 'Site Settings',
                'verbose_name_plural': 'Site Settings',
            },
        ),
    ]
