"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FilterBar from "@/components/products/FilterBar";
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

const FILTERS = [
  {
    key: "grading_company",
    label: "Grading Company",
    options: [
      { label: "PSA", value: "PSA" },
      { label: "CGC", value: "CGC" },
      { label: "Beckett (BGS)", value: "BGS" },
    ],
  },
  {
    key: "grade",
    label: "Grade",
    options: [
      { label: "10 -- Gem Mint", value: "10" },
      { label: "9.5 -- Mint+", value: "9.5" },
      { label: "9 -- Mint", value: "9" },
      { label: "8.5 -- NM-MT+", value: "8.5" },
      { label: "8 -- Near Mint", value: "8" },
    ],
  },
  {
    key: "price",
    label: "Price",
    options: [
      { label: "Under 500 PLN", value: "0-500" },
      { label: "500-2000 PLN", value: "500-2000" },
      { label: "2000-10000 PLN", value: "2000-10000" },
      { label: "Over 10000 PLN", value: "10000+" },
    ],
  },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
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

export default function SlabsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = { product_type: "slab" };

    const company = activeFilters.grading_company;
    if (company && company.length > 0) {
      params.grading_company = company.join(",");
    }
    const grade = activeFilters.grade;
    if (grade && grade.length > 0) {
      params.grade = grade.join(",");
    }

    productsAPI
      .list(params)
      .then((data) => {
        setProducts(data.results ?? []);
      })
      .catch((err) => {
        setError(err.message || "Could not load products");
        toast.error("Error", "Could not load slabs");
      })
      .finally(() => setLoading(false));
  }, [activeFilters]);

  const handleFilterChange = (key: string, values: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [key]: values }));
  };

  const handleClearAll = () => {
    setActiveFilters({});
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header />

      <main className="pt-[72px]">
        {/* Header */}
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
              [SLABS]
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Graded Slabs
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Professionally graded Pokemon cards by PSA, CGC & Beckett
            </p>
          </div>
        </div>

        <FilterBar
          filters={FILTERS}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          resultCount={products.length}
        />

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
                No slabs found
              </h2>
              <p
                className="text-[13px]"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
              {products.map((product) => (
                <ProductCard key={product.id} {...toCardProps(product)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
