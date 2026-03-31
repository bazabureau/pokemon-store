"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Building2, Wallet, Lock, Tag } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ordersAPI, couponsAPI, CouponValidation } from "@/lib/api";

function formatPrice(p: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(p);
}

const PAYMENT_METHODS = [
  { id: "card", label: "Karta kredytowa / debetowa", icon: CreditCard },
  { id: "blik", label: "BLIK", icon: Wallet },
  { id: "p24", label: "Przelewy24", icon: Building2 },
];

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#e0e0e0",
      fontFamily: "monospace",
      fontSize: "12px",
      letterSpacing: "0.05em",
      "::placeholder": {
        color: "#666",
      },
    },
    invalid: {
      color: "#ff4444",
    },
  },
};

interface CheckoutFormProps {
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

function CheckoutForm({ inputStyle, labelStyle }: CheckoutFormProps) {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: user?.email ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "PL",
    payment_method: "card",
    notes: "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shippingCost = subtotal >= 500 ? 0 : 19.99;
  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const total = appliedCoupon
    ? parseFloat(appliedCoupon.new_total) + shippingCost
    : subtotal + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);
    try {
      const result = await couponsAPI.validate(couponCode.trim(), subtotal);
      setAppliedCoupon(result);
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Pusty koszyk", "Dodaj produkty przed złożeniem zamówienia");
      return;
    }

