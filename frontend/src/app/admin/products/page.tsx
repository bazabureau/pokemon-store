"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Trash2, Edit3, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { adminAPI, Product, PaginatedResponse } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

function formatPrice(p: number | string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(typeof p === "string" ? parseFloat(p) : p);
}

const PRODUCT_TYPES = [
  { value: "", label: "All Types" },
  { value: "single_card", label: "Single Card" },
  { value: "sealed_product", label: "Sealed Product" },
  { value: "slab", label: "Slab" },
  { value: "accessory", label: "Accessory" },
];

const STOCK_FILTERS = [
  { value: "", label: "All Stock" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="w-10 h-12" style={{ background: "var(--bg-elevated)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-2 w-24" style={{ background: "var(--bg-elevated)" }} />
          </div>
          <div className="h-3 w-16" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 w-12" style={{ background: "var(--bg-elevated)" }} />
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const toast = useToast();

  const fetchProducts = () => {
    setLoading(true);
    const params: Record<string, string> = { page: page.toString() };
    if (search) params.search = search;
    if (productType) params.product_type = productType;
    if (stockFilter === "in_stock") params.in_stock = "true";
    if (stockFilter === "low_stock") params.low_stock = "true";
    if (stockFilter === "out_of_stock") params.in_stock = "false";

    adminAPI
      .products(params)
      .then((res) => {
        setProducts(res.results);
        setTotalCount(res.count);
        setHasNext(!!res.next);
        setHasPrev(!!res.previous);
      })
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, productType, stockFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteProduct(id);
      toast.success("Deleted", `"${name}" has been deleted`);
      fetchProducts();
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.05em",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Products
          </h1>
          <p
            className="text-[11px] mt-1"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            {totalCount} products total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100"
          style={{
            background: "var(--accent)",
            color: "#000",
            fontFamily: "var(--font-mono)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 p-4"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={inputStyle}
          />
        </div>
        <select
          value={productType}
          onChange={(e) => {
            setProductType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 outline-none"
          style={inputStyle}
        >
          {PRODUCT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 outline-none"
          style={inputStyle}
        >
          {STOCK_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["", "Name", "Type", "Price", "Stock", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[9px] font-bold uppercase tracking-[0.2em]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Package
                      size={24}
                      className="mx-auto mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-[11px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      No products found
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom:
                        idx < products.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                      background:
                        hoveredRow === product.id
                          ? "var(--bg-surface)"
                          : "transparent",
                    }}
                    onMouseEnter={() => setHoveredRow(product.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-5 py-3">
                      <div
                        className="w-10 h-12 flex items-center justify-center overflow-hidden"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package
                            size={14}
                            style={{ color: "var(--text-muted)" }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p
                        className="text-[11px] font-bold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {product.name}
                      </p>
                      {product.set_name && (
                        <p
                          className="text-[9px] mt-0.5"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {product.set_name}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.1em]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {product.product_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-bold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && (
                        <span
                          className="text-[9px] ml-1 line-through"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color:
                            product.stock_quantity === 0
                              ? "var(--error)"
                              : product.stock_quantity <= 5
                              ? "var(--warning)"
                              : "var(--text-primary)",
                        }}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 inline-block"
                        style={{
                          fontFamily: "var(--font-mono)",
                          background: product.is_active
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                          color: product.is_active
                            ? "var(--success)"
                            : "var(--error)",
                          border: `1px solid ${
                            product.is_active
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(239,68,68,0.2)"
                          }`,
                        }}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/new?edit=${product.id}`}
                          className="p-1.5 transition-colors duration-100"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--accent)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                          }
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-1.5 transition-colors duration-100 disabled:opacity-50"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--error)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                          }
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <span
              className="text-[10px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
              }}
            >
              Page {page} of {Math.ceil(totalCount / 20)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
                className="p-1.5 transition-colors duration-100 disabled:opacity-30"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  if (hasPrev) e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="p-1.5 transition-colors duration-100 disabled:opacity-30"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  if (hasNext) e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
