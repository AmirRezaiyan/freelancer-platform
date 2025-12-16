from django.urls import path
from .views import RegisterView, LoginView, ProfileView , UserPublicDetailView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("me/", ProfileView.as_view()),
    path("<int:pk>/", UserPublicDetailView.as_view()),
]