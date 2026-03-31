"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  Star,
  Inbox,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
} from "lucide-react";
import { adminAPI, DashboardData } from "@/lib/api";
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
  });
}

function StatCardSkeleton() {
  return (
    <div
      className="p-5 animate-pulse"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}
    >
      <div className="h-3 w-20 mb-4" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-6 w-28 mb-2" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-2 w-16" style={{ background: "var(--bg-elevated)" }} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 w-full" style={{ background: "var(--bg-elevated)" }} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    adminAPI
      .dashboard()
      .then(setData)
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  }, []);

  const statCards = data
    ? [
        {
          label: "Total Revenue",
          value: formatPrice(data.revenue.total),
          sub: `${formatPrice(data.revenue.monthly)} this month`,
          icon: DollarSign,
          color: "var(--success)",
        },
        {
          label: "Today's Orders",
          value: data.orders.today.toString(),
          sub: `${data.orders.total} total`,
          icon: ShoppingCart,
          color: "var(--accent)",
        },
        {
          label: "Pending Orders",
          value: data.orders.pending.toString(),
          sub: "Awaiting processing",
          icon: Clock,
          color: "var(--warning)",
        },
        {
          label: "Total Customers",
          value: data.customers.total.toString(),
          sub: `${data.customers.new_today} new today`,
          icon: Users,
          color: "#8B5CF6",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dashboard
          </h1>
          <p
            className="text-[11px] mt-1"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            Overview of your store performance
          </p>
        </div>
        {data && (data.pending.reviews > 0 || data.pending.submissions > 0) && (
          <div className="flex items-center gap-3">
            {data.pending.reviews > 0 && (
              <Link
                href="/admin/reviews"
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
                style={{
                  fontFamily: "var(--font-mono)",
                  border: "1px solid var(--warning)",
                  color: "var(--warning)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--warning)";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--warning)";
                }}
              >
                <Star size={12} />
                {data.pending.reviews} Reviews
              </Link>
            )}
            {data.pending.submissions > 0 && (
              <Link
                href="/admin/submissions"
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
                style={{
                  fontFamily: "var(--font-mono)",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--accent)";
                }}
              >
                <Inbox size={12} />
                {data.pending.submissions} Submissions
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  style={{
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-primary)",
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {card.label}
                      </span>
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{
                          background: `${card.color}15`,
                          border: `1px solid ${card.color}30`,
                        }}
                      >
                        <Icon size={14} style={{ color: card.color }} />
                      </div>
                    </div>
                    <p
                      className="text-[22px] font-black tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {card.value}
                    </p>
                    <p
                      className="text-[10px] mt-1"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {card.sub}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div
          className="lg:col-span-2"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
              style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View All <ArrowRight size={10} />
            </Link>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : data?.recent_orders && data.recent_orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {["Order", "Customer", "Date", "Total", "Status"].map((h) => (
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
                  {data.recent_orders.slice(0, 5).map((order, idx) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom:
                          idx < data.recent_orders.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                        background:
                          hoveredRow === order.id ? "var(--bg-surface)" : "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredRow(order.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => (window.location.href = `/admin/orders/${order.id}`)}
                    >
                      <td
                        className="px-5 py-3 text-[11px] font-bold"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
                      >
                        #{order.order_number}
                      </td>
                      <td
                        className="px-5 py-3 text-[11px]"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                      >
                        {order.first_name} {order.last_name}
                      </td>
                      <td
                        className="px-5 py-3 text-[11px]"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
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
                            background:
                              order.status === "delivered"
                                ? "rgba(34,197,94,0.1)"
                                : order.status === "cancelled"
                                ? "rgba(239,68,68,0.1)"
                                : order.status === "pending"
                                ? "rgba(234,179,8,0.1)"
                                : "rgba(255,107,44,0.1)",
                            color:
                              order.status === "delivered"
                                ? "var(--success)"
                                : order.status === "cancelled"
                                ? "var(--error)"
                                : order.status === "pending"
                                ? "var(--warning)"
                                : "var(--accent)",
                            border: `1px solid ${
                              order.status === "delivered"
                                ? "rgba(34,197,94,0.2)"
                                : order.status === "cancelled"
                                ? "rgba(239,68,68,0.2)"
                                : order.status === "pending"
                                ? "rgba(234,179,8,0.2)"
                                : "rgba(255,107,44,0.2)"
                            }`,
                          }}
                        >
                          {order.status_display || order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p
                className="text-[11px]"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              >
                No recent orders
              </p>
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Low Stock Alerts
            </h2>
            <AlertTriangle size={14} style={{ color: "var(--warning)" }} />
          </div>

          {loading ? (
            <TableSkeleton />
          ) : data?.low_stock_products && data.low_stock_products.length > 0 ? (
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {data.low_stock_products.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors duration-100"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-surface)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    className="w-8 h-10 shrink-0 flex items-center justify-center"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package
                        size={12}
                        style={{ color: "var(--text-muted)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-bold truncate"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {product.name}
                    </p>
                    <p
                      className="text-[9px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          product.stock_quantity === 0
                            ? "var(--error)"
                            : "var(--warning)",
                      }}
                    >
                      {product.stock_quantity === 0
                        ? "OUT OF STOCK"
                        : `${product.stock_quantity} left`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <TrendingUp
                size={20}
                className="mx-auto mb-2"
                style={{ color: "var(--success)" }}
              />
              <p
                className="text-[11px]"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
              >
                All products well stocked
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
