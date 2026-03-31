"use client";

import { useState, useEffect } from "react";
import { Search, Users, ChevronLeft, ChevronRight, Mail, Calendar } from "lucide-react";
import { adminAPI, Customer } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

function formatPrice(p: number | string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(typeof p === "string" ? parseFloat(p) : p);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="w-8 h-8 rounded-full" style={{ background: "var(--bg-elevated)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-2 w-48" style={{ background: "var(--bg-elevated)" }} />
          </div>
          <div className="h-3 w-20" style={{ background: "var(--bg-elevated)" }} />
        </div>
      ))}
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const toast = useToast();

  const fetchCustomers = () => {
    setLoading(true);
    const params: Record<string, string> = { page: page.toString() };
    if (search) params.search = search;

    adminAPI
      .customers(params)
      .then((res) => {
        setCustomers(res.results);
        setTotalCount(res.count);
        setHasNext(!!res.next);
        setHasPrev(!!res.previous);
      })
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

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
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Customers
        </h1>
        <p
          className="text-[11px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          {totalCount} registered customers
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 p-4"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
        }}
      >
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
          style={inputStyle}
        />
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
                {["Customer", "Email", "Joined", "Orders", "Total Spent"].map(
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
                  <td colSpan={5}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users
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
                      No customers found
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((customer, idx) => (
                  <tr
                    key={customer.id}
                    style={{
                      borderBottom:
                        idx < customers.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                      background:
                        hoveredRow === customer.id
                          ? "var(--bg-surface)"
                          : "transparent",
                    }}
                    onMouseEnter={() => setHoveredRow(customer.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 flex items-center justify-center shrink-0"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "50%",
                          }}
                        >
                          <span
                            className="text-[10px] font-black uppercase"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--accent)",
                            }}
                          >
                            {(customer.first_name || customer.username).charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p
                            className="text-[11px] font-bold"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {customer.first_name && customer.last_name
                              ? `${customer.first_name} ${customer.last_name}`
                              : customer.username}
                          </p>
                          <p
                            className="text-[9px]"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-muted)",
                            }}
                          >
                            @{customer.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Mail
                          size={10}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span
                          className="text-[11px]"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {customer.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={10}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span
                          className="text-[11px]"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatDate(customer.date_joined)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-bold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {customer.order_count}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color:
                            parseFloat(customer.total_spent) > 0
                              ? "var(--success)"
                              : "var(--text-muted)",
                        }}
                      >
                        {formatPrice(customer.total_spent)}
                      </span>
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
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="p-1.5 transition-colors duration-100 disabled:opacity-30"
                style={{ color: "var(--text-muted)" }}
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
