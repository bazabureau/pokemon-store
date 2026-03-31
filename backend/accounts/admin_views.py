from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from coupons.models import Coupon
from coupons.serializers import CouponSerializer
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from products.models import Category, Product, ProductImage
from products.serializers import ProductDetailSerializer, ProductListSerializer
from reviews.models import Review
from reviews.serializers import ReviewSerializer
from submissions.models import CardSubmission
from submissions.serializers import CardSubmissionSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


# === Dashboard ===

class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)

        # Orders stats
        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()

        # Revenue
        total_revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID
        ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

        today_revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID,
            created_at__date=today,
        ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

        monthly_revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID,
            created_at__date__gte=thirty_days_ago,
        ).aggregate(total=Sum("total"))["total"] or Decimal("0.00")

        # Products
        total_products = Product.objects.filter(is_active=True).count()
        low_stock = Product.objects.filter(is_active=True, stock_quantity__lte=3, in_stock=True).count()
        out_of_stock = Product.objects.filter(is_active=True, in_stock=False).count()

        # Customers
        total_customers = User.objects.filter(is_staff=False).count()
        new_customers_today = User.objects.filter(date_joined__date=today, is_staff=False).count()

        # Pending items
        pending_reviews = Review.objects.filter(status=Review.Status.PENDING).count()
        pending_submissions = CardSubmission.objects.filter(status=CardSubmission.Status.PENDING).count()

        # Recent orders
        recent_orders = Order.objects.order_by("-created_at")[:5]

        # Low stock products
        low_stock_products = Product.objects.filter(
            is_active=True, stock_quantity__lte=3, in_stock=True
        ).order_by("stock_quantity")[:10]

        return Response({
            "orders": {
                "total": total_orders,
                "today": today_orders,
                "pending": pending_orders,
            },
            "revenue": {
                "total": str(total_revenue),
                "today": str(today_revenue),
                "monthly": str(monthly_revenue),
            },
            "products": {
                "total": total_products,
                "low_stock": low_stock,
                "out_of_stock": out_of_stock,
            },
            "customers": {
                "total": total_customers,
                "new_today": new_customers_today,
            },
            "pending": {
                "reviews": pending_reviews,
                "submissions": pending_submissions,
            },
            "recent_orders": OrderSerializer(recent_orders, many=True).data,
            "low_stock_products": ProductListSerializer(low_stock_products, many=True).data,
        })


# === Products ===

class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Product
        fields = "__all__"


class AdminProductListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminProductSerializer

    def get_queryset(self):
        qs = Product.objects.select_related("category").all()
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        product_type = self.request.query_params.get("product_type")
        if product_type:
            qs = qs.filter(product_type=product_type)
        in_stock = self.request.query_params.get("in_stock")
        if in_stock is not None:
            qs = qs.filter(in_stock=in_stock == "true")
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active == "true")
        return qs


class AdminProductCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = AdminProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        # Handle gallery images
        gallery_images = request.FILES.getlist("gallery_images")
        for i, img in enumerate(gallery_images):
            ProductImage.objects.create(product=product, image=img, order=i)

        return Response(AdminProductSerializer(product).data, status=status.HTTP_201_CREATED)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            product = Product.objects.select_related("category").get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminProductSerializer(product).data)

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminProductSerializer(product).data)

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# === Orders ===

class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = Order.objects.prefetch_related("items").all()
        order_status = self.request.query_params.get("status")
        if order_status:
            qs = qs.filter(status=order_status)
        payment_status = self.request.query_params.get("payment_status")
        if payment_status:
            qs = qs.filter(payment_status=payment_status)
        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(order_number__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return qs


class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status and new_status in dict(Order.Status.choices):
            order.status = new_status
            order.save()

        payment_status = request.data.get("payment_status")
        if payment_status and payment_status in dict(Order.PaymentStatus.choices):
            order.payment_status = payment_status
            order.save()

        notes = request.data.get("notes")
        if notes is not None:
            order.notes = notes
            order.save()

        return Response(OrderSerializer(order).data)


# === Customers ===

class CustomerSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined", "is_active", "order_count", "total_spent")

    def get_order_count(self, obj):
        return obj.orders.count()

    def get_total_spent(self, obj):
        total = obj.orders.filter(payment_status="paid").aggregate(total=Sum("total"))["total"]
        return str(total or Decimal("0.00"))


class AdminCustomerListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CustomerSerializer

    def get_queryset(self):
        qs = User.objects.filter(is_staff=False).prefetch_related("orders")
        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return qs.order_by("-date_joined")


# === Reviews ===

class AdminReviewListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        qs = Review.objects.select_related("user", "product").all()
        review_status = self.request.query_params.get("status")
        if review_status:
            qs = qs.filter(status=review_status)
        return qs


class AdminReviewUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status in dict(Review.Status.choices):
            review.status = new_status
            review.save()

        return Response(ReviewSerializer(review).data)


# === Coupons ===

class AdminCouponListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()


class AdminCouponCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = request.data.copy()
        if "code" in data:
            data["code"] = data["code"].upper()
        serializer = CouponSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminCouponDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            coupon = Coupon.objects.get(pk=pk)
        except Coupon.DoesNotExist:
            return Response({"error": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CouponSerializer(coupon).data)

    def put(self, request, pk):
        try:
            coupon = Coupon.objects.get(pk=pk)
        except Coupon.DoesNotExist:
            return Response({"error": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CouponSerializer(coupon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            coupon = Coupon.objects.get(pk=pk)
        except Coupon.DoesNotExist:
            return Response({"error": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        coupon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# === Submissions ===

class AdminSubmissionListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CardSubmissionSerializer

    def get_queryset(self):
        qs = CardSubmission.objects.prefetch_related("images").all()
        sub_status = self.request.query_params.get("status")
        if sub_status:
            qs = qs.filter(status=sub_status)
        return qs


class AdminSubmissionDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            submission = CardSubmission.objects.prefetch_related("images").get(pk=pk)
        except CardSubmission.DoesNotExist:
            return Response({"error": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CardSubmissionSerializer(submission).data)

    def patch(self, request, pk):
        try:
            submission = CardSubmission.objects.get(pk=pk)
        except CardSubmission.DoesNotExist:
            return Response({"error": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        for field in ("status", "admin_notes", "offer_amount"):
            if field in request.data:
                setattr(submission, field, request.data[field])
        submission.save()

        return Response(CardSubmissionSerializer(submission).data)
