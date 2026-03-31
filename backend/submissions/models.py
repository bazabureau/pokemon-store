from django.conf import settings
from django.db import models


class CardSubmission(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        REVIEWED = "reviewed", "Reviewed"
        OFFERED = "offered", "Offer Sent"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="card_submissions",
    )
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, default="")

    card_name = models.CharField(max_length=255)
    set_name = models.CharField(max_length=100, blank=True, default="")
    condition = models.CharField(max_length=50, blank=True, default="")
    quantity = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True, default="")
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    admin_notes = models.TextField(blank=True, default="")
    offer_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.card_name}"


class SubmissionImage(models.Model):
    submission = models.ForeignKey(CardSubmission, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="submissions/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.submission.card_name}"
