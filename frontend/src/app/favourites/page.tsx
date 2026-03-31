"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { favoritesAPI, Product } from "@/lib/api";

function toCardProps(p: Product) {
  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    price: parseFloat(p.price),
    image: p.image ?? "",
    productType: p.product_type as "single_card" | "slab" | "sealed" | "protection" | "storage",
    condition: p.condition ?? undefined,
    grade: p.grade ? parseFloat(p.grade) : undefined,
    gradingCompany: p.grading_company ?? undefined,
    isNew: p.is_new,
    isFavourited: true,
    inStock: p.in_stock,
  };
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] mb-3" style={{ background: "var(--bg-elevated)" }} />
          <div className="space-y-2 px-1">
            <div className="h-3 w-3/4" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-3 w-1/3" style={{ background: "var(--bg-elevated)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FavouritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    favoritesAPI
      .list()
      .then((data) => {
        const items = data.results ?? [];
        setProducts(items.map((f) => f.product));
      })
      .catch((err) => {
        setError(err.message || "Could not load favourites");
        toast.error("Błąd", "Nie udało się załadować ulubionych");
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        {/* Header */}
        <div
          className="py-12"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.04) 0%, transparent 60%)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-3"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              [ULUBIONE]
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ulubione
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Twoje zapisane karty i produkty
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {authLoading || loading ? (
            <SkeletonGrid />
          ) : !isAuthenticated ? (
            /* Not logged in */
            <div className="text-center py-20">
              <div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <Heart size={28} style={{ color: "var(--text-muted)" }} />
              </div>
              <h2
                className="text-xl font-black uppercase tracking-tight mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Zaloguj się, aby zobaczyć ulubione
              </h2>
              <p
                className="text-[13px] mb-8"
                style={{ color: "var(--text-muted)" }}
              >
                Utwórz konto lub zaloguj się, aby zapisywać karty do swojej kolekcji
              </p>
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
                style={{ background: "var(--accent)", color: "#000" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                Przejdź do konta
              </Link>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-[13px]" style={{ color: "var(--error)" }}>
                {error}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <Heart size={28} style={{ color: "var(--text-muted)" }} />
              </div>
              <h2
                className="text-xl font-black uppercase tracking-tight mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Brak ulubionych
              </h2>
              <p
                className="text-[13px] mb-8"
                style={{ color: "var(--text-muted)" }}
              >
                Przeglądaj naszą kolekcję i kliknij ikonę serca, aby zapisać karty tutaj
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
          ) : (
            <>
              <p
                className="text-[11px] font-bold tracking-[0.15em] uppercase mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                {products.length} {products.length === 1 ? "produkt" : "produktów"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
                {products.map((product) => (
                  <ProductCard key={product.id} {...toCardProps(product)} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
