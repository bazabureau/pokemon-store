from django.urls import path

from . import admin_views

urlpatterns = [
    # Dashboard
    path("dashboard/", admin_views.DashboardView.as_view(), name="admin-dashboard"),

    # Products
    path("products/", admin_views.AdminProductListView.as_view(), name="admin-products"),
    path("products/create/", admin_views.AdminProductCreateView.as_view(), name="admin-product-create"),
    path("products/<int:pk>/", admin_views.AdminProductDetailView.as_view(), name="admin-product-detail"),

    # Orders
    path("orders/", admin_views.AdminOrderListView.as_view(), name="admin-orders"),
    path("orders/<int:pk>/", admin_views.AdminOrderDetailView.as_view(), name="admin-order-detail"),

    # Customers
    path("customers/", admin_views.AdminCustomerListView.as_view(), name="admin-customers"),

    # Reviews
    path("reviews/", admin_views.AdminReviewListView.as_view(), name="admin-reviews"),
    path("reviews/<int:pk>/", admin_views.AdminReviewUpdateView.as_view(), name="admin-review-update"),

    # Coupons
    path("coupons/", admin_views.AdminCouponListView.as_view(), name="admin-coupons"),
    path("coupons/create/", admin_views.AdminCouponCreateView.as_view(), name="admin-coupon-create"),
    path("coupons/<int:pk>/", admin_views.AdminCouponDetailView.as_view(), name="admin-coupon-detail"),

    # Submissions
    path("submissions/", admin_views.AdminSubmissionListView.as_view(), name="admin-submissions"),
    path("submissions/<int:pk>/", admin_views.AdminSubmissionDetailView.as_view(), name="admin-submission-detail"),
]
