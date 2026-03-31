"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  productType: "single_card" | "slab" | "sealed" | "protection" | "storage";
  condition?: string;
  grade?: number;
  gradingCompany?: string;
  isNew?: boolean;
  isFavourited?: boolean;
  inStock?: boolean;
}

/* ─── FORMAT ────────────────────────────────── */

function formatPrice(p: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(p);
}

/* ─── GRADE BADGE ────────────────────────────── */

function GradeBadge({ grade, company }: { grade: number; company: string }) {
  const bg =
    grade >= 9.5
      ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
      : grade >= 9
        ? "linear-gradient(135deg, #E0E0E0 0%, #A0A0A0 100%)"
        : "linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)";

  return (
    <span
      className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase leading-none inline-flex items-center rounded-sm"
      style={{
        background: bg,
        color: "#000",
        fontFamily: "var(--font-mono)",
        boxShadow: grade >= 9.5 ? "0 2px 8px rgba(245,166,35,0.3)" : "none",
      }}
    >
      {company} {grade}
    </span>
  );
}

/* ─── PLACEHOLDERS ──────────────────────────── */

function CardPlaceholder({
  name,
  productType,
  grade,
  gradingCompany,
  condition,
}: {
  name: string;
  productType: string;
  grade?: number;
  gradingCompany?: string;
  condition?: string;
}) {
  const isSlab = productType === "slab";
  const isSealed = productType === "sealed";
  const accentColor = isSealed
    ? "rgba(255,107,44,0.12)"
    : isSlab
      ? (grade != null && grade >= 9.5 ? "rgba(245,166,35,0.12)" : "rgba(192,192,192,0.1)")
      : "rgba(255,255,255,0.06)";

  return (
    <div className="absolute inset-0" style={{ background: "var(--bg-elevated)" }}>
      {/* Accent stripe */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{
          background: isSealed
            ? "var(--accent)"
            : isSlab && grade != null && grade >= 9.5
              ? "var(--grade-gold)"
              : "var(--border-strong)",
        }}
      />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isSlab
            ? `repeating-linear-gradient(0deg, transparent, transparent 3px, ${accentColor} 3px, ${accentColor} 4px)`
            : isSealed
              ? `repeating-linear-gradient(0deg, transparent, transparent 20px, ${accentColor} 20px, ${accentColor} 21px)`
              : `repeating-linear-gradient(-45deg, transparent, transparent 16px, rgba(255,255,255,0.008) 16px, rgba(255,255,255,0.008) 17px)`,
        }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        {isSlab && grade != null && gradingCompany ? (
          <>
            <span
              className="text-[8px] font-bold tracking-[0.3em] uppercase"
              style={{
                color: grade >= 9.5 ? "var(--grade-gold)" : "var(--grade-silver)",
                fontFamily: "var(--font-mono)",
                opacity: 0.5,
              }}
            >
              {gradingCompany}
            </span>
            <span
              className="text-[3rem] font-black leading-none"
              style={{
                color: grade >= 9.5 ? "var(--grade-gold)" : "var(--grade-silver)",
                fontFamily: "var(--font-display)",
                opacity: 0.15,
              }}
            >
              {grade}
            </span>
          </>
        ) : isSealed ? (
          <div className="px-3 py-1" style={{ border: "1px solid rgba(255,107,44,0.15)" }}>
            <span
              className="text-[10px] font-black tracking-[0.25em] uppercase"
              style={{ color: "rgba(255,107,44,0.2)", fontFamily: "var(--font-mono)" }}
            >
              Zapakowane
            </span>
          </div>
        ) : (
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{ border: "1px solid var(--border-default)" }}
          >
            <span
              className="text-lg font-black"
              style={{ color: "rgba(255,255,255,0.06)", fontFamily: "var(--font-display)" }}
            >
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Name watermark */}
      <div className="absolute bottom-3 left-4 right-3 pointer-events-none overflow-hidden">
        <span
          className="text-[1.2rem] font-black leading-[0.85] uppercase tracking-tight block"
          style={{ color: "rgba(255,255,255,0.025)", fontFamily: "var(--font-display)" }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

/* ─── MAIN CARD ──────────────────────────────── */

export default function ProductCard({
  id,
  slug,
  name,
  price,
  image,
  productType,
  condition,
  grade,
  gradingCompany,
  isNew = false,
  isFavourited = false,
  inStock = true,
}: ProductCardProps) {
  const [isFav, setIsFav] = useState(isFavourited);
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const toast = useToast();

  const conditionLabel = condition?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingToCart || !inStock) return;
    setAddingToCart(true);
    try {
      await addItem(Number(id), 1);
      toast.success("Dodano", name);
    } catch {
      toast.error("Błąd", "Nie udało się dodać do koszyka");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
  };

  return (
    <div
      ref={cardRef}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-lg transition-all duration-300"
        style={{
          background: "var(--bg-surface)",
          border: `1px solid ${isHovered ? "rgba(255,107,44,0.3)" : "var(--border-subtle)"}`,
          transform: isHovered ? "translateY(-6px)" : "translateY(0)",
          boxShadow: isHovered
            ? "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,107,44,0.06)"
            : "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── IMAGE AREA ──────────────────────── */}
        <Link href={`/product/${slug}`} className="block relative">
          <div
            className="relative aspect-[3/4] overflow-hidden"
            style={{ background: "var(--bg-elevated)" }}
          >
            {image ? (
              <div
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
              >
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-3"
                />
              </div>
            ) : (
              <CardPlaceholder
                name={name}
                productType={productType}
                grade={grade}
                gradingCompany={gradingCompany}
                condition={condition}
              />
            )}

            {/* Hover glow overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: "radial-gradient(ellipse at 50% 80%, rgba(255,107,44,0.06) 0%, transparent 70%)",
                opacity: isHovered ? 1 : 0,
              }}
            />

            {/* Scan lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 3px)",
              }}
            />

            {/* ── BADGES (top-left) ─────────────── */}
            <div className="absolute top-0 left-0 flex flex-col gap-0 z-20">
              {isNew && (
                <span
                  className="px-2.5 py-1 text-[8px] font-black tracking-[0.15em] uppercase"
                  style={{
                    background: "var(--accent)",
                    color: "#000",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Nowość
                </span>
              )}
              {grade != null && gradingCompany && (
                <GradeBadge grade={grade} company={gradingCompany} />
              )}
              {condition && !grade && (
                <span
                  className="px-2 py-1 text-[8px] font-bold tracking-[0.12em] uppercase"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {conditionLabel}
                </span>
              )}
            </div>

            {/* ── ACTION BUTTONS (top-right) ────── */}
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5">
              {/* Favourite */}
              <button
                onClick={handleToggleFav}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: isFav ? "var(--accent)" : "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${isFav ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
                  opacity: isFav || isHovered ? 1 : 0,
                  transform: isFav || isHovered ? "scale(1)" : "scale(0.8)",
                }}
                aria-label={isFav ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
              >
                <Heart
                  size={12}
                  strokeWidth={2}
                  fill={isFav ? "white" : "none"}
                  color="white"
                />
              </button>

              {/* Quick view */}
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "scale(1)" : "scale(0.8)",
                  transitionDelay: "0.03s",
                }}
                aria-label="Szybki podgląd"
              >
                <Eye size={12} strokeWidth={2} color="white" />
              </button>
            </div>

            {/* ── SOLD OUT OVERLAY ──────────────── */}
            {!inStock && (
              <div
                className="absolute inset-0 z-30 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.85)" }}
              >
                <div className="text-center">
                  <span
                    className="text-[11px] font-black tracking-[0.2em] uppercase block"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    Wyprzedane
                  </span>
                  <div className="w-8 h-px mx-auto mt-2" style={{ background: "var(--text-muted)", opacity: 0.3 }} />
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* ── INFO AREA ───────────────────────── */}
        <div className="px-3 py-3 sm:px-4 sm:py-3.5">
          <Link href={`/product/${slug}`}>
            <h3
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] leading-snug mb-2.5 line-clamp-2 transition-colors duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                color: isHovered ? "var(--accent)" : "var(--text-primary)",
              }}
            >
              {name}
            </h3>
          </Link>

          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[14px] sm:text-[16px] font-black tracking-tight"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
            >
              {formatPrice(price)}
            </span>

            {inStock && (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200"
                style={{
                  background: isHovered ? "var(--accent)" : "transparent",
                  color: isHovered ? "#000" : "var(--text-muted)",
                  border: `1px solid ${isHovered ? "var(--accent)" : "var(--border-default)"}`,
                  opacity: addingToCart ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFF";
                  e.currentTarget.style.color = "#000";
                  e.currentTarget.style.borderColor = "#FFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isHovered ? "var(--accent)" : "transparent";
                  e.currentTarget.style.color = isHovered ? "#000" : "var(--text-muted)";
                  e.currentTarget.style.borderColor = isHovered ? "var(--accent)" : "var(--border-default)";
                }}
                aria-label="Dodaj do koszyka"
              >
                <ShoppingBag size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
