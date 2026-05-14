import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_username(self, value):
        """Validate username meets requirements."""
        if len(value) < 3 or len(value) > 150:
            raise serializers.ValidationError(
                "Username must be between 3 and 150 characters."
            )

        if not re.match(r'^[a-zA-Z0-9_-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, underscores, and hyphens."
            )

        if value.startswith(('_', '-')):
            raise serializers.ValidationError(
                "Username cannot start with underscore or hyphen."
            )

        # Case-insensitive uniqueness check
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_email(self, value):
        """Validate email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )
        return value

    def validate_password(self, value):
        """Validate password strength."""
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        if not any(char.islower() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )
        return value

    def validate(self, attrs):
        """Validate password confirmation matches."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']


class MelodyTabSerializer(serializers.ModelSerializer):
    """Serializer for instrument tabs."""

    class Meta:
        model = None  # Set below after import
        fields = ['id', 'instrument', 'notation', 'position', 'suffix', 'created_at']
        read_only_fields = ['id', 'created_at']


class MelodySerializer(serializers.ModelSerializer):
    """Full melody serializer for CRUD operations."""

    tabs = MelodyTabSerializer(many=True, read_only=True)

    class Meta:
        model = None  # Set below after import
        fields = [
            'id', 'title', 'notation', 'key', 'share_id',
            'is_public', 'created_at', 'updated_at',
            'note_count', 'duration_seconds', 'tabs',
        ]
        read_only_fields = ['id', 'share_id', 'created_at', 'updated_at', 'note_count', 'duration_seconds']

    def validate_notation(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Notation cannot be empty.')
        return value

    def validate_key(self, value):
        from melodies.models import Melody
        if value and value not in Melody.VALID_KEYS:
            raise serializers.ValidationError(
                f'Key must be one of: {", ".join(Melody.VALID_KEYS)}'
            )
        return value


class SharedMelodySerializer(serializers.ModelSerializer):
    """Public-facing serializer for shared melodies (excludes private fields)."""

    author = serializers.SerializerMethodField()
    tabs = MelodyTabSerializer(many=True, read_only=True)

    class Meta:
        model = None  # Set below after import
        fields = [
            'id', 'title', 'notation', 'key', 'share_id',
            'created_at', 'note_count', 'duration_seconds', 'author', 'tabs',
        ]

    def get_author(self, obj):
        if obj.user:
            return {'username': obj.user.username}
        return None


class SetlistEntrySerializer(serializers.ModelSerializer):
    melody_title = serializers.CharField(source='melody.title', read_only=True)
    melody_notation = serializers.CharField(source='melody.notation', read_only=True)
    melody_id = serializers.UUIDField(source='melody.id', read_only=True)
    melody_share_id = serializers.CharField(source='melody.share_id', read_only=True)
    melody_author = serializers.SerializerMethodField()

    class Meta:
        model = None
        fields = ['id', 'melody_id', 'melody_title', 'melody_notation', 'melody_share_id', 'melody_author', 'position', 'added_at']
        read_only_fields = ['id', 'added_at']

    def get_melody_author(self, obj):
        if obj.melody and obj.melody.user:
            return obj.melody.user.username
        return None


class SetlistSerializer(serializers.ModelSerializer):
    entries = SetlistEntrySerializer(many=True, read_only=True)
    entry_count = serializers.SerializerMethodField()

    class Meta:
        model = None
        fields = ['id', 'title', 'share_id', 'is_public', 'created_at', 'updated_at', 'entries', 'entry_count']
        read_only_fields = ['id', 'share_id', 'created_at', 'updated_at']

    def get_entry_count(self, obj):
        return obj.entries.count()


class SetlistListSerializer(serializers.ModelSerializer):
    entry_count = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta:
        model = None
        fields = ['id', 'title', 'share_id', 'is_public', 'created_at', 'entry_count', 'author']
        read_only_fields = ['id', 'share_id', 'created_at']

    def get_entry_count(self, obj):
        return obj.entries.count()

    def get_author(self, obj):
        if obj.user:
            return {'username': obj.user.username}
        return None


class SharedSetlistSerializer(serializers.ModelSerializer):
    entries = SetlistEntrySerializer(many=True, read_only=True)
    author = serializers.SerializerMethodField()

    class Meta:
        model = None
        fields = ['id', 'title', 'share_id', 'created_at', 'entries', 'author']

    def get_author(self, obj):
        if obj.user:
            return {'username': obj.user.username}
        return None


class SiteSettingsSerializer(serializers.Serializer):
    site_title = serializers.CharField()
    tab_title = serializers.CharField()
    primary_color = serializers.CharField()
    header_background_color = serializers.CharField()
    logo_text_color = serializers.CharField()
    main_background_color = serializers.CharField()
    logo_font_family = serializers.CharField(allow_blank=True)
    logo_font_size = serializers.CharField()
    header_gradient = serializers.CharField(allow_blank=True)


# Deferred model assignment to avoid circular imports
def _set_models():
    from melodies.models import Melody, MelodyTab
    from setlists.models import Setlist, SetlistEntry
    MelodyTabSerializer.Meta.model = MelodyTab
    MelodySerializer.Meta.model = Melody
    SharedMelodySerializer.Meta.model = Melody
    SetlistEntrySerializer.Meta.model = SetlistEntry
    SetlistSerializer.Meta.model = Setlist
    SetlistListSerializer.Meta.model = Setlist
    SharedSetlistSerializer.Meta.model = Setlist


_set_models()
