"use client";

import Link from "next/link";
import { ArrowRight, Mail, MapPin, CreditCard, Truck, Shield } from "lucide-react";
import { useState } from "react";

const NAV_GROUPS = [
  {
    heading: "Sklep",
    links: [
      { label: "Karty Pojedyncze", href: "/single-cards" },
      { label: "Slaby", href: "/slabs" },
      { label: "Produkty Zapakowane", href: "/sealed-products" },
      { label: "Ochrona i Przechowywanie", href: "/protection-storage" },
      { label: "Bestsellery", href: "/bestsellers" },
    ],
  },
  {
    heading: "Konto",
    links: [
      { label: "Moje konto", href: "/account" },
      { label: "Ulubione", href: "/favourites" },
      { label: "Historia zamówień", href: "/account" },
      { label: "Sprzedaj Swoje Karty", href: "/sell-your-cards" },
    ],
  },
  {
    heading: "Pomoc",
    links: [
      { label: "Informacje o wysyłce", href: "/shipping" },
      { label: "Kontakt", href: "/contact" },
      { label: "Regulamin", href: "/terms" },
      { label: "Polityka prywatności", href: "/privacy" },
    ],
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: "Potwierdzona autentyczność" },
  { icon: Truck, label: "Dostawa InPost" },
  { icon: CreditCard, label: "Bezpieczne płatności" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer style={{ background: "var(--bg-void)" }}>
      {/* ── TRUST STRIP ──────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--border-subtle)" }}>
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2.5 py-5">
                <Icon size={15} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
                <span
                  className="text-[9px] sm:text-[10px] font-bold tracking-[0.12em] uppercase hidden sm:block"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER ──────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand + Newsletter */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-5">
              <span
                className="text-2xl font-black uppercase tracking-tighter"
                style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}
              >
                Collectify
              </span>
            </Link>

            <p
              className="text-[12px] max-w-[360px] leading-relaxed mb-6"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            >
              Polska baza kart Pokemon premium.
              Wyselekcjonowane slaby, karty pojedyncze i produkty zapakowane — każda karta zweryfikowana, każda ocena potwierdzona.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <span
                className="text-[9px] font-bold tracking-[0.2em] uppercase block mb-3"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                Bądź na bieżąco
              </span>

              {subscribed ? (
                <div
                  className="flex items-center gap-2 py-2.5"
                  style={{ color: "var(--success)" }}
                >
                  <span
                    className="text-[11px] font-bold tracking-wider uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Zapisano! Sprawdź swoją skrzynkę.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <div className="relative flex-1 max-w-[280px]">
                    <Mail
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-[11px] outline-none transition-colors duration-150"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-default)",
                        borderRight: "none",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 flex items-center justify-center transition-all duration-150"
                    style={{
                      background: "var(--accent)",
                      color: "#000",
                      border: "1px solid var(--accent)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FFF";
                      e.currentTarget.style.borderColor = "#FFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--accent)";
                      e.currentTarget.style.borderColor = "var(--accent)";
                    }}
                    aria-label="Zapisz się"
                  >
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </form>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin size={12} style={{ color: "var(--text-muted)" }} />
              <span
                className="text-[10px] tracking-wider uppercase"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                Warszawa, Polska
              </span>
            </div>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {NAV_GROUPS.map((group) => (
              <div key={group.heading}>
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase block mb-4 pb-2"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  {group.heading}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-[11px] font-medium tracking-[0.06em] transition-all duration-150 inline-flex items-center gap-0"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-mono)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--accent)";
                          e.currentTarget.style.paddingLeft = "6px";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-secondary)";
                          e.currentTarget.style.paddingLeft = "0px";
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ───────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
            <span
              className="text-[10px] tracking-[0.12em] uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            >
              &copy; {new Date().getFullYear()} Collectify. Wszelkie prawa zastrzeżone.
            </span>

            {/* Payment method icons */}
            <div className="flex items-center gap-1.5">
              {[
                { name: "Visa", src: "/icons/payments/visa.svg" },
                { name: "Mastercard", src: "/icons/payments/mastercard.svg" },
                { name: "BLIK", src: "/icons/payments/blik.svg" },
                { name: "Przelewy24", src: "/icons/payments/p24.svg" },
                { name: "InPost", src: "/icons/payments/inpost.svg" },
              ].map((method) => (
                <div
                  key={method.name}
                  className="rounded-sm overflow-hidden transition-opacity duration-150 hover:opacity-80"
                  style={{ width: 46, height: 30 }}
                >
                  <img
                    src={method.src}
                    alt={method.name}
                    width={46}
                    height={30}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
