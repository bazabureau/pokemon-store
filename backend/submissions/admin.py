from django.contrib import admin

from .models import CardSubmission, SubmissionImage


class SubmissionImageInline(admin.TabularInline):
    model = SubmissionImage
    extra = 0
    readonly_fields = ("image", "created_at")


@admin.register(CardSubmission)
class CardSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name", "card_name", "condition", "status", "offer_amount", "created_at")
    list_filter = ("status", "condition", "created_at")
    search_fields = ("name", "email", "card_name", "set_name")
    list_editable = ("status",)
    inlines = [SubmissionImageInline]
    readonly_fields = ("created_at", "updated_at")
