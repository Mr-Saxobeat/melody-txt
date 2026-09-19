"""Integration tests for instrument deletion cascade and Piano fallback."""

import pytest
from django.contrib.auth import get_user_model

from melodies.models import Instrument, Melody, MelodyTab

User = get_user_model()


@pytest.fixture
def user():
    return User.objects.create_user(
        username='cascadeuser', email='cascade@example.com', password='TestPass123'
    )


@pytest.fixture
def piano():
    inst, _ = Instrument.objects.get_or_create(name='Piano', defaults={'pitch': 'C'})
    return inst


@pytest.fixture
def saxophone():
    inst, _ = Instrument.objects.get_or_create(name='Saxophone', defaults={'pitch': 'Eb'})
    return inst


@pytest.fixture
def trumpet():
    inst, _ = Instrument.objects.get_or_create(name='Trumpet', defaults={'pitch': 'Bb'})
    return inst


@pytest.mark.django_db
class TestInstrumentCascadeDelete:

    def test_deleting_instrument_removes_all_its_tabs(self, user, piano, saxophone):
        m1 = Melody.objects.create(user=user, title='Song 1', notation='do re mi')
        m2 = Melody.objects.create(user=user, title='Song 2', notation='fa sol la')

        MelodyTab.objects.create(melody=m1, instrument=piano, notation='do re mi', position=0)
        MelodyTab.objects.create(melody=m1, instrument=saxophone, notation='la si do#', position=1)
        MelodyTab.objects.create(melody=m2, instrument=piano, notation='fa sol la', position=0)
        MelodyTab.objects.create(melody=m2, instrument=saxophone, notation='re mi fa#', position=1)

        saxophone.delete()

        assert MelodyTab.objects.filter(instrument=piano).count() == 2
        assert MelodyTab.objects.filter(instrument=saxophone).count() == 0

    def test_deleting_instrument_preserves_other_instruments_tabs(self, user, piano, saxophone, trumpet):
        melody = Melody.objects.create(user=user, title='Song', notation='do re mi')
        MelodyTab.objects.create(melody=melody, instrument=piano, notation='do re mi', position=0)
        MelodyTab.objects.create(melody=melody, instrument=saxophone, notation='la si do#', position=1)
        MelodyTab.objects.create(melody=melody, instrument=trumpet, notation='re mi fa#', position=2)

        saxophone.delete()

        remaining = MelodyTab.objects.filter(melody=melody)
        assert remaining.count() == 2
        instruments = set(remaining.values_list('instrument__name', flat=True))
        assert instruments == {'Piano', 'Trumpet'}


@pytest.mark.django_db
class TestLastTabPianoFallback:

    def test_melody_with_only_deleted_instrument_gets_piano_tab(self, user, piano, saxophone):
        melody = Melody.objects.create(user=user, title='Sax Only', notation='do re mi')
        MelodyTab.objects.create(melody=melody, instrument=saxophone, notation='la si do#', position=0)

        saxophone.delete()

        tabs = MelodyTab.objects.filter(melody=melody)
        assert tabs.count() == 1
        assert tabs.first().instrument == piano
        assert tabs.first().notation == 'do re mi'

    def test_melody_with_multiple_instruments_no_fallback_needed(self, user, piano, saxophone):
        melody = Melody.objects.create(user=user, title='Multi', notation='do re mi')
        MelodyTab.objects.create(melody=melody, instrument=piano, notation='do re mi', position=0)
        MelodyTab.objects.create(melody=melody, instrument=saxophone, notation='la si do#', position=1)

        saxophone.delete()

        tabs = MelodyTab.objects.filter(melody=melody)
        assert tabs.count() == 1
        assert tabs.first().instrument == piano

    def test_multiple_melodies_with_last_tab_all_get_fallback(self, user, piano, saxophone):
        m1 = Melody.objects.create(user=user, title='Song 1', notation='do re mi')
        m2 = Melody.objects.create(user=user, title='Song 2', notation='fa sol la')
        MelodyTab.objects.create(melody=m1, instrument=saxophone, notation='la si do#', position=0)
        MelodyTab.objects.create(melody=m2, instrument=saxophone, notation='re mi fa#', position=0)

        saxophone.delete()

        for melody in [m1, m2]:
            tabs = MelodyTab.objects.filter(melody=melody)
            assert tabs.count() == 1
            assert tabs.first().instrument == piano
