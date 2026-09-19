"""Unit tests for Instrument model."""

import pytest
from django.core.exceptions import ValidationError

from melodies.models import Instrument


@pytest.mark.django_db
class TestInstrumentModel:

    def test_create_instrument_with_pitch_c(self):
        inst = Instrument(name='Celesta', pitch='C')
        inst.save()
        assert inst.offset == 0

    def test_create_instrument_with_pitch_bb(self):
        inst = Instrument(name='Cornet', pitch='Bb')
        inst.save()
        assert inst.offset == 2

    def test_create_instrument_with_pitch_eb(self):
        inst = Instrument(name='Alto Sax', pitch='Eb')
        inst.save()
        assert inst.offset == 9

    @pytest.mark.parametrize('pitch,expected_offset', [
        ('C', 0), ('Db', 11), ('D', 10), ('Eb', 9),
        ('E', 8), ('F', 7), ('F#', 6), ('G', 5),
        ('Ab', 4), ('A', 3), ('Bb', 2), ('B', 1),
    ])
    def test_pitch_to_offset_mapping(self, pitch, expected_offset):
        inst = Instrument(name=f'Test {pitch}', pitch=pitch)
        inst.save()
        assert inst.offset == expected_offset

    def test_unique_name_constraint(self):
        Instrument.objects.create(name='Oboe', pitch='C')
        with pytest.raises(Exception):
            Instrument.objects.create(name='Oboe', pitch='Eb')

    def test_pitch_immutable_after_creation(self):
        inst = Instrument.objects.create(name='Cornet', pitch='Bb')
        assert inst.offset == 2
        inst.pitch = 'Eb'
        with pytest.raises(ValidationError):
            inst.save()

    def test_name_editable_after_creation(self):
        inst = Instrument.objects.create(name='Cornet', pitch='Bb')
        inst.name = 'Bb Cornet'
        inst.save()
        inst.refresh_from_db()
        assert inst.name == 'Bb Cornet'
        assert inst.pitch == 'Bb'
        assert inst.offset == 2

    def test_str_representation(self):
        inst = Instrument(name='Flugelhorn', pitch='Bb')
        inst.save()
        assert str(inst) == 'Flugelhorn in Bb'

    def test_ordering_alphabetical(self):
        Instrument.objects.create(name='Zither', pitch='C')
        Instrument.objects.create(name='Alto Sax', pitch='Eb')
        Instrument.objects.create(name='Mandolin', pitch='C')
        names = list(Instrument.objects.values_list('name', flat=True))
        assert names[0] == 'Alto Sax'
        assert 'Mandolin' in names
        assert 'Zither' in names
        assert names.index('Alto Sax') < names.index('Mandolin') < names.index('Zither')

    def test_offset_auto_computed_on_save(self):
        inst = Instrument(name='French Horn', pitch='F')
        assert inst.offset is None or inst.offset != 7
        inst.save()
        assert inst.offset == 7
