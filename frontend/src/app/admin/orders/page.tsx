"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
} from "lucide-react";
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
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
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

function paymentColor(status: string) {
  switch (status) {
    case "paid":
      return { bg: "rgba(34,197,94,0.1)", color: "var(--success)", border: "rgba(34,197,94,0.2)" };
    case "failed":
      return { bg: "rgba(239,68,68,0.1)", color: "var(--error)", border: "rgba(239,68,68,0.2)" };
    default:
      return { bg: "rgba(234,179,8,0.1)", color: "var(--warning)", border: "rgba(234,179,8,0.2)" };
  }
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="h-3 w-20" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 w-32 flex-1" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 w-24" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 w-16" style={{ background: "var(--bg-elevated)" }} />
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toast = useToast();

  const fetchOrders = () => {
    setLoading(true);
    const params: Record<string, string> = { page: page.toString() };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    adminAPI
      .orders(params)
      .then((res) => {
        setOrders(res.results);
        setTotalCount(res.count);
        setHasNext(!!res.next);
        setHasPrev(!!res.previous);
      })
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.05em",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Orders
        </h1>
        <p
          className="text-[11px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          {totalCount} orders total
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 p-4"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or customer..."
            className="w-full px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={inputStyle}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={12} style={{ color: "var(--text-muted)" }} />
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
              style={{
                fontFamily: "var(--font-mono)",
                background:
                  statusFilter === s.value ? "var(--accent)" : "transparent",
                color:
                  statusFilter === s.value ? "#000" : "var(--text-secondary)",
                border: `1px solid ${
                  statusFilter === s.value
                    ? "var(--accent)"
                    : "var(--border-default)"
                }`,
              }}
              onMouseEnter={(e) => {
                if (statusFilter !== s.value) {
                  e.currentTarget.style.borderColor = "var(--text-muted)";
                }
              }}
              onMouseLeave={(e) => {
                if (statusFilter !== s.value) {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {[
                  "Order",
                  "Customer",
                  "Date",
                  "Total",
                  "Payment",
                  "Status",
                  "",
                ].map((h) => (
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
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <ShoppingCart
                      size={24}
                      className="mx-auto mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-[11px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      No orders found
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                  const sc = statusColor(order.status);
                  const pc = paymentColor(order.payment_status);
                  const isExpanded = expandedId === order.id;
                  return (
                    <>
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: isExpanded
                            ? "none"
                            : idx < orders.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                          background:
                            hoveredRow === order.id || isExpanded
                              ? "var(--bg-surface)"
                              : "transparent",
                          cursor: "pointer",
                        }}
                        onMouseEnter={() => setHoveredRow(order.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : order.id)
                        }
                      >
                        <td
                          className="px-5 py-3 text-[11px] font-bold"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--accent)",
                          }}
                        >
                          #{order.order_number}
                        </td>
                        <td className="px-5 py-3">
                          <p
                            className="text-[11px] font-bold"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {order.first_name} {order.last_name}
                          </p>
                          <p
                            className="text-[9px]"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {order.email}
                          </p>
                        </td>
                        <td
                          className="px-5 py-3 text-[11px]"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatDate(order.created_at)}
                        </td>
                        <td
                          className="px-5 py-3 text-[11px] font-bold"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 inline-block"
                            style={{
                              fontFamily: "var(--font-mono)",
                              background: pc.bg,
                              color: pc.color,
                              border: `1px solid ${pc.border}`,
                            }}
                          >
                            {order.payment_status_display || order.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 inline-block"
                            style={{
                              fontFamily: "var(--font-mono)",
                              background: sc.bg,
                              color: sc.color,
                              border: `1px solid ${sc.border}`,
                            }}
                          >
                            {order.status_display || order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1.5 inline-block transition-colors duration-100"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "var(--text-muted)")
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                      {/* Expanded row */}
                      {isExpanded && (
                        <tr
                          key={`${order.id}-expanded`}
                          style={{
                            borderBottom:
                              idx < orders.length - 1
                                ? "1px solid var(--border-subtle)"
                                : "none",
                          }}
                        >
                          <td
                            colSpan={7}
                            className="px-5 pb-4"
                            style={{ background: "var(--bg-surface)" }}
                          >
                            <div
                              className="p-4 mt-1"
                              style={{
                                border: "1px solid var(--border-subtle)",
                                background: "var(--bg-primary)",
                              }}
                            >
                              <p
                                className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--text-muted)",
                                }}
                              >
                                Order Items
                              </p>
                              {order.items && order.items.length > 0 ? (
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between py-1"
                                    >
                                      <span
                                        className="text-[11px]"
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                          color: "var(--text-secondary)",
                                        }}
                                      >
                                        {item.product_name} x{item.quantity}
                                      </span>
                                      <span
                                        className="text-[11px] font-bold"
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                        }}
                                      >
                                        {formatPrice(
                                          parseFloat(item.product_price) *
                                            item.quantity
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p
                                  className="text-[10px]"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  No items data available
                                </p>
                              )}
                              {order.shipping_address && (
                                <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                  <p
                                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    Shipping To
                                  </p>
                                  <p
                                    className="text-[11px]"
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    {order.shipping_address}, {order.shipping_city}{" "}
                                    {order.shipping_postal_code}
                                  </p>
                                </div>
                              )}
                              <div className="mt-3 pt-3 flex justify-end" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                <Link
                                  href={`/admin/orders/${order.id}`}
                                  className="text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--accent)",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.7")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                >
                                  Full Details →
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <span
              className="text-[10px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
              }}
            >
              Page {page} of {Math.ceil(totalCount / 20)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
                className="p-1.5 transition-colors duration-100 disabled:opacity-30"
                style={{ color: "var(--text-muted)" }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="p-1.5 transition-colors duration-100 disabled:opacity-30"
                style={{ color: "var(--text-muted)" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
