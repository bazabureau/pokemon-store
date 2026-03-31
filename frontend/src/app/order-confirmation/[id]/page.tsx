"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ordersAPI, Order } from "@/lib/api";

function formatPrice(p: number | string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(typeof p === "string" ? parseFloat(p) : p);
}

function OrderSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-12 w-48 mx-auto" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-6 w-64 mx-auto" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-40" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-24" style={{ background: "var(--bg-elevated)" }} />
    </div>
  );
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }
    ordersAPI
      .get(orderId)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || "Could not load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <OrderSkeleton />
          ) : error ? (
            <div className="text-center py-20">
              <p
                className="text-[13px] mb-6"
                style={{ color: "var(--error)", fontFamily: "var(--font-mono)" }}
              >
                {error}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
                style={{
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
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
                Go Home
              </Link>
            </div>
          ) : order ? (
            <div className="max-w-3xl mx-auto">
              {/* Success header */}
              <div className="text-center mb-10">
                <div
                  className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                  style={{
                    border: "2px solid var(--success)",
                    background: "rgba(0,255,102,0.05)",
                  }}
                >
                  <CheckCircle size={32} style={{ color: "var(--success)" }} />
                </div>
                <h1
                  className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Order Confirmed
                </h1>
                <p
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  Thank you for your purchase! Your order has been received.
                </p>
              </div>

              {/* Order info */}
              <div style={{ border: "1px solid var(--border-default)" }}>
                <div
                  className="px-5 py-4 flex flex-wrap items-center justify-between gap-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div>
                    <span
                      className="text-[10px] tracking-[0.15em] uppercase block"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      Order Number
                    </span>
                    <span
                      className="text-[15px] font-black"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
                    >
                      #{order.order_number}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-[10px] tracking-[0.15em] uppercase block"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      Date
                    </span>
                    <span
                      className="text-[13px] font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {new Date(order.created_at).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div
                  className="px-5 py-4 flex flex-wrap items-center justify-between gap-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div>
                    <span
                      className="text-[10px] tracking-[0.15em] uppercase block"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      Status
                    </span>
                    <span
                      className="text-[13px] font-bold uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          order.status === "delivered"
                            ? "var(--success)"
                            : order.status === "cancelled"
                              ? "var(--error)"
                              : "var(--accent)",
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-[10px] tracking-[0.15em] uppercase block"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      Email
                    </span>
                    <span
                      className="text-[13px]"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                    >
                      {order.email}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h3
                    className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    Items
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-12 flex items-center justify-center shrink-0"
                            style={{ background: "var(--bg-elevated)" }}
                          >
                            <Package size={14} style={{ color: "var(--text-muted)" }} />
                          </div>
                          <div>
                            <p
                              className="text-[12px] font-bold uppercase tracking-wider"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {item.product_name}
                            </p>
                            <p
                              className="text-[10px]"
                              style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                            >
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-[12px] font-bold"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {formatPrice(parseFloat(item.product_price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                    >
                      Subtotal
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                    >
                      Shipping
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          parseFloat(order.shipping_cost) === 0
                            ? "var(--success)"
                            : "var(--text-primary)",
                      }}
                    >
                      {parseFloat(order.shipping_cost) === 0
                        ? "Free"
                        : formatPrice(order.shipping_cost)}
                    </span>
                  </div>
                </div>

                <div
                  className="px-5 py-4 flex justify-between"
                  style={{
                    borderTop: "2px solid var(--accent)",
                    background: "var(--bg-surface)",
                  }}
                >
                  <span
                    className="text-[13px] font-black uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-[17px] font-black"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
                  >
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Link
                  href="/single-cards"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
                  style={{
                    background: "var(--accent)",
                    color: "#000",
                    fontFamily: "var(--font-mono)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                >
                  Continue Shopping
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
