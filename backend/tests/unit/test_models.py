"""Unit tests for Melody model."""

import pytest
from django.contrib.auth import get_user_model
from melodies.models import Melody
from melodies.utils import generate_share_id

User = get_user_model()


@pytest.mark.django_db
class TestMelodyModel:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123',
        )

    def test_melody_creation_with_user(self, user):
        melody = Melody(
            user=user,
            title='Test Melody',
            notation='do re mi fa sol',
            key='C',
        )
        melody.save()

        assert melody.id is not None
        assert melody.user == user
        assert melody.title == 'Test Melody'
        assert melody.notation == 'do re mi fa sol'
        assert melody.key == 'C'
        assert melody.is_public is True

    def test_melody_note_count_calculation(self, user):
        melody = Melody(user=user, title='Test', notation='do re mi fa sol')
        melody.save()
        assert melody.note_count == 5

    def test_melody_duration_calculation(self, user):
        melody = Melody(user=user, title='Test', notation='do re mi fa sol')
        melody.save()
        assert melody.duration_seconds == 2.5

    def test_melody_note_count_single_note(self, user):
        melody = Melody(user=user, title='One', notation='do')
        melody.save()
        assert melody.note_count == 1
        assert melody.duration_seconds == 0.5

    def test_share_id_auto_generated(self, user):
        melody = Melody(user=user, title='Test', notation='do re mi')
        melody.save()
        assert melody.share_id is not None
        assert len(melody.share_id) == 12

    def test_share_id_unique(self, user):
        m1 = Melody(user=user, title='First', notation='do re mi')
        m1.save()
        m2 = Melody(user=user, title='Second', notation='fa sol la')
        m2.save()
        assert m1.share_id != m2.share_id

    def test_share_id_url_safe_characters(self, user):
        melody = Melody(user=user, title='Test', notation='do re mi')
        melody.save()
        import string
        valid_chars = set(string.ascii_letters + string.digits + '_-')
        assert all(c in valid_chars for c in melody.share_id)

    def test_share_id_not_overwritten_on_update(self, user):
        melody = Melody(user=user, title='Test', notation='do re mi')
        melody.save()
        original_share_id = melody.share_id

        melody.title = 'Updated'
        melody.save()
        assert melody.share_id == original_share_id

    def test_melody_ordering_by_created_at_desc(self, user):
        m1 = Melody(user=user, title='First', notation='do')
        m1.save()
        m2 = Melody(user=user, title='Second', notation='re')
        m2.save()

        melodies = list(Melody.objects.all())
        assert melodies[0].title == 'Second'
        assert melodies[1].title == 'First'

    def test_melody_str_returns_title(self, user):
        melody = Melody(user=user, title='My Song', notation='do re mi')
        melody.save()
        assert str(melody) == 'My Song'


@pytest.mark.django_db
class TestGenerateShareId:

    def test_generates_12_char_string(self):
        share_id = generate_share_id()
        assert len(share_id) == 12

    def test_generates_url_safe_chars(self):
        import string
        valid_chars = set(string.ascii_letters + string.digits + '_-')
        share_id = generate_share_id()
        assert all(c in valid_chars for c in share_id)

    def test_generates_unique_ids(self):
        ids = {generate_share_id() for _ in range(100)}
        assert len(ids) == 100