    if (form.payment_method === "card") {
      if (!stripe || !elements) {
        toast.error("Błąd płatności", "Stripe jeszcze się nie załadował. Spróbuj ponownie.");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Błąd płatności", "Nie znaleziono pola karty. Odśwież stronę i spróbuj ponownie.");
        return;
      }

      setIsSubmitting(true);
      try {
        const paymentData = {
          ...form,
          ...(appliedCoupon ? { coupon_code: appliedCoupon.coupon.code } : {}),
        };
        const { client_secret, order } = await ordersAPI.createPaymentIntent(paymentData);

        const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${form.first_name} ${form.last_name}`,
              email: form.email,
              phone: form.phone,
            },
          },
        });

        if (error) {
          toast.error("Płatność nieudana", error.message || "Twoja płatność nie powiodła się.");
          return;
        }

        if (paymentIntent?.status === "succeeded") {
          await clearCart();
          toast.success("Zamówienie złożone", `Zamówienie #${order.order_number} potwierdzone`);
          router.push(`/order-confirmation/${order.id}`);
        }
      } catch (err: any) {
        toast.error("Błąd zamówienia", err.message || "Spróbuj ponownie");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Non-card payment methods — fall back to existing checkout flow
      setIsSubmitting(true);
      try {
        const checkoutData = {
          ...form,
          ...(appliedCoupon ? { coupon_code: appliedCoupon.coupon.code } : {}),
        };
        const order = await ordersAPI.checkout(checkoutData);
        await clearCart();
        toast.success("Order Placed", `Order #${order.order_number} confirmed`);
        router.push(`/order-confirmation/${order.id}`);
      } catch (err: any) {
        toast.error("Błąd zamówienia", err.message || "Spróbuj ponownie");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Header />
        <main className="pt-[72px]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1
              className="text-2xl font-black uppercase tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nie ma nic do zamówienia
            </h1>
            <p
              className="text-[13px] mb-8"
              style={{ color: "var(--text-muted)" }}
            >
              Twój koszyk jest pusty. Najpierw dodaj produkty.
            </p>
            <Link
              href="/single-cards"
              className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
              style={{ background: "var(--accent)", color: "#000" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              Przeglądaj Karty
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div
        className="py-12"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase mb-4 transition-colors duration-100"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <ArrowLeft size={12} />
            Wróć do koszyka
          </Link>
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-3"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            [ZAMÓWIENIE]
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Zamówienie
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form sections */}
            <div className="lg:col-span-7 space-y-6">
              {/* Contact */}
              <div style={{ border: "1px solid var(--border-subtle)" }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h2
                    className="text-[11px] font-black tracking-[0.15em] uppercase"
                  >
                    Dane kontaktowe
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label style={labelStyle}>E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                      style={inputStyle}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Imię</label>
                      <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Nazwisko</label>
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Telefon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                      style={inputStyle}
                      placeholder="+48 ..."
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div style={{ border: "1px solid var(--border-subtle)" }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h2
                    className="text-[11px] font-black tracking-[0.15em] uppercase"
                  >
                    Adres dostawy
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label style={labelStyle}>Adres</label>
                    <input
                      type="text"
                      name="shipping_address"
                      value={form.shipping_address}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                      style={inputStyle}
                      placeholder="Ulica, budynek, mieszkanie"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Miasto</label>
                      <input
                        type="text"
                        name="shipping_city"
                        value={form.shipping_city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Kod pocztowy</label>
                      <input
                        type="text"
                        name="shipping_postal_code"
                        value={form.shipping_postal_code}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                        style={inputStyle}
                        placeholder="00-000"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Kraj</label>
                    <select
                      name="shipping_country"
                      value={form.shipping_country}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                      style={inputStyle}
                    >
                      <option value="PL">Polska</option>
                      <option value="DE">Niemcy</option>
                      <option value="CZ">Czechy</option>
                      <option value="SK">Słowacja</option>
                      <option value="LT">Litwa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div style={{ border: "1px solid var(--border-subtle)" }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h2
                    className="text-[11px] font-black tracking-[0.15em] uppercase"
                  >
                    Metoda płatności
                  </h2>
                </div>
                <div className="p-5 space-y-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = form.payment_method === method.id;
                    return (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100"
                        style={{
                          border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`,
                          background: isSelected ? "var(--accent-soft)" : "transparent",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 flex items-center justify-center shrink-0"
                          style={{
                            border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-strong)"}`,
                            borderRadius: "50%",
                          }}
                        >
                          {isSelected && (
                            <div
                              className="w-2 h-2"
                              style={{ background: "var(--accent)", borderRadius: "50%" }}
                            />
                          )}
                        </div>
                        <Icon
                          size={16}
                          style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}
                        />
                        <span
                          className="text-[12px] font-bold uppercase tracking-wider"
                          style={{
                            color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                          }}
                        >
                          {method.label}
                        </span>
                      </label>
                    );
                  })}

                  {/* Stripe CardElement — only visible when card is selected */}
                  {form.payment_method === "card" && (
                    <div
                      className="mt-4 px-4 py-3"
                      style={{
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-surface)",
                      }}
                    >
                      <label style={labelStyle}>Dane karty</label>
                      <div
                        className="px-3 py-2.5"
                        style={{
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-default)",
                        }}
                      >
                        <CardElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div style={{ border: "1px solid var(--border-subtle)" }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h2
                    className="text-[11px] font-black tracking-[0.15em] uppercase"
                  >
                    Uwagi do zamówienia (opcjonalne)
                  </h2>
                </div>
                <div className="p-5">
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none"
                    style={inputStyle}
                    placeholder="Dodatkowe instrukcje..."
                  />
                </div>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-5">
              <div
                className="lg:sticky lg:top-[90px]"
                style={{ border: "1px solid var(--border-default)" }}
              >
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

                {/* Items */}
                <div className="max-h-[300px] overflow-y-auto">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex gap-3 px-5 py-3"
                      style={{
                        borderBottom:
                          idx < items.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                      }}
                    >
                      <div
                        className="w-12 h-14 shrink-0 flex items-center justify-center"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <span
                          className="text-sm font-black"
                          style={{
                            color: "rgba(255,255,255,0.04)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {item.product.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[11px] font-bold uppercase tracking-wider line-clamp-1"
                        >
                          {item.product.name}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{
                            color: "var(--text-muted)",
                          }}
                        >
                          Ilość: {item.quantity}
                        </p>
                      </div>
                      <span
                        className="text-[12px] font-bold shrink-0"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {formatPrice(parseFloat(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon code section */}
                <div
                  className="px-5 py-4"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <label style={labelStyle}>
                    <span className="inline-flex items-center gap-1.5">
                      <Tag size={10} />
                      Kod rabatowy
                    </span>
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[12px] font-bold uppercase tracking-wider px-2 py-1"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "#22c55e",
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          {appliedCoupon.coupon.code}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "#22c55e", fontFamily: "var(--font-mono)" }}
                        >
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 transition-colors duration-100"
                        style={{
                          color: "var(--text-muted)",
                          background: "transparent",
                          border: "1px solid var(--border-default)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--text-primary)";
                          e.currentTarget.style.borderColor = "var(--border-strong)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.borderColor = "var(--border-default)";
                        }}
                      >
                        Usuń
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponError) setCouponError("");
                          }}
                          className="flex-1 px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                          style={inputStyle}
                          placeholder="Wpisz kod"
                          disabled={couponLoading}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-40"
                          style={{
                            background: "var(--accent)",
                            color: "#000",
                          }}
                          onMouseEnter={(e) => {
                            if (!couponLoading && couponCode.trim())
                              e.currentTarget.style.background = "#FFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--accent)";
                          }}
                        >
                          {couponLoading ? "..." : "Zastosuj"}
                        </button>
                      </div>
                      {couponError && (
                        <p
                          className="text-[10px] mt-2"
                          style={{ color: "#ef4444" }}
                        >
                          {couponError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Totals */}
                <div
                  className="px-5 py-4 space-y-2"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex justify-between">
                    <span
                      className="text-[12px]"
                      style={{
                        color: "var(--text-secondary)",
                      }}
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
                  {appliedCoupon && (
                    <div className="flex justify-between">
                      <span
                        className="text-[12px]"
                        style={{
                          color: "#22c55e",
                        }}
                      >
                        Rabat
                      </span>
                      <span
                        className="text-[12px] font-bold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "#22c55e",
                        }}
                      >
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span
                      className="text-[12px]"
                      style={{
                        color: "var(--text-secondary)",
                      }}
                    >
                      Wysyłka
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          shippingCost === 0
                            ? "var(--success)"
                            : "var(--text-primary)",
                      }}
                    >
                      {shippingCost === 0 ? "Darmowa" : formatPrice(shippingCost)}
                    </span>
                  </div>
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
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="px-5 pb-5">
                  <button
                    type="submit"
                    disabled={isSubmitting || (form.payment_method === "card" && !stripe)}
                    className="w-full py-3.5 text-[12px] font-black uppercase tracking-wider transition-colors duration-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: "var(--accent)",
                      color: "#000",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.currentTarget.style.background = "#FFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--accent)";
                    }}
                  >
                    <Lock size={12} />
                    {isSubmitting ? "Przetwarzanie..." : "Złóż zamówienie"}
                  </button>
                  <p
                    className="text-[10px] text-center mt-3"
                    style={{
                      color: "var(--text-muted)",
                    }}
                  >
                    Bezpieczne zamówienie. Twoje dane są szyfrowane.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const items = cart?.items ?? [];

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontSize: "12px",
    letterSpacing: "0.05em",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: "6px",
    display: "block",
  };

  // Show empty state without loading Stripe
  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Header />
        <main className="pt-[72px]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1
              className="text-2xl font-black uppercase tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nie ma nic do zamówienia
            </h1>
            <p
              className="text-[13px] mb-8"
              style={{ color: "var(--text-muted)" }}
            >
              Twój koszyk jest pusty. Najpierw dodaj produkty.
            </p>
            <Link
              href="/single-cards"
              className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
              style={{ background: "var(--accent)", color: "#000" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              Przeglądaj Karty
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />
      <main className="pt-[72px]">
        <Elements stripe={stripePromise}>
          <CheckoutForm inputStyle={inputStyle} labelStyle={labelStyle} />
        </Elements>
      </main>
      <Footer />
    </div>
  );
}
