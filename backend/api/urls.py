from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, MelodyViewSet, SharedMelodyView, TransposeMelodyView,
    RecentMelodiesView,
    SetlistViewSet, SetlistEntryView, SharedSetlistView, RecentSetlistsView,
)

router = DefaultRouter()
router.register(r'melodies', MelodyViewSet, basename='melody')
router.register(r'setlists', SetlistViewSet, basename='setlist')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('melodies/recent/', RecentMelodiesView.as_view(), name='recent-melodies'),
    path('melodies/shared/<str:share_id>/', SharedMelodyView.as_view(), name='shared-melody'),
    path('melodies/<uuid:pk>/transpose/', TransposeMelodyView.as_view(), name='transpose-melody'),
    path('setlists/recent/', RecentSetlistsView.as_view(), name='recent-setlists'),
    path('setlists/shared/<str:share_id>/', SharedSetlistView.as_view(), name='shared-setlist'),
    path('setlists/<uuid:setlist_id>/entries/', SetlistEntryView.as_view(), name='setlist-entries'),
    path('setlists/<uuid:setlist_id>/entries/<uuid:entry_id>/', SetlistEntryView.as_view(), name='setlist-entry-detail'),
    path('', include(router.urls)),
]
