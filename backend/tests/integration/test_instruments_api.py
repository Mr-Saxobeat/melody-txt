"""Integration tests for the instruments API endpoint."""

import pytest
from rest_framework.test import APIClient
from rest_framework import status

from melodies.models import Instrument


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def seed_instruments():
    piano, _ = Instrument.objects.get_or_create(name='Piano', defaults={'pitch': 'C'})
    sax, _ = Instrument.objects.get_or_create(name='Saxophone', defaults={'pitch': 'Eb'})
    trumpet, _ = Instrument.objects.get_or_create(name='Trumpet', defaults={'pitch': 'Bb'})
    trombone, _ = Instrument.objects.get_or_create(name='Trombone', defaults={'pitch': 'C'})
    return piano, sax, trumpet, trombone


@pytest.mark.django_db
class TestInstrumentListEndpoint:

    def test_list_instruments_returns_200(self, api_client, seed_instruments):
        response = api_client.get('/api/instruments/')
        assert response.status_code == status.HTTP_200_OK

    def test_list_instruments_returns_all(self, api_client, seed_instruments):
        response = api_client.get('/api/instruments/')
        assert len(response.data) == 4

    def test_list_instruments_alphabetical_order(self, api_client, seed_instruments):
        response = api_client.get('/api/instruments/')
        names = [i['name'] for i in response.data]
        assert names == ['Piano', 'Saxophone', 'Trombone', 'Trumpet']

    def test_instrument_response_fields(self, api_client, seed_instruments):
        response = api_client.get('/api/instruments/')
        instrument = response.data[0]
        assert 'id' in instrument
        assert 'name' in instrument
        assert 'pitch' in instrument
        assert 'offset' in instrument

    def test_instruments_include_correct_offsets(self, api_client, seed_instruments):
        response = api_client.get('/api/instruments/')
        by_name = {i['name']: i for i in response.data}
        assert by_name['Piano']['offset'] == 0
        assert by_name['Saxophone']['offset'] == 9
        assert by_name['Trumpet']['offset'] == 2
        assert by_name['Trombone']['offset'] == 0

    def test_list_instruments_no_auth_required(self, api_client, seed_instruments):
        response = api_client.get('/api/instruments/')
        assert response.status_code == status.HTTP_200_OK

    def test_newly_added_instrument_appears(self, api_client, seed_instruments):
        Instrument.objects.create(name='Baritone Sax', pitch='Eb')
        response = api_client.get('/api/instruments/')
        assert len(response.data) == 5
        names = [i['name'] for i in response.data]
        assert 'Baritone Sax' in names
