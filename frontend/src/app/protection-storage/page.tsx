"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { productsAPI, Product } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

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

export default function ProtectionStoragePage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [protection, storage] = await Promise.all([
          productsAPI.list({ product_type: "protection" }),
          productsAPI.list({ product_type: "storage" }),
        ]);
        const combined = [
          ...(protection.results ?? []),
          ...(storage.results ?? []),
        ];
        setProducts(combined);
      } catch (err: any) {
        setError(err.message || "Could not load products");
        toast.error("Error", "Could not load products");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        <div
          className="relative py-12 overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.04) 0%, transparent 60%)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-3"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              [SUPPLIES]
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Protection & Storage
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Sleeves, top-loaders, binders, and storage solutions for your collection
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-[13px]" style={{ color: "var(--error)", fontFamily: "var(--font-mono)" }}>
                {error}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <h2
                className="text-xl font-black uppercase tracking-tight mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No products found
              </h2>
              <p
                className="text-[13px]"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                Check back soon for new supplies
              </p>
            </div>
          ) : (
            <>
              <p
                className="text-[11px] font-bold tracking-[0.15em] uppercase mb-6"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                {products.length} {products.length === 1 ? "product" : "products"}
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
