from django.urls import path

from . import views

urlpatterns = [
    path("coupons/validate/", views.ValidateCouponView.as_view(), name="validate-coupon"),
]
