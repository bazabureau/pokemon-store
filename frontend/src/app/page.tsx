"use client";

import { useState, useEffect, useCallback } from "react";
import BinderIntro from "@/components/binder/BinderIntro";
import Header from "@/components/layout/Header";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { ProductCardProps } from "@/components/products/ProductCard";
import { productsAPI } from "@/lib/api";
import { toCardProps } from "@/lib/types";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [newArrivals, setNewArrivals] = useState<ProductCardProps[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const [newRes, bestRes] = await Promise.all([
          productsAPI.list({ is_new: 'true', page_size: '8' }),
          productsAPI.list({ is_featured: 'true', page_size: '8' }),
        ]);
        setNewArrivals((newRes.results ?? []).map(toCardProps));
        setBestsellers((bestRes.results ?? []).map(toCardProps));
      } catch {
        setNewArrivals([]);
        setBestsellers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      {!introComplete && <BinderIntro onComplete={handleIntroComplete} />}

      <div
        className="min-h-screen transition-opacity duration-700"
        style={{
          opacity: introComplete ? 1 : 0,
          pointerEvents: introComplete ? "auto" : "none",
        }}
      >
        <AnnouncementBar />
        <Header />

        <main className="pt-[92px]">

          {/* Hero — no top border, sits directly below announcement */}
          <HeroSection />

          {/* Categories — border-top separates from hero */}
          <ScrollReveal direction="up" delay={0.1}>
            <div style={{ borderTop: "1px solid var(--border-default)" }}>
              <CategoryShowcase />
            </div>
          </ScrollReveal>

          {/* New Arrivals — border-top, standard spacing */}
          <ScrollReveal direction="up" delay={0.05}>
            <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <FeaturedProducts
                title="Nowości"
                subtitle="Świeżo dodane do kolekcji"
                viewAllHref="/single-cards?sort=newest"
                accentLabel="003"
                products={newArrivals}
                loading={loading}
              />
            </div>
          </ScrollReveal>

          {/* Bestsellers — tighter top since it follows same section type */}
          <ScrollReveal direction="up" delay={0.05}>
            <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <FeaturedProducts
                title="Bestsellery"
                subtitle="Najbardziej poszukiwane przez kolekcjonerów"
                viewAllHref="/bestsellers"
                accentLabel="004"
                products={bestsellers}
                loading={loading}
              />
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal direction="up" delay={0.05}>
            <section
              className="py-16 md:py-24"
              style={{
                borderTop: "1px solid var(--border-default)",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-8">
                    <span
                      className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-3"
                      style={{
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      [005]
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Masz karty
                      <br />
                      do sprzedania?
                    </h2>
                    <p
                      className="text-[13px] max-w-md leading-relaxed"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Kupujemy karty Pokemon premium. Wyślij nam zdjęcia i otrzymaj
                      uczciwą ofertę w ciągu 24 godzin. Bez opłat, bez problemów.
                    </p>
                  </div>
                  <div className="md:col-span-4 md:text-right">
                    <a
                      href="/sell-your-cards"
                      className="inline-block px-8 py-3.5 text-[13px] font-black uppercase tracking-wider transition-colors duration-100"
                      style={{
                        background: "var(--accent)",
                        color: "#000",
                        fontFamily: "var(--font-mono)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                      }}
                    >
                      Uzyskaj wycenę &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>
        </main>

        <Footer />
      </div>
    </>
  );
}
