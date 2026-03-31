"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import ProductCard, {
  ProductCardProps,
} from "@/components/products/ProductCard";

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  products: ProductCardProps[];
  accentLabel?: string;
  loading?: boolean;
}

export default function FeaturedProducts({
  title,
  subtitle,
  viewAllHref,
  products,
  accentLabel,
  loading = false,
}: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for entrance animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll state tracking
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 280;
    el.scrollBy({ left: dir === "right" ? cardW + 16 : -(cardW + 16), behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="py-14 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── HEADER ────────────────────────────── */}
        <div
          className="flex items-end justify-between mb-10 pb-6"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              {accentLabel && (
                <span
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                  [{accentLabel}]
                </span>
              )}
              {subtitle && (
                <>
                  <div className="w-4 h-px" style={{ background: "var(--border-default)" }} />
                  <span
                    className="text-[10px] tracking-[0.12em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {subtitle}
                  </span>
                </>
              )}
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation arrows */}
            <div className="hidden sm:flex items-center gap-1">
              {(["left", "right"] as const).map((dir) => {
                const enabled = dir === "left" ? canScrollLeft : canScrollRight;
                const Icon = dir === "left" ? ArrowLeft : ArrowRight;
                return (
                  <button
                    key={dir}
                    onClick={() => scroll(dir)}
                    disabled={!enabled}
                    className="w-9 h-9 flex items-center justify-center transition-all duration-150"
                    style={{
                      border: "1px solid var(--border-default)",
                      color: enabled ? "var(--text-primary)" : "var(--text-muted)",
                      opacity: enabled ? 1 : 0.25,
                      cursor: enabled ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => {
                      if (enabled) {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                        e.currentTarget.style.background = "rgba(255,107,44,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-default)";
                      e.currentTarget.style.color = enabled ? "var(--text-primary)" : "var(--text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                    aria-label={`Scroll ${dir}`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </button>
                );
              })}
            </div>

            {/* View all link */}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 group"
                style={{
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.background = "rgba(255,107,44,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Zobacz wszystko
                <ArrowRight size={11} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── CARD CAROUSEL ───────────────────────── */}
      <div className="relative">
        {/* Edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: "linear-gradient(to right, var(--bg-primary), transparent)",
            opacity: canScrollLeft ? 1 : 0,
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: "linear-gradient(to left, var(--bg-primary), transparent)",
            opacity: canScrollRight ? 1 : 0,
          }}
        />

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
            paddingLeft: "max(1rem, calc((100vw - 1400px) / 2 + 1.5rem))",
            paddingRight: "2rem",
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  data-card
                  className="shrink-0 animate-pulse"
                  style={{ width: "clamp(200px, 22vw, 280px)", scrollSnapAlign: "start" }}
                >
                  <div
                    className="aspect-[3/4]"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                  />
                  <div className="mt-3 space-y-2 px-1">
                    <div className="h-3 rounded w-4/5" style={{ background: "var(--bg-surface)" }} />
                    <div className="h-4 rounded w-2/5" style={{ background: "var(--bg-surface)" }} />
                  </div>
                </div>
              ))
            : products.slice(0, 12).map((product, i) => (
                <div
                  key={product.id}
                  data-card
                  className="shrink-0"
                  style={{
                    width: "clamp(200px, 22vw, 280px)",
                    scrollSnapAlign: "start",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`,
                  }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
        </div>
      </div>

      {/* Mobile view all */}
      {viewAllHref && (
        <div className="mt-8 text-center sm:hidden px-4">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-6 py-2.5 transition-all duration-150"
            style={{
              color: "var(--accent)",
              border: "1px solid var(--accent)",
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
            Zobacz wszystko
            <ArrowRight size={11} />
          </Link>
        </div>
      )}
    </section>
  );
}
