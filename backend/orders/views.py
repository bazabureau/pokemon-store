from decimal import Decimal

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartItemSerializer, CartSerializer, CheckoutSerializer, OrderSerializer


def _get_or_create_cart(request):
    """Get or create a cart for the current user or session."""
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    if not request.session.session_key:
        request.session.create()

    session_key = request.session.session_key
    cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        """Get current cart."""
        cart = _get_or_create_cart(request)
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        """Add item to cart."""
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            product = Product.objects.get(id=product_id, is_active=True, in_stock=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found or out of stock."}, status=status.HTTP_404_NOT_FOUND)

        if quantity > product.stock_quantity:
            return Response(
                {"error": f"Only {product.stock_quantity} available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = _get_or_create_cart(request)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity

        if cart_item.quantity > product.stock_quantity:
            return Response(
                {"error": f"Only {product.stock_quantity} available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.save()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def update_item(self, request):
        """Update item quantity."""
        item_id = request.data.get("item_id")
        quantity = int(request.data.get("quantity", 1))

        cart = _get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            cart_item.delete()
        else:
            if quantity > cart_item.product.stock_quantity:
                return Response(
                    {"error": f"Only {cart_item.product.stock_quantity} available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = quantity
            cart_item.save()

        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def remove(self, request):
        """Remove item from cart."""
        item_id = request.data.get("item_id")
        cart = _get_or_create_cart(request)

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def clear(self, request):
        """Clear all items from cart."""
        cart = _get_or_create_cart(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class CheckoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = _get_or_create_cart(request)
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
        shipping_cost = Decimal("0.00")  # Can be calculated based on method
        total = subtotal + shipping_cost

        # Create order
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone", ""),
            shipping_address=data["shipping_address"],
            shipping_city=data["shipping_city"],
            shipping_postal_code=data["shipping_postal_code"],
            shipping_country=data["shipping_country"],
            shipping_method=data.get("shipping_method", "standard"),
            shipping_cost=shipping_cost,
            payment_method=data.get("payment_method", ""),
            subtotal=subtotal,
            total=total,
            notes=data.get("notes", ""),
        )

        # Create order items and decrement stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
            )
            item.product.stock_quantity -= item.quantity
            if item.product.stock_quantity <= 0:
                item.product.in_stock = False
            item.product.save()

        # Clear cart
        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )
