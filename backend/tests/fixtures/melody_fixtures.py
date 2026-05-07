import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user_factory(db):
    """Factory fixture for creating users."""

    def create_user(
        username='testuser',
        email='test@example.com',
        password='TestPass123',
        **kwargs
    ):
        """Create and return a user."""
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            **kwargs
        )

    return create_user


@pytest.fixture
def test_user(user_factory):
    """Create a single test user."""
    return user_factory(
        username='testuser',
        email='test@example.com',
        password='TestPass123'
    )


@pytest.fixture
def admin_user(user_factory):
    """Create an admin/superuser."""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='AdminPass123'
    )


# Melody fixtures will be added when Melody model is created in Phase 4
