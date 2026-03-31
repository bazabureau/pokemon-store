import logging

import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_email(to, subject, html):
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured, skipping email to %s", to)
        return None

    resend.api_key = settings.RESEND_API_KEY
    try:
        return resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, str(e))
        return None


def send_welcome_email(user):
    html = f"""
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF6B2C; font-size: 28px; margin: 0;">Welcome to Collectify!</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Hi {user.first_name or user.username},</p>
        <p style="font-size: 16px; line-height: 1.6;">
            Welcome to Collectify — your destination for Pokemon cards, graded slabs, and sealed products.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
            Start browsing our collection and find your next treasure!
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{settings.FRONTEND_URL}" style="background: #FF6B2C; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Browse Collection
            </a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
            &copy; Collectify — Pokemon Card Trading
        </p>
    </div>
    """
    _send_email(user.email, "Welcome to Collectify! 🎴", html)


def send_order_confirmation(order):
    items_html = ""
    for item in order.items.all():
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #333;">{item.product_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">{item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">{item.product_price} PLN</td>
        </tr>
        """

    discount_html = ""
    if order.discount_amount > 0:
        discount_html = f"""
        <tr>
            <td colspan="2" style="padding: 8px; text-align: right; color: #4ade80;">Discount ({order.coupon_code}):</td>
            <td style="padding: 8px; text-align: right; color: #4ade80;">-{order.discount_amount} PLN</td>
        </tr>
        """

    html = f"""
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF6B2C; font-size: 28px; margin: 0;">Order Confirmed!</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Hi {order.first_name},</p>
        <p style="font-size: 16px; line-height: 1.6;">
            Thank you for your order! Your order <strong style="color: #FF6B2C;">#{order.order_number}</strong> has been confirmed.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="border-bottom: 2px solid #FF6B2C;">
                    <th style="padding: 12px; text-align: left; color: #FF6B2C;">Item</th>
                    <th style="padding: 12px; text-align: center; color: #FF6B2C;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #FF6B2C;">Price</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 8px; text-align: right;">Subtotal:</td>
                    <td style="padding: 8px; text-align: right;">{order.subtotal} PLN</td>
                </tr>
                {discount_html}
                <tr>
                    <td colspan="2" style="padding: 8px; text-align: right;">Shipping:</td>
                    <td style="padding: 8px; text-align: right;">{order.shipping_cost} PLN</td>
                </tr>
                <tr style="border-top: 2px solid #FF6B2C;">
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #FF6B2C;">{order.total} PLN</td>
                </tr>
            </tfoot>
        </table>

        <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #FF6B2C; margin-top: 0;">Shipping To:</h3>
            <p style="margin: 4px 0;">{order.first_name} {order.last_name}</p>
            <p style="margin: 4px 0;">{order.shipping_address}</p>
            <p style="margin: 4px 0;">{order.shipping_city}, {order.shipping_postal_code}</p>
            <p style="margin: 4px 0;">{order.shipping_country}</p>
        </div>

        <p style="font-size: 14px; color: #888; text-align: center;">
            &copy; Collectify — Pokemon Card Trading
        </p>
    </div>
    """
    _send_email(order.email, f"Order Confirmed - #{order.order_number}", html)


def send_order_status_update(order):
    status_colors = {
        "processing": "#3b82f6",
        "shipped": "#8b5cf6",
        "delivered": "#4ade80",
        "cancelled": "#ef4444",
    }
    color = status_colors.get(order.status, "#FF6B2C")

    html = f"""
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF6B2C; font-size: 28px; margin: 0;">Order Update</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Hi {order.first_name},</p>
        <p style="font-size: 16px; line-height: 1.6;">
            Your order <strong style="color: #FF6B2C;">#{order.order_number}</strong> status has been updated to:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="background: {color}; color: white; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 20px; text-transform: uppercase;">
                {order.get_status_display()}
            </span>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{settings.FRONTEND_URL}/account" style="background: #FF6B2C; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View Order
            </a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
            &copy; Collectify — Pokemon Card Trading
        </p>
    </div>
    """
    _send_email(order.email, f"Order #{order.order_number} - {order.get_status_display()}", html)


def send_submission_confirmation(submission):
    html = f"""
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF6B2C; font-size: 28px; margin: 0;">Submission Received!</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Hi {submission.name},</p>
        <p style="font-size: 16px; line-height: 1.6;">
            We've received your card submission for <strong style="color: #FF6B2C;">{submission.card_name}</strong>.
        </p>
        <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Card:</strong> {submission.card_name}</p>
            <p style="margin: 4px 0;"><strong>Set:</strong> {submission.set_name or 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Condition:</strong> {submission.condition or 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Quantity:</strong> {submission.quantity}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">
            Our team will review your submission and get back to you within 1-2 business days.
        </p>
        <p style="font-size: 14px; color: #888; text-align: center;">
            &copy; Collectify — Pokemon Card Trading
        </p>
    </div>
    """
    _send_email(submission.email, "Card Submission Received - Collectify", html)
