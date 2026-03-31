import json
from decimal import Decimal

import stripe
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from coupons.models import Coupon
from products.models import Product

from .models import Cart, CartItem, Order, OrderItem
from .serializers import OrderSerializer


stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data

        # Get cart
        if request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
            except Cart.DoesNotExist:
                return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            session_key = request.session.session_key
            if not session_key:
                return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                cart = Cart.objects.get(session_key=session_key, user=None)
            except Cart.DoesNotExist:
                return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related("product").all()
        if not cart_items.exists():
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate stock
        for item in cart_items:
            if not item.product.in_stock or item.quantity > item.product.stock_quantity:
                return Response(
                    {"error": f"{item.product.name} is out of stock or insufficient quantity."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Calculate totals
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        shipping_cost = Decimal("0.00")
        discount_amount = Decimal("0.00")
        coupon_code = data.get("coupon_code", "")

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.upper())
                if coupon.is_valid:
                    discount_amount = Decimal(str(coupon.calculate_discount(subtotal)))
            except Coupon.DoesNotExist:
                pass

        total = subtotal - discount_amount + shipping_cost
        amount_cents = int(total * 100)

        # Create Order
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            email=data.get("email", ""),
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            phone=data.get("phone", ""),
            shipping_address=data.get("shipping_address", ""),
            shipping_city=data.get("shipping_city", ""),
            shipping_postal_code=data.get("shipping_postal_code", ""),
            shipping_country=data.get("shipping_country", ""),
            shipping_method=data.get("shipping_method", "standard"),
            shipping_cost=shipping_cost,
            payment_method="stripe",
            coupon_code=coupon_code,
            discount_amount=discount_amount,
            subtotal=subtotal,
            total=total,
            notes=data.get("notes", ""),
        )

        # Create order items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
            )

        # Create Stripe PaymentIntent
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="pln",
                metadata={
                    "order_id": order.id,
                    "order_number": order.order_number,
                },
            )
            order.stripe_payment_intent_id = intent.id
            order.save()

            return Response({
                "client_secret": intent.client_secret,
                "order": OrderSerializer(order).data,
            })
        except stripe.error.StripeError as e:
            order.payment_status = Order.PaymentStatus.FAILED
            order.save()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "payment_intent.succeeded":
            intent = event["data"]["object"]
            order_id = intent["metadata"].get("order_id")

            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    order.payment_status = Order.PaymentStatus.PAID
                    order.status = Order.Status.CONFIRMED
                    order.save()

                    # Decrement stock
                    for item in order.items.select_related("product").all():
                        if item.product:
                            item.product.stock_quantity -= item.quantity
                            if item.product.stock_quantity <= 0:
                                item.product.in_stock = False
                            item.product.save()

                    # Increment coupon usage
                    if order.coupon_code:
                        try:
                            coupon = Coupon.objects.get(code=order.coupon_code.upper())
                            coupon.usage_count += 1
                            coupon.save()
                        except Coupon.DoesNotExist:
                            pass

                    # Clear cart
                    if order.user:
                        Cart.objects.filter(user=order.user).first()
                        cart = Cart.objects.filter(user=order.user).first()
                        if cart:
                            cart.items.all().delete()

                    # Send confirmation email
                    from config.email_utils import send_order_confirmation
                    send_order_confirmation(order)

                except Order.DoesNotExist:
                    pass

        elif event["type"] == "payment_intent.payment_failed":
            intent = event["data"]["object"]
            order_id = intent["metadata"].get("order_id")
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    order.payment_status = Order.PaymentStatus.FAILED
                    order.save()
                except Order.DoesNotExist:
                    pass

        return Response({"status": "ok"})
