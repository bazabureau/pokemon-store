"use client";

import { useState, useEffect } from "react";
import Card3D from "./Card3D";
import { productsAPI, Product } from "@/lib/api";

export default function HeroSection() {
  const [cards, setCards] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .list({ is_featured: "true", page_size: "3" })
      .then((res) => setCards(res.results.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getGradeBadge = (p: Product) => {
    if (p.grade && p.grading_company) return `${p.grading_company} ${p.grade}`;
    return null;
  };

  return (
    <section
      className="relative py-16 md:py-24 lg:py-32 overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,107,44,0.05) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 bottom-0 left-1/4 w-px" style={{ background: "var(--border-subtle)" }} />
        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "var(--border-subtle)" }} />
        <div className="absolute top-0 bottom-0 left-3/4 w-px" style={{ background: "var(--border-subtle)" }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title area */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-up">
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              Wyróżnione
            </span>
            <div className="w-8 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            <span
              className="text-[10px] tracking-[0.15em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Kolekcja Premium
            </span>
          </div>

          <h1
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-black uppercase tracking-tighter leading-[0.85] animate-fade-in-up"
            style={{ fontFamily: "var(--font-display)", animationDelay: "0.05s" }}
          >
            <span style={{ color: "var(--text-primary)" }}>Najlepsze </span>
            <span style={{ color: "var(--accent)" }}>Wybory</span>
          </h1>
        </div>

        {/* 3 Cards */}
        <div className="flex justify-center items-end gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {loading ? (
            // Skeleton loaders
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  width: i === 1 ? "240px" : "200px",
                  transform: i === 1 ? "translateY(-20px)" : "none",
                }}
              >
                <div
                  className="aspect-[3/4] rounded-2xl"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 mx-auto rounded" style={{ background: "var(--bg-surface)" }} />
                  <div className="h-4 w-1/2 mx-auto rounded" style={{ background: "var(--bg-surface)" }} />
                </div>
              </div>
            ))
          ) : cards.length > 0 ? (
            cards.map((card, i) => (
              <div
                key={card.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${0.1 + i * 0.15}s`,
                  transform: i === 1 ? "translateY(-24px)" : "none",
                }}
              >
                <Card3D
                  slug={card.slug}
                  name={card.name}
                  image={card.image}
                  price={card.price}
                  gradeBadge={getGradeBadge(card)}
                  condition={card.condition}
                  className={
                    i === 1
                      ? "w-[180px] sm:w-[220px] md:w-[260px]"
                      : "w-[150px] sm:w-[180px] md:w-[220px]"
                  }
                />
              </div>
            ))
          ) : (
            // Fallback if no featured products
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${0.1 + i * 0.15}s`,
                  transform: i === 1 ? "translateY(-24px)" : "none",
                }}
              >
                <Card3D
                  slug="single-cards"
                  name={["Charizard", "Pikachu", "Mewtwo"][i]}
                  image={null}
                  price={["2499.00", "899.00", "1599.00"][i]}
                  gradeBadge={["PSA 10", "CGC 9.5", "PSA 9"][i]}
                  condition={null}
                  className={
                    i === 1
                      ? "w-[180px] sm:w-[220px] md:w-[260px]"
                      : "w-[150px] sm:w-[180px] md:w-[220px]"
                  }
                />
              </div>
            ))
          )}
        </div>

        {/* Bottom stats bar */}
        <div
          className="flex justify-center gap-10 mt-12 md:mt-16 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { num: "5K+", label: "Kart w ofercie" },
            { num: "100%", label: "Autentyczność" },
            { num: "24h", label: "Szybka wysyłka" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span
                className="block text-lg sm:text-xl font-black"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.num}
              </span>
              <span
                className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em]"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
