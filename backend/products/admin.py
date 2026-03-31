from django.contrib import admin

from .models import Category, Favorite, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "product_type", "price", "condition", "set_name",
        "rarity", "language", "stock_quantity", "is_active", "is_featured", "is_new",
    )
    list_filter = (
        "product_type", "condition", "language", "grading_company",
        "is_active", "is_featured", "is_new", "in_stock", "category",
    )
    search_fields = ("name", "description", "set_name", "rarity", "card_number")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("is_active", "is_featured", "is_new", "price")
    inlines = [ProductImageInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "alt_text", "order")
    list_filter = ("product",)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "product__name")
