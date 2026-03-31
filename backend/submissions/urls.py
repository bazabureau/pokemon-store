from django.urls import path

from . import views

urlpatterns = [
    path("submissions/", views.CardSubmissionCreateView.as_view(), name="create-submission"),
]
