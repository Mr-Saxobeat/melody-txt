from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    MelodySerializer,
    SharedMelodySerializer,
    SetlistSerializer,
    SetlistListSerializer,
    SetlistEntrySerializer,
    SharedSetlistSerializer,
)
from melodies.models import Melody
from setlists.models import Setlist, SetlistEntry


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""

    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED
        )


class MelodyViewSet(viewsets.ModelViewSet):
    """CRUD operations for user melodies."""

    serializer_class = MelodySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Melody.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SharedMelodyView(generics.RetrieveAPIView):
    """Public endpoint to access shared melodies."""

    serializer_class = SharedMelodySerializer
    permission_classes = [AllowAny]
    lookup_field = 'share_id'

    def get_queryset(self):
        return Melody.objects.filter(is_public=True)


class RecentMelodiesView(generics.ListAPIView):
    """Public endpoint listing recent public melodies."""

    serializer_class = SharedMelodySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Melody.objects.filter(is_public=True).order_by('-created_at')[:50]


class TransposeMelodyView(generics.GenericAPIView):
    """Transpose a melody to a different key (read-only computation)."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Melody.objects.filter(user=self.request.user)

    def post(self, request, pk):
        from melodies.utils import transpose_solfege_to_key

        melody = self.get_queryset().filter(pk=pk).first()
        if not melody:
            return Response(
                {'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND
            )

        target_key = request.data.get('target_key')
        if not target_key or target_key not in Melody.VALID_KEYS:
            return Response(
                {'target_key': f'Must be one of: {", ".join(Melody.VALID_KEYS)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transposed = transpose_solfege_to_key(melody.notation, melody.key, target_key)

        return Response({
            'original_key': melody.key,
            'target_key': target_key,
            'notation': melody.notation,
            'transposed_pitches': transposed,
        })


class SetlistViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return SetlistListSerializer
        return SetlistSerializer

    def get_queryset(self):
        return Setlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SetlistEntryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_setlist(self, request, setlist_id):
        return Setlist.objects.filter(id=setlist_id, user=request.user).first()

    def post(self, request, setlist_id):
        setlist = self.get_setlist(request, setlist_id)
        if not setlist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        melody_id = request.data.get('melody_id')
        position = request.data.get('position', setlist.entries.count())

        from django.db.models import Q
        melody = Melody.objects.filter(
            Q(id=melody_id) & (Q(user=request.user) | Q(is_public=True))
        ).first()
        if not melody:
            return Response({'detail': 'Melody not found.'}, status=status.HTTP_404_NOT_FOUND)

        if setlist.entries.count() >= 100:
            return Response({'detail': 'Maximum 100 entries per setlist.'}, status=status.HTTP_400_BAD_REQUEST)

        entry = SetlistEntry.objects.create(setlist=setlist, melody=melody, position=position)
        serializer = SetlistEntrySerializer(entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, setlist_id, entry_id=None):
        setlist = self.get_setlist(request, setlist_id)
        if not setlist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        entry = setlist.entries.filter(id=entry_id).first()
        if not entry:
            return Response({'detail': 'Entry not found.'}, status=status.HTTP_404_NOT_FOUND)

        position = request.data.get('position')
        if position is not None:
            entry.position = position
            entry.save()

        serializer = SetlistEntrySerializer(entry)
        return Response(serializer.data)

    def delete(self, request, setlist_id, entry_id=None):
        setlist = self.get_setlist(request, setlist_id)
        if not setlist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        entry = setlist.entries.filter(id=entry_id).first()
        if not entry:
            return Response({'detail': 'Entry not found.'}, status=status.HTTP_404_NOT_FOUND)

        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecentSetlistsView(generics.ListAPIView):
    """Public endpoint listing recent public setlists."""

    serializer_class = SetlistListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Setlist.objects.filter(is_public=True).order_by('-created_at')[:50]


class SharedSetlistView(generics.RetrieveAPIView):
    serializer_class = SharedSetlistSerializer
    permission_classes = [AllowAny]
    lookup_field = 'share_id'

    def get_queryset(self):
        return Setlist.objects.filter(is_public=True)
