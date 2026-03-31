from rest_framework import serializers

from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = (
            "id", "code", "discount_type", "discount_value",
            "minimum_order_amount", "expiration_date",
            "is_active", "is_valid", "usage_count", "max_uses",
            "created_at",
        )
        read_only_fields = ("id", "usage_count", "created_at")


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
