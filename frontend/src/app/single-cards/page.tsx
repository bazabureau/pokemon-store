"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FilterBar from "@/components/products/FilterBar";
import ProductCard, { ProductCardProps } from "@/components/products/ProductCard";
import { productsAPI } from "@/lib/api";
import { toCardProps } from "@/lib/types";

const FILTERS = [
  {
    key: "generation",
    label: "Generation",
    options: [
      { label: "First Generation", value: "first" },
      { label: "Second Generation", value: "second" },
      { label: "Third Generation", value: "third" },
      { label: "Fourth Generation", value: "fourth" },
      { label: "Fifth Generation", value: "fifth" },
    ],
  },
  {
    key: "condition",
    label: "Condition",
    options: [
      { label: "Near Mint", value: "near_mint" },
      { label: "Excellent", value: "excellent" },
      { label: "Light Played", value: "light_played" },
      { label: "Played", value: "played" },
    ],
  },
  {
    key: "set",
    label: "Set",
    options: [
      { label: "Pokemon Elections", value: "pokemon-elections" },
      { label: "Base Set", value: "base-set" },
      { label: "Scarlet & Violet", value: "scarlet-violet" },
      { label: "Obsidian Flames", value: "obsidian-flames" },
    ],
  },
  {
    key: "price",
    label: "Price",
    options: [
      { label: "Under 100 PLN", value: "0-100" },
      { label: "100-500 PLN", value: "100-500" },
      { label: "500-2000 PLN", value: "500-2000" },
      { label: "Over 2000 PLN", value: "2000+" },
    ],
  },
];

export default function SingleCardsPage() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );

  const buildParams = useCallback(
    (page?: number): Record<string, string> => {
      const params: Record<string, string> = {
        product_type: "single_card",
      };

      if (page) {
        params.page = String(page);
      }

      // Map filter keys to API params
      const condition = activeFilters.condition;
      if (condition && condition.length > 0) {
        params.condition = condition.join(",");
      }

      const generation = activeFilters.generation;
      if (generation && generation.length > 0) {
        params.generation = generation.join(",");
      }

      const set = activeFilters.set;
      if (set && set.length > 0) {
        params.set_name = set.join(",");
      }

      const price = activeFilters.price;
      if (price && price.length > 0) {
        // Use the first selected price range
        const range = price[0];
        if (range.endsWith("+")) {
          params.price_min = range.replace("+", "");
        } else {
          const [min, max] = range.split("-");
          params.price_min = min;
          params.price_max = max;
        }
      }

      return params;
    },
    [activeFilters]
  );

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const params = buildParams();
    productsAPI
      .list(params)
      .then((data) => {
        setProducts(data.results.map(toCardProps));
        setTotalCount(data.count);
        // Determine next page number from next URL
        if (data.next) {
          try {
            const url = new URL(data.next);
            const pg = url.searchParams.get("page");
            setNextPage(pg ? parseInt(pg, 10) : null);
          } catch {
            setNextPage(null);
          }
        } else {
          setNextPage(null);
        }
      })
      .catch(() => {
        setProducts([]);
        setTotalCount(0);
        setNextPage(null);
      })
      .finally(() => setLoading(false));
  }, [buildParams]);

  const handleLoadMore = () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    const params = buildParams(nextPage);
    productsAPI
      .list(params)
      .then((data) => {
        setProducts((prev) => [...prev, ...data.results.map(toCardProps)]);
        if (data.next) {
          try {
            const url = new URL(data.next);
            const pg = url.searchParams.get("page");
            setNextPage(pg ? parseInt(pg, 10) : null);
          } catch {
            setNextPage(null);
          }
        } else {
          setNextPage(null);
        }
      })
      .catch(() => {
        setNextPage(null);
      })
      .finally(() => setLoadingMore(false));
  };

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
        {/* Page header */}
        <div
          className="relative py-12 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.04) 0%, transparent 60%)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6">
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Single Cards
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Browse our full collection of raw Pokemon cards
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar
          filters={FILTERS}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          resultCount={totalCount}
        />

        {/* Product grid */}
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden animate-pulse"
                  style={{ background: "var(--bg-surface)" }}
                >
                  <div className="aspect-[3/4]" />
                  <div className="p-3 space-y-2">
                    <div
                      className="h-3 w-3/4 rounded"
                      style={{ background: "var(--bg-elevated)" }}
                    />
                    <div
                      className="h-4 w-1/2 rounded"
                      style={{ background: "var(--bg-elevated)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No products found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          {/* Load more */}
          {nextPage && !loading && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-200"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                  opacity: loadingMore ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
