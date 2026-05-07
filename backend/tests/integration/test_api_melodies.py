"""Integration tests for melody CRUD API."""

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
def other_user():
    return User.objects.create_user(
        username='otheruser',
        email='other@example.com',
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
        notation='do re mi fa sol',
        key='C',
        is_public=True,
    )


@pytest.mark.django_db
class TestCreateMelody:

    def test_create_melody_authenticated(self, authenticated_client):
        data = {
            'title': 'My Song',
            'notation': 'do re mi fa sol la si',
            'key': 'C',
            'is_public': True,
        }
        response = authenticated_client.post('/api/melodies/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'My Song'
        assert response.data['notation'] == 'do re mi fa sol la si'
        assert response.data['note_count'] == 7
        assert response.data['duration_seconds'] == 3.5
        assert 'share_id' in response.data
        assert len(response.data['share_id']) == 12

    def test_create_melody_anonymous_returns_401(self, api_client):
        data = {
            'title': 'My Song',
            'notation': 'do re mi',
            'key': 'C',
        }
        response = api_client.post('/api/melodies/', data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_melody_with_lyrics_is_valid(self, authenticated_client):
        data = {
            'title': 'Song with Lyrics',
            'notation': 'do re mi\nHappy birthday\nfa sol la',
            'key': 'C',
        }
        response = authenticated_client.post('/api/melodies/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_melody_empty_title(self, authenticated_client):
        data = {
            'title': '',
            'notation': 'do re mi',
            'key': 'C',
        }
        response = authenticated_client.post('/api/melodies/', data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_melody_default_key(self, authenticated_client):
        data = {
            'title': 'No Key',
            'notation': 'do re mi',
        }
        response = authenticated_client.post('/api/melodies/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['key'] == 'C'


@pytest.mark.django_db
class TestListMelodies:

    def test_list_user_melodies(self, authenticated_client, user):
        Melody.objects.create(user=user, title='Song 1', notation='do re mi')
        Melody.objects.create(user=user, title='Song 2', notation='fa sol la')

        response = authenticated_client.get('/api/melodies/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_list_only_own_melodies(self, authenticated_client, user, other_user):
        Melody.objects.create(user=user, title='Mine', notation='do re mi')
        Melody.objects.create(user=other_user, title='Theirs', notation='fa sol la')

        response = authenticated_client.get('/api/melodies/')
        assert response.data['count'] == 1
        assert response.data['results'][0]['title'] == 'Mine'

    def test_list_melodies_ordering(self, authenticated_client, user):
        Melody.objects.create(user=user, title='First', notation='do')
        Melody.objects.create(user=user, title='Second', notation='re')

        response = authenticated_client.get('/api/melodies/')
        assert response.data['results'][0]['title'] == 'Second'

    def test_list_melodies_unauthenticated(self, api_client):
        response = api_client.get('/api/melodies/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestRetrieveMelody:

    def test_get_own_melody(self, authenticated_client, melody):
        response = authenticated_client.get(f'/api/melodies/{melody.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Test Melody'

    def test_get_other_user_melody_returns_404(self, authenticated_client, other_user):
        other_melody = Melody.objects.create(
            user=other_user, title='Other', notation='do re'
        )
        response = authenticated_client.get(f'/api/melodies/{other_melody.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestUpdateMelody:

    def test_update_own_melody(self, authenticated_client, melody):
        data = {
            'title': 'Updated Title',
            'notation': 'do re mi fa',
            'key': 'G',
            'is_public': False,
        }
        response = authenticated_client.put(
            f'/api/melodies/{melody.id}/', data, format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'
        assert response.data['key'] == 'G'
        assert response.data['note_count'] == 4

    def test_update_other_user_melody_returns_404(self, authenticated_client, other_user):
        other_melody = Melody.objects.create(
            user=other_user, title='Other', notation='do re'
        )
        data = {'title': 'Hacked', 'notation': 'do re mi', 'key': 'C', 'is_public': True}
        response = authenticated_client.put(
            f'/api/melodies/{other_melody.id}/', data, format='json'
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestDeleteMelody:

    def test_delete_own_melody(self, authenticated_client, melody):
        response = authenticated_client.delete(f'/api/melodies/{melody.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Melody.objects.filter(id=melody.id).exists()

    def test_delete_other_user_melody_returns_404(self, authenticated_client, other_user):
        other_melody = Melody.objects.create(
            user=other_user, title='Other', notation='do re'
        )
        response = authenticated_client.delete(f'/api/melodies/{other_melody.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestSharedMelody:

    def test_get_shared_melody_public(self, api_client, melody):
        response = api_client.get(f'/api/melodies/shared/{melody.share_id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Test Melody'
        assert response.data['notation'] == 'do re mi fa sol'
        assert 'author' in response.data
        assert response.data['author']['username'] == 'testuser'
        assert 'is_public' not in response.data
        assert 'updated_at' not in response.data

    def test_get_shared_melody_private_returns_404(self, api_client, user):
        private_melody = Melody.objects.create(
            user=user,
            title='Private',
            notation='do re mi',
            is_public=False,
        )
        response = api_client.get(f'/api/melodies/shared/{private_melody.share_id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_shared_melody_nonexistent_returns_404(self, api_client):
        response = api_client.get('/api/melodies/shared/nonexistent1/')
        assert response.status_code == status.HTTP_404_NOT_FOUND
