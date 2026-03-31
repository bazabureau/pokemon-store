from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id", "product", "user", "username", "rating",
            "title", "comment", "status", "status_display",
            "created_at",
        )
        read_only_fields = ("id", "user", "status", "created_at")


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("product", "rating", "title", "comment")

    def validate(self, data):
        user = self.context["request"].user
        if Review.objects.filter(user=user, product=data["product"]).exists():
            raise serializers.ValidationError("You have already reviewed this product.")
        return data
