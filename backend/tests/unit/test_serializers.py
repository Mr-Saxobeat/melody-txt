"""Unit tests for API serializers."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from api.serializers import (
    UserRegistrationSerializer,
    MelodySerializer,
    SharedMelodySerializer,
)
from melodies.models import Melody

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistrationSerializer:

    def test_valid_registration_data(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_rejects_short_username(self):
        data = {
            'username': 'ab',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors

    def test_rejects_invalid_username_chars(self):
        data = {
            'username': 'user name!',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors

    def test_rejects_username_starting_with_underscore(self):
        data = {
            'username': '_badname',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors

    def test_rejects_password_without_uppercase(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'weakpass1',
            'password_confirm': 'weakpass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_rejects_password_without_number(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'NoNumberHere',
            'password_confirm': 'NoNumberHere',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_rejects_mismatched_passwords(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'DifferentPass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()

    def test_rejects_duplicate_username(self):
        User.objects.create_user(
            username='existing', email='exist@example.com', password='Pass123!'
        )
        data = {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'StrongPass1',
            'password_confirm': 'StrongPass1',
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors


@pytest.mark.django_db
class TestMelodySerializer:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            username='testuser', email='test@example.com', password='TestPass123'
        )

    def test_valid_melody_data(self, user):
        data = {
            'title': 'My Song',
            'notation': 'do re mi fa sol',
            'key': 'C',
            'is_public': True,
        }
        serializer = MelodySerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_accepts_lyrics_mixed_with_notes(self):
        data = {
            'title': 'Mixed Song',
            'notation': 'do re mi\nHappy birthday\nfa sol la',
            'key': 'C',
            'is_public': True,
        }
        serializer = MelodySerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_rejects_empty_notation(self):
        data = {
            'title': 'Empty',
            'notation': '',
            'key': 'C',
        }
        serializer = MelodySerializer(data=data)
        assert not serializer.is_valid()

    def test_rejects_invalid_key(self):
        data = {
            'title': 'Test',
            'notation': 'do re mi',
            'key': 'X',
        }
        serializer = MelodySerializer(data=data)
        assert not serializer.is_valid()
        assert 'key' in serializer.errors

    def test_share_id_is_readonly(self, user):
        melody = Melody.objects.create(
            user=user, title='Test', notation='do re mi'
        )
        serializer = MelodySerializer(melody)
        assert 'share_id' in serializer.data
        assert serializer.data['share_id'] == melody.share_id


@pytest.mark.django_db
class TestSharedMelodySerializer:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            username='testuser', email='test@example.com', password='TestPass123'
        )

    def test_excludes_private_fields(self, user):
        melody = Melody.objects.create(
            user=user, title='Public Song', notation='do re mi', is_public=True
        )
        serializer = SharedMelodySerializer(melody)
        assert 'is_public' not in serializer.data
        assert 'updated_at' not in serializer.data

    def test_includes_author(self, user):
        melody = Melody.objects.create(
            user=user, title='Song', notation='do re mi'
        )
        serializer = SharedMelodySerializer(melody)
        assert serializer.data['author'] == {'username': 'testuser'}

    def test_author_none_when_no_user(self):
        melody = Melody.objects.create(
            user=None, title='Orphan', notation='do re mi'
        )
        serializer = SharedMelodySerializer(melody)
        assert serializer.data['author'] is None
