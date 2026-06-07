"""Integration tests for universal edit permissions — any authenticated user can CRUD any content."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from melodies.models import Melody, MelodyTab
from setlists.models import Setlist, SetlistEntry

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_a():
    return User.objects.create_user(
        username='user_a',
        email='a@example.com',
        password='TestPass123',
    )


@pytest.fixture
def user_b():
    return User.objects.create_user(
        username='user_b',
        email='b@example.com',
        password='TestPass123',
    )


@pytest.fixture
def client_b(api_client, user_b):
    api_client.force_authenticate(user=user_b)
    return api_client


@pytest.fixture
def melody_by_a(user_a):
    return Melody.objects.create(
        user=user_a,
        title='Song by A',
        notation='do re mi fa sol',
        key='C',
        is_public=True,
    )


@pytest.fixture
def setlist_by_a(user_a):
    return Setlist.objects.create(
        user=user_a,
        title='Setlist by A',
    )


@pytest.mark.django_db
class TestCrossUserMelodyCRUD:

    def test_user_b_can_list_all_melodies_including_a(self, client_b, user_b, melody_by_a):
        Melody.objects.create(user=user_b, title='Song by B', notation='do re mi')
        response = client_b.get('/api/melodies/')
        assert response.status_code == status.HTTP_200_OK
        titles = [m['title'] for m in response.data['results']]
        assert 'Song by A' in titles
        assert 'Song by B' in titles

    def test_user_b_can_retrieve_melody_by_a(self, client_b, melody_by_a):
        response = client_b.get(f'/api/melodies/{melody_by_a.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Song by A'

    def test_user_b_can_update_melody_by_a(self, client_b, melody_by_a):
        data = {
            'title': 'Updated by B',
            'notation': 'do re mi fa sol la',
            'key': 'G',
            'is_public': True,
        }
        response = client_b.put(f'/api/melodies/{melody_by_a.id}/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated by B'
        assert response.data['key'] == 'G'

    def test_user_b_can_delete_melody_by_a(self, client_b, melody_by_a):
        response = client_b.delete(f'/api/melodies/{melody_by_a.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Melody.objects.filter(id=melody_by_a.id).exists()

    def test_update_preserves_original_creator(self, client_b, melody_by_a, user_a):
        data = {
            'title': 'Updated by B',
            'notation': 'do re mi',
            'key': 'C',
            'is_public': True,
        }
        client_b.put(f'/api/melodies/{melody_by_a.id}/', data, format='json')
        melody_by_a.refresh_from_db()
        assert melody_by_a.user == user_a


@pytest.mark.django_db
class TestCrossUserSetlistCRUD:

    def test_user_b_can_list_all_setlists_including_a(self, client_b, user_b, setlist_by_a):
        Setlist.objects.create(user=user_b, title='Setlist by B')
        response = client_b.get('/api/setlists/')
        assert response.status_code == status.HTTP_200_OK
        titles = [s['title'] for s in response.data['results']]
        assert 'Setlist by A' in titles
        assert 'Setlist by B' in titles

    def test_user_b_can_retrieve_setlist_by_a(self, client_b, setlist_by_a):
        response = client_b.get(f'/api/setlists/{setlist_by_a.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Setlist by A'

    def test_user_b_can_update_setlist_by_a(self, client_b, setlist_by_a):
        data = {'title': 'Updated by B'}
        response = client_b.put(f'/api/setlists/{setlist_by_a.id}/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated by B'

    def test_user_b_can_delete_setlist_by_a(self, client_b, setlist_by_a):
        response = client_b.delete(f'/api/setlists/{setlist_by_a.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Setlist.objects.filter(id=setlist_by_a.id).exists()

    def test_update_preserves_original_creator(self, client_b, setlist_by_a, user_a):
        data = {'title': 'Updated by B'}
        client_b.put(f'/api/setlists/{setlist_by_a.id}/', data, format='json')
        setlist_by_a.refresh_from_db()
        assert setlist_by_a.user == user_a


@pytest.mark.django_db
class TestCrossUserTabCRUD:

    @pytest.fixture
    def melody_with_tab(self, melody_by_a):
        tab = MelodyTab.objects.create(
            melody=melody_by_a,
            instrument='piano',
            notation='do re mi fa sol',
            position=0,
        )
        return melody_by_a, tab

    def test_user_b_can_list_tabs_on_a_melody(self, client_b, melody_with_tab):
        melody, tab = melody_with_tab
        response = client_b.get(f'/api/melodies/{melody.id}/tabs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_user_b_can_add_tab_to_a_melody(self, client_b, melody_with_tab):
        melody, _ = melody_with_tab
        data = {
            'instrument': 'saxophone',
            'notation': 'la si do#',
            'position': 1,
            'source_instrument': 'piano',
        }
        response = client_b.post(f'/api/melodies/{melody.id}/tabs/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['instrument'] == 'saxophone'

    def test_user_b_can_update_tab_on_a_melody(self, client_b, melody_with_tab):
        melody, tab = melody_with_tab
        data = {'notation': 'fa sol la'}
        response = client_b.put(f'/api/melodies/{melody.id}/tabs/{tab.id}/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['notation'] == 'fa sol la'

    def test_user_b_can_delete_tab_on_a_melody(self, client_b, melody_with_tab):
        melody, tab = melody_with_tab
        MelodyTab.objects.create(
            melody=melody, instrument='trumpet', notation='re mi fa#', position=1
        )
        response = client_b.delete(f'/api/melodies/{melody.id}/tabs/{tab.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestCrossUserSetlistEntries:

    def test_user_b_can_add_entry_to_a_setlist(self, client_b, setlist_by_a, melody_by_a):
        data = {'melody_id': str(melody_by_a.id), 'position': 0}
        response = client_b.post(
            f'/api/setlists/{setlist_by_a.id}/entries/', data, format='json'
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_user_b_can_reorder_entry_in_a_setlist(self, client_b, setlist_by_a, melody_by_a):
        entry = SetlistEntry.objects.create(
            setlist=setlist_by_a, melody=melody_by_a, position=0
        )
        data = {'position': 5}
        response = client_b.put(
            f'/api/setlists/{setlist_by_a.id}/entries/{entry.id}/', data, format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['position'] == 5

    def test_user_b_can_remove_entry_from_a_setlist(self, client_b, setlist_by_a, melody_by_a):
        entry = SetlistEntry.objects.create(
            setlist=setlist_by_a, melody=melody_by_a, position=0
        )
        response = client_b.delete(
            f'/api/setlists/{setlist_by_a.id}/entries/{entry.id}/'
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not SetlistEntry.objects.filter(id=entry.id).exists()


@pytest.mark.django_db
class TestUnauthenticatedStillBlocked:

    def test_unauthenticated_cannot_update_melody(self, api_client, melody_by_a):
        data = {'title': 'Hacked', 'notation': 'do', 'key': 'C', 'is_public': True}
        response = api_client.put(f'/api/melodies/{melody_by_a.id}/', data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_delete_melody(self, api_client, melody_by_a):
        response = api_client.delete(f'/api/melodies/{melody_by_a.id}/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_update_setlist(self, api_client, setlist_by_a):
        data = {'title': 'Hacked'}
        response = api_client.put(f'/api/setlists/{setlist_by_a.id}/', data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_delete_setlist(self, api_client, setlist_by_a):
        response = api_client.delete(f'/api/setlists/{setlist_by_a.id}/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_add_tab(self, api_client, melody_by_a):
        data = {'instrument': 'piano', 'notation': 'do'}
        response = api_client.post(
            f'/api/melodies/{melody_by_a.id}/tabs/', data, format='json'
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_cannot_add_setlist_entry(self, api_client, setlist_by_a, melody_by_a):
        data = {'melody_id': str(melody_by_a.id), 'position': 0}
        response = api_client.post(
            f'/api/setlists/{setlist_by_a.id}/entries/', data, format='json'
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
