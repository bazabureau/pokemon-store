"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Tag,
  X,
  Save,
  Percent,
  DollarSign,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_amount: string | null;
  max_uses: number | null;
  times_used: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(p: number | string) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(typeof p === "string" ? parseFloat(p) : p);
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="h-3 w-24" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 w-16 flex-1" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 w-20" style={{ background: "var(--bg-elevated)" }} />
        </div>
      ))}
    </div>
  );
}

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const fetchCoupons = () => {
    setLoading(true);
    adminAPI
      .coupons()
      .then((res) => setCoupons(res.results))
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = async () => {
    if (!form.code || !form.discount_value) {
      toast.error("Validation", "Code and discount value are required");
      return;
    }
    setSubmitting(true);
    try {
      const data: any = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        is_active: form.is_active,
      };
      if (form.min_order_amount) data.min_order_amount = form.min_order_amount;
      if (form.max_uses) data.max_uses = parseInt(form.max_uses);
      if (form.valid_from) data.valid_from = form.valid_from;
      if (form.valid_until) data.valid_until = form.valid_until;

      await adminAPI.createCoupon(data);
      toast.success("Created", `Coupon "${form.code.toUpperCase()}" created`);
      setForm({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "",
        max_uses: "",
        valid_from: "",
        valid_until: "",
        is_active: true,
      });
      setShowForm(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteCoupon(id);
      toast.success("Deleted", `Coupon "${code}" deleted`);
      fetchCoupons();
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

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: "6px",
    display: "block",
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
            Discounts
          </h1>
          <p
            className="text-[11px] mt-1"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            Manage coupon codes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100"
          style={{
            background: showForm ? "transparent" : "var(--accent)",
            color: showForm ? "var(--text-secondary)" : "#000",
            fontFamily: "var(--font-mono)",
            border: showForm ? "1px solid var(--border-default)" : "none",
          }}
          onMouseEnter={(e) => {
            if (!showForm) e.currentTarget.style.background = "#FFF";
          }}
          onMouseLeave={(e) => {
            if (!showForm) e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {showForm ? (
            <>
              <X size={14} />
              Cancel
            </>
          ) : (
            <>
              <Plus size={14} />
              New Coupon
            </>
          )}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          style={{
            border: "1px solid var(--accent)",
            background: "var(--bg-primary)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Create Coupon
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Code *</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors uppercase"
                  style={inputStyle}
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  name="discount_type"
                  value={form.discount_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Value * {form.discount_type === "percentage" ? "(%)" : "(PLN)"}
                </label>
                <input
                  type="number"
                  name="discount_value"
                  value={form.discount_value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Min Order Amount (PLN)</label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={form.min_order_amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label style={labelStyle}>Max Uses</label>
                <input
                  type="number"
                  name="max_uses"
                  value={form.max_uses}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="Unlimited"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="w-5 h-5 flex items-center justify-center transition-colors duration-100"
                    style={{
                      border: `2px solid ${
                        form.is_active ? "var(--accent)" : "var(--border-strong)"
                      }`,
                      background: form.is_active ? "var(--accent)" : "transparent",
                    }}
                  >
                    {form.is_active && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Active
                  </span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Valid From</label>
                <input
                  type="date"
                  name="valid_from"
                  value={form.valid_from}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Valid Until</label>
                <input
                  type="date"
                  name="valid_until"
                  value={form.valid_until}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-50"
              style={{
                background: "var(--accent)",
                color: "#000",
                fontFamily: "var(--font-mono)",
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.background = "#FFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
              }}
            >
              <Save size={12} />
              {submitting ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </div>
      )}

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
                {[
                  "Code",
                  "Type",
                  "Value",
                  "Min Order",
                  "Uses",
                  "Expiry",
                  "Active",
                  "",
                ].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Tag
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
                      No coupons yet
                    </p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon, idx) => (
                  <tr
                    key={coupon.id}
                    style={{
                      borderBottom:
                        idx < coupons.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                      background:
                        hoveredRow === coupon.id
                          ? "var(--bg-surface)"
                          : "transparent",
                    }}
                    onMouseEnter={() => setHoveredRow(coupon.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] font-black tracking-[0.1em]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--accent)",
                        }}
                      >
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {coupon.discount_type === "percentage" ? (
                          <Percent size={10} style={{ color: "var(--text-muted)" }} />
                        ) : (
                          <DollarSign size={10} style={{ color: "var(--text-muted)" }} />
                        )}
                        <span
                          className="text-[10px] uppercase"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {coupon.discount_type}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3 text-[11px] font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : formatPrice(coupon.discount_value)}
                    </td>
                    <td
                      className="px-5 py-3 text-[11px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {coupon.min_order_amount
                        ? formatPrice(coupon.min_order_amount)
                        : "-"}
                    </td>
                    <td
                      className="px-5 py-3 text-[11px]"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                    >
                      {coupon.times_used}
                      {coupon.max_uses ? `/${coupon.max_uses}` : ""}
                    </td>
                    <td
                      className="px-5 py-3 text-[11px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formatDate(coupon.valid_until)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 inline-block"
                        style={{
                          fontFamily: "var(--font-mono)",
                          background: coupon.is_active
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                          color: coupon.is_active
                            ? "var(--success)"
                            : "var(--error)",
                          border: `1px solid ${
                            coupon.is_active
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(239,68,68,0.2)"
                          }`,
                        }}
                      >
                        {coupon.is_active ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        disabled={deletingId === coupon.id}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
