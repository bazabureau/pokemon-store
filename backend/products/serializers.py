from rest_framework import serializers

from .models import Category, Favorite, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "order", "is_active", "product_count")

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "order")


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    product_type_display = serializers.CharField(source="get_product_type_display", read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True, default=None)
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "price", "compare_price",
            "product_type", "product_type_display",
            "condition", "condition_display",
            "grade", "grading_company",
            "set_name", "rarity", "card_number", "language", "language_display",
            "is_active", "is_featured", "is_new", "in_stock", "stock_quantity",
            "category", "category_name",
            "image",
            "is_favorited",
            "created_at",
        )

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    product_type_display = serializers.CharField(source="get_product_type_display", read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True, default=None)
    grading_company_display = serializers.SerializerMethodField()
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "description", "price", "compare_price",
            "product_type", "product_type_display",
            "condition", "condition_display",
            "grade", "grading_company", "grading_company_display",
            "set_name", "rarity", "card_number", "language", "language_display",
            "is_active", "is_featured", "is_new", "in_stock", "stock_quantity",
            "category",
            "image", "image_2", "image_3", "images",
            "is_favorited",
            "created_at", "updated_at",
        )

    def get_grading_company_display(self, obj):
        return obj.get_grading_company_display() if obj.grading_company else None

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True,
    )

    class Meta:
        model = Favorite
        fields = ("id", "product", "product_id", "created_at")
        read_only_fields = ("id", "created_at")
