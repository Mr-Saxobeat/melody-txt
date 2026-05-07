"""Integration tests for authentication flow."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestRegistration:

    def test_register_user_success(self, api_client):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        response = api_client.post('/api/auth/register/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == 'newuser'
        assert response.data['email'] == 'new@example.com'
        assert 'id' in response.data
        assert 'password' not in response.data

    def test_register_duplicate_username(self, api_client):
        User.objects.create_user(
            username='taken', email='taken@example.com', password='Pass123!'
        )
        data = {
            'username': 'taken',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        response = api_client.post('/api/auth/register/', data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'weak',
            'password_confirm': 'weak',
        }
        response = api_client.post('/api/auth/register/', data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:

    def test_login_success(self, api_client):
        User.objects.create_user(
            username='testuser', email='test@example.com', password='TestPass123'
        )
        data = {'username': 'testuser', 'password': 'TestPass123'}
        response = api_client.post('/api/auth/token/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self, api_client):
        User.objects.create_user(
            username='testuser', email='test@example.com', password='TestPass123'
        )
        data = {'username': 'testuser', 'password': 'WrongPass'}
        response = api_client.post('/api/auth/token/', data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:

    def test_refresh_token_success(self, api_client):
        User.objects.create_user(
            username='testuser', email='test@example.com', password='TestPass123'
        )
        login_response = api_client.post(
            '/api/auth/token/',
            {'username': 'testuser', 'password': 'TestPass123'},
            format='json',
        )
        refresh_token = login_response.data['refresh']

        response = api_client.post(
            '/api/auth/token/refresh/',
            {'refresh': refresh_token},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_refresh_invalid_token(self, api_client):
        response = api_client.post(
            '/api/auth/token/refresh/',
            {'refresh': 'invalid-token'},
            format='json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
