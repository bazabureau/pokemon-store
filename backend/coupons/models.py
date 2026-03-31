from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FIXED = "fixed", "Fixed Amount"

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expiration_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    usage_count = models.PositiveIntegerField(default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        if self.discount_type == self.DiscountType.PERCENTAGE:
            return f"{self.code} ({self.discount_value}%)"
        return f"{self.code} ({self.discount_value} PLN)"

    @property
    def is_valid(self):
        if not self.is_active:
            return False
        if self.expiration_date and self.expiration_date < timezone.now():
            return False
        if self.max_uses and self.usage_count >= self.max_uses:
            return False
        return True

    def calculate_discount(self, order_total):
        if self.minimum_order_amount and order_total < self.minimum_order_amount:
            return 0
        if self.discount_type == self.DiscountType.PERCENTAGE:
            return round(order_total * self.discount_value / 100, 2)
        return min(self.discount_value, order_total)
