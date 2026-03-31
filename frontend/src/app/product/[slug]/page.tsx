"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ChevronLeft,
  Shield,
  Truck,
  Award,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard, { ProductCardProps } from "@/components/products/ProductCard";
import ReviewSection from "@/components/products/ReviewSection";
import { productsAPI, favoritesAPI, Product } from "@/lib/api";
import { toCardProps } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductCardProps[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch product
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    productsAPI
      .get(slug)
      .then((data) => {
        setProduct(data);
      })
      .catch(() => {
        setError("Product not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch similar products
  useEffect(() => {
    productsAPI
      .list({ page_size: "4" })
      .then((data) => {
        setSimilarProducts(data.results.map(toCardProps));
      })
      .catch(() => {});
  }, []);

  const formatPrice = (p: number | string) => {
    const num = typeof p === "string" ? parseFloat(p) : p;
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(num);
  };

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x, y });
      setIsZooming(true);
    },
    []
  );

  const handleAddToCart = async () => {
    if (!product || !product.in_stock || addingToCart) return;
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      toast.success("Dodano do koszyka", `${product.name} dodano do koszyka`);
    } catch {
      toast.error("Błąd", "Nie udało się dodać do koszyka");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFav = async () => {
    if (!product || togglingFav) return;
    setTogglingFav(true);
    try {
      const res = await favoritesAPI.toggle(product.id);
      const added = res.status === "added";
      setIsFav(added);
      toast.success(
        added ? "Dodano do ulubionych" : "Usunięto z ulubionych",
        product.name
      );
    } catch {
      toast.error("Błąd", "Nie udało się zaktualizować ulubionych");
    } finally {
      setTogglingFav(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Header />
        <main className="pt-[72px]">
          <div className="max-w-[1400px] mx-auto px-6 py-4">
            <div className="h-4 w-48 rounded" style={{ background: "var(--bg-surface)" }} />
          </div>
          <div className="max-w-[1400px] mx-auto px-6 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              <div
                className="aspect-[3/4] rounded-xl animate-pulse"
                style={{ background: "var(--bg-surface)" }}
              />
              <div className="lg:pt-4 space-y-4">
                <div className="h-4 w-24 rounded" style={{ background: "var(--bg-surface)" }} />
                <div className="h-10 w-3/4 rounded" style={{ background: "var(--bg-surface)" }} />
                <div className="flex gap-2">
                  <div className="h-6 w-20 rounded-full" style={{ background: "var(--bg-surface)" }} />
                  <div className="h-6 w-24 rounded-full" style={{ background: "var(--bg-surface)" }} />
                  <div className="h-6 w-20 rounded-full" style={{ background: "var(--bg-surface)" }} />
                </div>
                <div className="h-8 w-36 rounded" style={{ background: "var(--bg-surface)" }} />
                <div className="h-12 w-full rounded-xl" style={{ background: "var(--bg-surface)" }} />
                <div className="space-y-2 mt-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-4 w-full rounded" style={{ background: "var(--bg-surface)" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Header />
        <main className="pt-[72px]">
          <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
            <h1
              className="text-3xl font-extrabold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Produkt nie znaleziony
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
              Szukany produkt nie istnieje lub został usunięty.
            </p>
            <Link
              href="/single-cards"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              <ChevronLeft size={14} />
              Przeglądaj karty
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSingleItem =
    product.product_type === "single_card" || product.product_type === "slab";
  const isSlab = product.product_type === "slab";

  const conditionLabel = product.condition
    ? product.condition.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              Strona główna
            </Link>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <Link
              href="/single-cards"
              className="transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              Karty Pojedyncze
            </Link>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product detail grid */}
        <div className="max-w-[1400px] mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Image */}
            <div>
              <div
                ref={imageContainerRef}
                className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-zoom-in card-holo"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={() => setIsZooming(false)}
              >
                {product.image ? (
                  <div
                    className="absolute inset-0 transition-transform duration-300"
                    style={{
                      transform: isZooming
                        ? `scale(1.8) translate(${50 - zoomPos.x}%, ${50 - zoomPos.y}%)`
                        : "scale(1)",
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: isZooming
                        ? `scale(1.8) translate(${50 - zoomPos.x}%, ${50 - zoomPos.y}%)`
                        : "scale(1)",
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  >
                    <div
                      className="w-48 h-64 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,107,44,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Zdjęcie karty
                      </span>
                    </div>
                  </div>
                )}

                {/* Zoom hint */}
                {!isZooming && (
                  <div
                    className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "var(--text-muted)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Najedź, aby powiększyć
                  </div>
                )}
              </div>

              {/* Thumbnail row */}
              <div className="flex gap-2 mt-3">
                {[product.image, product.image_2, product.image_3]
                  .filter(Boolean)
                  .map((img, i) => (
                    <button
                      key={i}
                      className="w-16 h-20 rounded-lg overflow-hidden transition-all duration-200 relative"
                      style={{
                        background: "var(--bg-surface)",
                        border:
                          i === 0
                            ? "2px solid var(--accent)"
                            : "1px solid var(--border-subtle)",
                      }}
                    >
                      {img ? (
                        <Image
                          src={img}
                          alt={`${product.name} view ${i + 1}`}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            className="text-[8px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {["Przód", "Tył", "Zbliżenie"][i]}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                {/* If no images at all, show placeholder thumbnails */}
                {!product.image && !product.image_2 && !product.image_3 &&
                  [0, 1, 2].map((i) => (
                    <button
                      key={i}
                      className="w-16 h-20 rounded-lg overflow-hidden transition-all duration-200"
                      style={{
                        background: "var(--bg-surface)",
                        border:
                          i === 0
                            ? "2px solid var(--accent)"
                            : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span
                          className="text-[8px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {["Przód", "Tył", "Zbliżenie"][i]}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:pt-4">
              {/* Back link */}
              <Link
                href="/single-cards"
                className="inline-flex items-center gap-1 text-xs mb-6 transition-colors duration-200"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <ChevronLeft size={12} />
                Wróć do kart
              </Link>

              {/* Title */}
              <h1
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </h1>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {conditionLabel && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    {conditionLabel}
                  </span>
                )}
                {product.set_name && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {product.set_name}
                  </span>
                )}
                {product.rarity && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {product.rarity}
                  </span>
                )}
                {isSlab && product.grade && product.grading_company && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {product.grading_company} {product.grade}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-8">
                <span
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-primary)",
                  }}
                >
                  {formatPrice(product.price)}
                </span>
                <div
                  className="flex items-center gap-1.5 mt-1.5"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: product.in_stock
                        ? "var(--success)"
                        : "var(--error)",
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: product.in_stock
                        ? "var(--success)"
                        : "var(--error)",
                    }}
                  >
                    {product.in_stock ? "W magazynie" : "Wyprzedane"}
                  </span>
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-3 mb-4">
                {/* Quantity selector - only for non-unique items */}
                {!isSingleItem && (
                  <div
                    className="flex items-center rounded-lg overflow-hidden"
                    style={{
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 transition-colors duration-150 disabled:opacity-30"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      className="w-10 text-center text-sm font-bold tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stock_quantity || 1, quantity + 1)
                        )
                      }
                      disabled={quantity >= (product.stock_quantity || 1)}
                      className="p-3 transition-colors duration-150 disabled:opacity-30"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                {/* Add to cart button */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300"
                  style={{
                    background: product.in_stock
                      ? "var(--accent)"
                      : "var(--bg-elevated)",
                    color: product.in_stock ? "white" : "var(--text-muted)",
                    boxShadow: product.in_stock
                      ? "0 0 30px rgba(255,107,44,0.2)"
                      : "none",
                    cursor: product.in_stock ? "pointer" : "not-allowed",
                    opacity: addingToCart ? 0.7 : 1,
                  }}
                  disabled={!product.in_stock || addingToCart}
                  onClick={handleAddToCart}
                  onMouseEnter={(e) => {
                    if (product.in_stock)
                      e.currentTarget.style.boxShadow =
                        "0 0 40px rgba(255,107,44,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    if (product.in_stock)
                      e.currentTarget.style.boxShadow =
                        "0 0 30px rgba(255,107,44,0.2)";
                  }}
                >
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  {addingToCart
                    ? "Dodawanie..."
                    : product.in_stock
                    ? "Dodaj do koszyka"
                    : "Wyprzedane"}
                </button>

                {/* Favourite button */}
                <button
                  onClick={handleToggleFav}
                  disabled={togglingFav}
                  className="p-3.5 rounded-xl transition-all duration-200"
                  style={{
                    background: isFav
                      ? "var(--accent-soft)"
                      : "transparent",
                    border: `1px solid ${
                      isFav ? "var(--border-accent)" : "var(--border-default)"
                    }`,
                    color: isFav ? "var(--accent)" : "var(--text-secondary)",
                    opacity: togglingFav ? 0.7 : 1,
                  }}
                  aria-label={
                    isFav ? "Usuń z ulubionych" : "Dodaj do ulubionych"
                  }
                >
                  <Heart
                    size={16}
                    strokeWidth={1.5}
                    fill={isFav ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Trust badges */}
              <div
                className="grid grid-cols-3 gap-3 mb-8 py-5"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                {[
                  { icon: Shield, label: "Potwierdzona autentyczność" },
                  { icon: Truck, label: "Dostawa InPost" },
                  { icon: Award, label: "Gwarancja jakości" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      style={{ color: "var(--text-muted)" }}
                    />
                    <span
                      className="text-[10px] tracking-wide uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <div
                  className="pb-6 mb-6"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <h3
                    className="text-xs font-bold tracking-[0.12em] uppercase mb-3"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Opis
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* Card details table */}
              <div>
                <h3
                  className="text-xs font-bold tracking-[0.12em] uppercase mb-3"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Szczegóły karty
                </h3>
                <dl className="space-y-2">
                  {(
                    [
                      ["Seria", product.set_name],
                      ["Rzadkość", product.rarity],
                      ["Numer", product.card_number],
                      ["Stan", conditionLabel],
                      ...(isSlab && product.grade
                        ? [["Ocena", `${product.grading_company ?? ""} ${product.grade}`]]
                        : []),
                      ["Język", product.language],
                    ] as [string, string | null | undefined][]
                  )
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      >
                        <dt
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {label}
                        </dt>
                        <dd
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <ReviewSection productId={product.id} />

          {/* Similar products */}
          {similarProducts.length > 0 && (
            <section className="mt-20">
              <h2
                className="text-2xl font-extrabold tracking-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Więcej podobnych produktów
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
