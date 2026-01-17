# backend/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import TelegramLinkView, LoginView, LogoutView, whoami

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(
    r'tasks/(?P<task_pk>[^/.]+)/comments',
    views.CommentViewSet,
    basename='task-comments'
)
router.register(
    r'tasks/(?P<task_pk>[^/.]+)/attachments',
    views.AttachmentViewSet,
    basename='task-attachments'
)

urlpatterns = [
    path('', include(router.urls)),
    path('telegram/link/', TelegramLinkView.as_view(), name='telegram-link'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('whoami/', whoami, name='whoami'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)