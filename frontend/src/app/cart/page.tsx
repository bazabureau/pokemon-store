"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";

function formatPrice(p: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(p);
}

function CartItemSkeleton() {
  return (
    <div
      className="flex gap-4 p-4 animate-pulse"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="w-20 h-24 shrink-0" style={{ background: "var(--bg-elevated)" }} />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-3/4" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-3 w-1/4" style={{ background: "var(--bg-elevated)" }} />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCart();
  const toast = useToast();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await updateItem(itemId, newQty);
    } catch {
      toast.error("Błąd", "Nie udało się zaktualizować ilości");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast.success("Usunięto", "Produkt usunięty z koszyka");
    } catch {
      toast.error("Błąd", "Nie udało się usunąć produktu");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.info("Koszyk wyczyszczony", "Wszystkie produkty zostały usunięte");
    } catch {
      toast.error("Błąd", "Nie udało się wyczyścić koszyka");
    }
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shippingEstimate = subtotal > 0 ? (subtotal >= 500 ? 0 : 19.99) : 0;
  const total = subtotal + shippingEstimate;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        {/* Page header */}
        <div
          className="py-12"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.04) 0%, transparent 60%)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-3"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              [KOSZYK]
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Koszyk
            </h1>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <ShoppingBag size={28} style={{ color: "var(--text-muted)" }} />
              </div>
              <h2
                className="text-xl font-black uppercase tracking-tight mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Twój koszyk jest pusty
              </h2>
              <p
                className="text-[13px] mb-8"
                style={{ color: "var(--text-muted)" }}
              >
                Zacznij dodawać karty premium do swojej kolekcji
              </p>
              <Link
                href="/single-cards"
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
                style={{
                  background: "var(--accent)",
                  color: "#000",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                Przeglądaj Karty
              </Link>
            </div>
          ) : (
            /* Cart content */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Items */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[11px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {items.length} {items.length === 1 ? "produkt" : "produktów"}
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-[11px] font-bold tracking-[0.1em] uppercase transition-colors duration-100"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    Wyczyść wszystko
                  </button>
                </div>

                <div style={{ border: "1px solid var(--border-subtle)" }}>
                  {items.map((item, idx) => {
                    const price = parseFloat(item.product.price);
                    const isUpdating = updatingItems.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 sm:gap-6 p-4 sm:p-5 transition-opacity duration-200"
                        style={{
                          borderBottom:
                            idx < items.length - 1
                              ? "1px solid var(--border-subtle)"
                              : "none",
                          opacity: isUpdating ? 0.5 : 1,
                        }}
                      >
                        {/* Product image placeholder */}
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="shrink-0 w-20 h-24 sm:w-24 sm:h-28 relative overflow-hidden"
                          style={{ background: "var(--bg-elevated)" }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="text-2xl font-black"
                              style={{
                                color: "rgba(255,255,255,0.04)",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              {item.product.name.charAt(0)}
                            </span>
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link href={`/product/${item.product.slug}`}>
                              <h3
                                className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider line-clamp-2 transition-colors duration-100 hover:text-[var(--accent)]"
                              >
                                {item.product.name}
                              </h3>
                            </Link>
                            {item.product.product_type && (
                              <span
                                className="text-[10px] tracking-[0.15em] uppercase mt-1 block"
                                style={{
                                  color: "var(--text-muted)",
                                }}
                              >
                                {item.product.product_type.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity controls */}
                            <div
                              className="flex items-center"
                              style={{ border: "1px solid var(--border-default)" }}
                            >
                              <button
                                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                                className="w-8 h-8 flex items-center justify-center transition-colors duration-100 disabled:opacity-30"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => {
                                  if (!e.currentTarget.disabled)
                                    e.currentTarget.style.color = "var(--text-primary)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "var(--text-secondary)";
                                }}
                              >
                                <Minus size={12} />
                              </button>
                              <span
                                className="w-8 h-8 flex items-center justify-center text-[12px] font-bold"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  borderLeft: "1px solid var(--border-default)",
                                  borderRight: "1px solid var(--border-default)",
                                }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 flex items-center justify-center transition-colors duration-100 disabled:opacity-30"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => {
                                  if (!e.currentTarget.disabled)
                                    e.currentTarget.style.color = "var(--text-primary)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "var(--text-secondary)";
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Price + remove */}
                            <div className="flex items-center gap-4">
                              <span
                                className="text-[13px] font-black"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  color: price >= 1000 ? "var(--accent)" : "var(--text-primary)",
                                }}
                              >
                                {formatPrice(price * item.quantity)}
                              </span>
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="p-1.5 transition-colors duration-100"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "var(--error)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "var(--text-muted)")
                                }
                                aria-label="Usuń produkt"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Link
                    href="/single-cards"
                    className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase transition-colors duration-100"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <ArrowLeft size={12} />
                    Kontynuuj zakupy
                  </Link>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-4">
                <div style={{ border: "1px solid var(--border-default)" }}>
                  <div
                    className="px-5 py-4"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <h2
                      className="text-[11px] font-black tracking-[0.15em] uppercase"
                    >
                      Podsumowanie zamówienia
                    </h2>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    <div className="flex justify-between">
                      <span
                        className="text-[12px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Suma częściowa
                      </span>
                      <span
                        className="text-[12px] font-bold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className="text-[12px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Wysyłka
                      </span>
                      <span
                        className="text-[12px] font-bold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: shippingEstimate === 0 ? "var(--success)" : "var(--text-primary)",
                        }}
                      >
                        {shippingEstimate === 0 ? "Darmowa" : formatPrice(shippingEstimate)}
                      </span>
                    </div>
                    {shippingEstimate > 0 && (
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Darmowa wysyłka przy zamówieniach powyżej 500 PLN
                      </p>
                    )}
                  </div>

                  <div
                    className="px-5 py-4 flex justify-between"
                    style={{ borderTop: "1px solid var(--border-default)" }}
                  >
                    <span
                      className="text-[12px] font-black uppercase tracking-wider"
                    >
                      Suma
                    </span>
                    <span
                      className="text-[15px] font-black"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="px-5 pb-5">
                    <Link
                      href="/checkout"
                      className="block w-full text-center py-3.5 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
                      style={{
                        background: "var(--accent)",
                        color: "#000",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                    >
                      Przejdź do zamówienia
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
