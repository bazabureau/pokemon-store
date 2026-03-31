from rest_framework import serializers

from products.models import Product
from products.serializers import ProductListSerializer

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True, in_stock=True),
        source="product", write_only=True,
    )
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity", "subtotal", "added_at")
        read_only_fields = ("id", "added_at")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total", "item_count", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product_name", "product_price", "quantity", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(source="get_payment_status_display", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "order_number", "status", "status_display",
            "email", "first_name", "last_name", "phone",
            "shipping_address", "shipping_city", "shipping_postal_code", "shipping_country",
            "shipping_method", "shipping_cost",
            "payment_method", "payment_status", "payment_status_display",
            "stripe_payment_intent_id",
            "coupon_code", "discount_amount",
            "subtotal", "total", "notes",
            "items",
            "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "order_number", "subtotal", "total", "created_at", "updated_at",
        )


class CheckoutSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, default="")
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=100)
    shipping_method = serializers.CharField(max_length=50, required=False, default="standard")
    payment_method = serializers.CharField(max_length=50, required=False, default="")
    notes = serializers.CharField(required=False, default="")
