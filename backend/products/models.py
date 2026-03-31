from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, default="")
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    class ProductType(models.TextChoices):
        SINGLE_CARD = "single_card", "Single Card"
        SLAB = "slab", "Graded Slab"
        SEALED = "sealed", "Sealed Product"
        PROTECTION = "protection", "Protection"
        STORAGE = "storage", "Storage"

    class Condition(models.TextChoices):
        NEAR_MINT = "near_mint", "Near Mint"
        EXCELLENT = "excellent", "Excellent"
        LIGHT_PLAYED = "light_played", "Light Played"
        PLAYED = "played", "Played"

    class GradingCompany(models.TextChoices):
        PSA = "PSA", "PSA"
        CGC = "CGC", "CGC"
        BECKETT = "Beckett", "Beckett"

    class Language(models.TextChoices):
        ENGLISH = "english", "English"
        JAPANESE = "japanese", "Japanese"
        KOREAN = "korean", "Korean"
        CHINESE = "chinese", "Chinese"

    # Core
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_price = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="Original price for sale display",
    )

    # Pokemon specific
    product_type = models.CharField(max_length=20, choices=ProductType.choices, default=ProductType.SINGLE_CARD)
    condition = models.CharField(max_length=20, choices=Condition.choices, blank=True, null=True)
    grade = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True, help_text="Grading score (e.g. 9.5)")
    grading_company = models.CharField(max_length=10, choices=GradingCompany.choices, blank=True, null=True)
    set_name = models.CharField(max_length=100, blank=True, default="", help_text="Pokemon set name")
    rarity = models.CharField(max_length=50, blank=True, default="")
    card_number = models.CharField(max_length=20, blank=True, null=True)
    language = models.CharField(max_length=10, choices=Language.choices, default=Language.ENGLISH)

    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=1)

    # Relations
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")

    # Media
    image = models.ImageField(upload_to="products/")
    image_2 = models.ImageField(upload_to="products/", blank=True, null=True)
    image_3 = models.ImageField(upload_to="products/", blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            original_slug = self.slug
            counter = 1
            while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=200, blank=True, default="")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
