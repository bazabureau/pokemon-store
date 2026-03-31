"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "Karty Pojedyncze",
    count: "1,247",
    href: "/single-cards",
    tag: "RAW",
  },
  {
    title: "Slaby",
    count: "438",
    href: "/slabs",
    tag: "PSA/CGC/BGS",
  },
  {
    title: "Produkty Zapakowane",
    count: "89",
    href: "/sealed-products",
    tag: "BOXY/ETB",
  },
  {
    title: "Ochrona",
    count: "156",
    href: "/protection-storage",
    tag: "KOSZULKI/ETUI",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-2"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              [002] Kategorie
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sklep
            </h2>
          </div>
        </div>

        {/* Grid — gap-px creates borders automatically across all breakpoints */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: "var(--border-default)", border: "1px solid var(--border-default)" }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative flex flex-col justify-between p-6 sm:p-8 transition-colors duration-100 min-h-[180px]"
              style={{
                background: "var(--bg-surface)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-surface)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
            >
              <div>
                <span
                  className="text-[9px] font-bold tracking-[0.15em] uppercase block mb-1"
                  style={{ fontFamily: "var(--font-mono)", opacity: 0.5 }}
                >
                  {cat.tag}
                </span>
                <h3
                  className="text-xl sm:text-2xl font-black uppercase tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {cat.title}
                </h3>
              </div>
              <div className="flex items-end justify-between mt-4">
                <span
                  className="text-[11px] font-bold tracking-wider"
                  style={{ fontFamily: "var(--font-mono)", opacity: 0.4 }}
                >
                  {cat.count} produktów
                </span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-100 group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
