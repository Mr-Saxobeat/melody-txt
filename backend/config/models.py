import re

from django.core.exceptions import ValidationError
from django.db import models


HEX_COLOR_REGEX = re.compile(r'^#[0-9a-fA-F]{6}$')


def validate_hex_color(value):
    if not HEX_COLOR_REGEX.match(value):
        raise ValidationError(f'"{value}" is not a valid hex color. Use format #RRGGBB.')


class SiteSettings(models.Model):
    site_title = models.CharField(max_length=200, default='Melody Txt')
    tab_title = models.CharField(max_length=200, default='Melody Txt', help_text='Browser tab title')
    primary_color = models.CharField(max_length=7, default='#1976d2', validators=[validate_hex_color])
    header_background_color = models.CharField(max_length=7, default='#282c34', validators=[validate_hex_color])
    logo_text_color = models.CharField(max_length=7, default='#61dafb', validators=[validate_hex_color])
    main_background_color = models.CharField(max_length=7, default='#f5f7fa', validators=[validate_hex_color])
    logo_font_family = models.CharField(max_length=200, default='', blank=True, help_text='CSS font-family (leave blank for system default)')
    logo_font_size = models.CharField(max_length=20, default='1.4rem', help_text='CSS font-size (e.g. 1.4rem, 18px)')
    header_gradient = models.CharField(max_length=500, default='', blank=True, help_text='CSS gradient (e.g. linear-gradient(90deg, #282c34, #1a1a2e)). Leave blank for solid color.')

    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_title

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
