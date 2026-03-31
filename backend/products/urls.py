from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"favorites", views.FavoriteViewSet, basename="favorite")

urlpatterns = [
    path("", include(router.urls)),
]
