"""Integration tests for melody search API endpoint."""

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
        username='searchuser',
        email='search@example.com',
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


@pytest.mark.django_db
class TestMelodySearch:

    def test_requires_authentication(self, api_client):
        response = api_client.get('/api/melodies/search/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_returns_own_melodies(self, authenticated_client, user):
        Melody.objects.create(
            user=user, title='My Song', notation='do re mi', is_public=False
        )
        response = authenticated_client.get('/api/melodies/search/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'My Song'

    def test_returns_public_melodies_from_others(self, authenticated_client, user, other_user):
        Melody.objects.create(
            user=other_user, title='Public Song', notation='do re mi', is_public=True
        )
        Melody.objects.create(
            user=other_user, title='Private Song', notation='fa sol la', is_public=False
        )
        response = authenticated_client.get('/api/melodies/search/')
        assert response.status_code == status.HTTP_200_OK
        titles = [m['title'] for m in response.data['results']]
        assert 'Public Song' in titles
        assert 'Private Song' not in titles

    def test_search_filters_by_title(self, authenticated_client, user, other_user):
        Melody.objects.create(
            user=user, title='Bossa Nova', notation='do re mi', is_public=True
        )
        Melody.objects.create(
            user=other_user, title='Jazz Waltz', notation='fa sol la', is_public=True
        )
        response = authenticated_client.get('/api/melodies/search/', {'search': 'bossa'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Bossa Nova'

    def test_deduplicates_own_public_melodies(self, authenticated_client, user):
        Melody.objects.create(
            user=user, title='My Public Song', notation='do re mi', is_public=True
        )
        response = authenticated_client.get('/api/melodies/search/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_empty_search_returns_all_accessible(self, authenticated_client, user, other_user):
        Melody.objects.create(
            user=user, title='Own Song', notation='do re mi', is_public=False
        )
        Melody.objects.create(
            user=other_user, title='Public Song', notation='fa sol la', is_public=True
        )
        response = authenticated_client.get('/api/melodies/search/', {'search': ''})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2

    def test_results_are_cursor_paginated(self, authenticated_client, user):
        for i in range(25):
            Melody.objects.create(
                user=user, title=f'Song {i:02d}', notation='do re mi', is_public=True
            )
        response = authenticated_client.get('/api/melodies/search/')
        assert response.status_code == status.HTTP_200_OK
        assert 'next' in response.data
        assert 'previous' in response.data
        assert 'results' in response.data
        assert len(response.data['results']) == 20

    def test_results_ordered_by_created_at_descending(self, authenticated_client, user):
        m1 = Melody.objects.create(
            user=user, title='First', notation='do re mi', is_public=True
        )
        m2 = Melody.objects.create(
            user=user, title='Second', notation='fa sol la', is_public=True
        )
        response = authenticated_client.get('/api/melodies/search/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['results'][0]['title'] == 'Second'
        assert response.data['results'][1]['title'] == 'First'
