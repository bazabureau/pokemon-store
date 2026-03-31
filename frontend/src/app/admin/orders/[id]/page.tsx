"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Package, MapPin, CreditCard, User } from "lucide-react";
import { adminAPI, Order } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

function formatPrice(p: number | string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(typeof p === "string" ? parseFloat(p) : p);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function statusColor(status: string) {
  switch (status) {
    case "delivered":
      return { bg: "rgba(34,197,94,0.1)", color: "var(--success)", border: "rgba(34,197,94,0.2)" };
    case "cancelled":
      return { bg: "rgba(239,68,68,0.1)", color: "var(--error)", border: "rgba(239,68,68,0.2)" };
    case "pending":
      return { bg: "rgba(234,179,8,0.1)", color: "var(--warning)", border: "rgba(234,179,8,0.2)" };
    case "shipped":
      return { bg: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "rgba(59,130,246,0.2)" };
    default:
      return { bg: "rgba(255,107,44,0.1)", color: "var(--accent)", border: "rgba(255,107,44,0.2)" };
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const orderId = parseInt(params.id as string);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI
      .orderDetail(orderId)
      .then((o) => {
        setOrder(o);
        setNewStatus(o.status);
        setNotes(o.notes || "");
      })
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminAPI.updateOrder(orderId, {
        status: newStatus,
        notes,
      });
      setOrder(updated);
      toast.success("Updated", "Order status updated");
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.05em",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: "6px",
    display: "block",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 animate-pulse" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-8 w-64 animate-pulse" style={{ background: "var(--bg-elevated)" }} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse"
              style={{ background: "var(--bg-elevated)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p
          className="text-[12px]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          Order not found
        </p>
      </div>
    );
  }

  const sc = statusColor(order.status);

  return (
    <div className="space-y-6 max-w-[1000px]">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase mb-4 transition-colors duration-100"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={12} />
          Back to Orders
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Order #{order.order_number}
          </h1>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1"
            style={{
              fontFamily: "var(--font-mono)",
              background: sc.bg,
              color: sc.color,
              border: `1px solid ${sc.border}`,
            }}
          >
            {order.status_display || order.status}
          </span>
        </div>
        <p
          className="text-[11px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          Placed on {formatDate(order.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer info */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <User size={14} style={{ color: "var(--text-muted)" }} />
            <h2
              className="text-[11px] font-black uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Customer
            </h2>
          </div>
          <div className="p-5 space-y-2">
            <p
              className="text-[12px] font-bold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {order.first_name} {order.last_name}
            </p>
            <p
              className="text-[11px]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
            >
              {order.email}
            </p>
            {order.phone && (
              <p
                className="text-[11px]"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              >
                {order.phone}
              </p>
            )}
          </div>
        </div>

        {/* Shipping */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <MapPin size={14} style={{ color: "var(--text-muted)" }} />
            <h2
              className="text-[11px] font-black uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Shipping
            </h2>
          </div>
          <div className="p-5 space-y-1">
            <p
              className="text-[11px]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
            >
              {order.shipping_address || "N/A"}
            </p>
            <p
              className="text-[11px]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
            >
              {order.shipping_city} {order.shipping_postal_code}
            </p>
            <p
              className="text-[11px]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
            >
              {order.shipping_country}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <CreditCard size={14} style={{ color: "var(--text-muted)" }} />
            <h2
              className="text-[11px] font-black uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Payment
            </h2>
          </div>
          <div className="p-5 space-y-2">
            <div className="flex justify-between">
              <span
                className="text-[11px]"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              >
                Subtotal
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="text-[11px]"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              >
                Shipping
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(order.shipping_cost)}
              </span>
            </div>
            {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span
                  className="text-[11px]"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
                >
                  Discount {order.coupon_code && `(${order.coupon_code})`}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--success)" }}
                >
                  -{formatPrice(order.discount_amount)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between pt-2 mt-2"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span
                className="text-[11px] font-black uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Total
              </span>
              <span
                className="text-[13px] font-black"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
              >
                {formatPrice(order.total)}
              </span>
            </div>
            <div className="mt-2">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 inline-block"
                style={{
                  fontFamily: "var(--font-mono)",
                  background:
                    order.payment_status === "paid"
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(234,179,8,0.1)",
                  color:
                    order.payment_status === "paid"
                      ? "var(--success)"
                      : "var(--warning)",
                  border: `1px solid ${
                    order.payment_status === "paid"
                      ? "rgba(34,197,94,0.2)"
                      : "rgba(234,179,8,0.2)"
                  }`,
                }}
              >
                {order.payment_status_display || order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Package size={14} style={{ color: "var(--text-muted)" }} />
          <h2
            className="text-[11px] font-black uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Items ({order.items?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Product", "Unit Price", "Qty", "Total"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      idx < order.items.length - 1
                        ? "1px solid var(--border-subtle)"
                        : "none",
                  }}
                >
                  <td
                    className="px-5 py-3 text-[11px] font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.product_name}
                  </td>
                  <td
                    className="px-5 py-3 text-[11px]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                  >
                    {formatPrice(item.product_price)}
                  </td>
                  <td
                    className="px-5 py-3 text-[11px]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className="px-5 py-3 text-[11px] font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatPrice(parseFloat(item.product_price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update status */}
      <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2
            className="text-[11px] font-black uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Update Order
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>Order Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 outline-none min-w-[200px]"
              style={inputStyle}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none"
              style={inputStyle}
              placeholder="Internal notes about this order..."
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "#000",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.background = "#FFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            <Save size={12} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
