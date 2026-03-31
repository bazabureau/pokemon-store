from decimal import Decimal

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Coupon
from .serializers import CouponSerializer, CouponValidateSerializer


class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"].upper()
        order_total = Decimal(str(serializer.validated_data.get("order_total", 0)))

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid coupon code."}, status=status.HTTP_404_NOT_FOUND)

        if not coupon.is_valid:
            return Response({"error": "This coupon has expired or is no longer valid."}, status=status.HTTP_400_BAD_REQUEST)

        if coupon.minimum_order_amount and order_total < coupon.minimum_order_amount:
            return Response(
                {"error": f"Minimum order amount is {coupon.minimum_order_amount} PLN."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        discount = coupon.calculate_discount(order_total)
        return Response({
            "coupon": CouponSerializer(coupon).data,
            "discount_amount": str(discount),
            "new_total": str(order_total - Decimal(str(discount))),
        })
