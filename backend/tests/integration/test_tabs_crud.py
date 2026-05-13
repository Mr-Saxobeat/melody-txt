"""Integration tests for melody tab CRUD — min-1 delete constraint."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from melodies.models import Melody, MelodyTab

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username='tabuser',
        email='tabuser@example.com',
        password='TestPass123',
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def melody_with_one_tab(user):
    melody = Melody.objects.create(
        user=user,
        title='Single Tab Melody',
        notation='do re mi',
        key='C',
        is_public=True,
    )
    tab = MelodyTab.objects.create(
        melody=melody,
        instrument='piano',
        notation='do re mi',
        position=0,
    )
    return melody, tab


@pytest.fixture
def melody_with_two_tabs(user):
    melody = Melody.objects.create(
        user=user,
        title='Two Tab Melody',
        notation='do re mi',
        key='C',
        is_public=True,
    )
    tab1 = MelodyTab.objects.create(
        melody=melody,
        instrument='piano',
        notation='do re mi',
        position=0,
    )
    tab2 = MelodyTab.objects.create(
        melody=melody,
        instrument='saxophone',
        notation='la si do#',
        position=1,
    )
    return melody, tab1, tab2


@pytest.mark.django_db
class TestTabDeleteConstraint:
    def test_delete_last_tab_returns_400(self, authenticated_client, melody_with_one_tab):
        melody, tab = melody_with_one_tab
        response = authenticated_client.delete(f'/api/melodies/{melody.id}/tabs/{tab.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Cannot delete the last tab' in response.data['detail']
        assert MelodyTab.objects.filter(melody=melody).count() == 1

    def test_delete_tab_with_two_tabs_succeeds(self, authenticated_client, melody_with_two_tabs):
        melody, tab1, tab2 = melody_with_two_tabs
        response = authenticated_client.delete(f'/api/melodies/{melody.id}/tabs/{tab2.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert MelodyTab.objects.filter(melody=melody).count() == 1
        assert MelodyTab.objects.filter(id=tab1.id).exists()
        assert not MelodyTab.objects.filter(id=tab2.id).exists()

    def test_delete_first_tab_with_two_tabs_succeeds(self, authenticated_client, melody_with_two_tabs):
        melody, tab1, tab2 = melody_with_two_tabs
        response = authenticated_client.delete(f'/api/melodies/{melody.id}/tabs/{tab1.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert MelodyTab.objects.filter(melody=melody).count() == 1
