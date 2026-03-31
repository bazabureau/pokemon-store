from django.db import models as db_models
from rest_framework import permissions, viewsets

from .models import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Review.objects.select_related("user", "product")
        product_id = self.request.query_params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id)
        if not self.request.user.is_staff:
            if self.request.user.is_authenticated:
                qs = qs.filter(
                    db_models.Q(status=Review.Status.APPROVED) | db_models.Q(user=self.request.user)
                )
            else:
                qs = qs.filter(status=Review.Status.APPROVED)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
