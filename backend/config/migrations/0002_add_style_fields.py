from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='tab_title',
            field=models.CharField(default='Melody Txt', help_text='Browser tab title', max_length=200),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='main_background_color',
            field=models.CharField(default='#f5f7fa', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='logo_font_family',
            field=models.CharField(blank=True, default='', help_text='CSS font-family (leave blank for system default)', max_length=200),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='logo_font_size',
            field=models.CharField(default='1.4rem', help_text='CSS font-size (e.g. 1.4rem, 18px)', max_length=20),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='header_gradient',
            field=models.CharField(blank=True, default='', help_text='CSS gradient (e.g. linear-gradient(90deg, #282c34, #1a1a2e)). Leave blank for solid color.', max_length=500),
        ),
    ]
