from rest_framework import serializers

from .models import CardSubmission, SubmissionImage


class SubmissionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionImage
        fields = ("id", "image", "created_at")
        read_only_fields = ("id", "created_at")


class CardSubmissionSerializer(serializers.ModelSerializer):
    images = SubmissionImageSerializer(many=True, read_only=True)

    class Meta:
        model = CardSubmission
        fields = (
            "id", "name", "email", "phone",
            "card_name", "set_name", "condition", "quantity",
            "description", "estimated_value",
            "status", "admin_notes", "offer_amount",
            "images", "created_at",
        )
        read_only_fields = ("id", "status", "admin_notes", "offer_amount", "created_at")
