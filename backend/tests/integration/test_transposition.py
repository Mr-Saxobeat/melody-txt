"""Integration tests for melody transposition endpoint."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from melodies.models import Melody

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='TestPass123',
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def melody(user):
    return Melody.objects.create(
        user=user,
        title='Test Melody',
        notation='do re mi fa sol la si',
        key='C',
    )


@pytest.mark.django_db
class TestTransposeMelody:

    def test_transpose_melody_to_g(self, authenticated_client, melody):
        response = authenticated_client.post(
            f'/api/melodies/{melody.id}/transpose/',
            {'target_key': 'G'},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['original_key'] == 'C'
        assert response.data['target_key'] == 'G'
        assert response.data['notation'] == 'do re mi fa sol la si'
        assert len(response.data['transposed_pitches']) == 7
        assert response.data['transposed_pitches'][0]['pitch'] == 'G4'
        assert response.data['transposed_pitches'][0]['solfege'] == 'do'

    def test_transpose_does_not_modify_melody(self, authenticated_client, melody):
        authenticated_client.post(
            f'/api/melodies/{melody.id}/transpose/',
            {'target_key': 'G'},
            format='json',
        )
        melody.refresh_from_db()
        assert melody.key == 'C'

    def test_transpose_invalid_key(self, authenticated_client, melody):
        response = authenticated_client.post(
            f'/api/melodies/{melody.id}/transpose/',
            {'target_key': 'X'},
            format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_transpose_missing_key(self, authenticated_client, melody):
        response = authenticated_client.post(
            f'/api/melodies/{melody.id}/transpose/',
            {},
            format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_transpose_unauthenticated(self, api_client, melody):
        response = api_client.post(
            f'/api/melodies/{melody.id}/transpose/',
            {'target_key': 'G'},
            format='json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_transpose_other_user_melody(self, authenticated_client):
        other_user = User.objects.create_user(
            username='other', email='other@example.com', password='TestPass123'
        )
        other_melody = Melody.objects.create(
            user=other_user, title='Other', notation='do re mi', key='C'
        )
        response = authenticated_client.post(
            f'/api/melodies/{other_melody.id}/transpose/',
            {'target_key': 'G'},
            format='json',
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_transpose_returns_frequencies(self, authenticated_client, melody):
        response = authenticated_client.post(
            f'/api/melodies/{melody.id}/transpose/',
            {'target_key': 'C'},
            format='json',
        )
        pitches = response.data['transposed_pitches']
        # la in C major should be A4 = 440Hz
        la_entry = pitches[5]
        assert la_entry['solfege'] == 'la'
        assert la_entry['frequency'] == 440.0
