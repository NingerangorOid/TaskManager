from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'tasks/(?P<task_pk>[^/.]+)/comments', views.CommentViewSet, basename='task-comments')
router.register(r'tasks/(?P<task_pk>[^/.]+)/attachments', views.AttachmentViewSet, basename='task-attachments')

urlpatterns = [
    path('', include(router.urls)),
]