from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .stripe_views import CreatePaymentIntentView, StripeWebhookView

router = DefaultRouter()
router.register(r"cart", views.CartViewSet, basename="cart")
router.register(r"orders", views.OrderViewSet, basename="order")

urlpatterns = [
    path("", include(router.urls)),
    path("checkout/", views.CheckoutView.as_view(), name="checkout"),
    path("checkout/create-payment-intent/", CreatePaymentIntentView.as_view(), name="create-payment-intent"),
    path("webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
