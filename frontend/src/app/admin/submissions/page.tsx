"use client";

import { useState, useEffect } from "react";
import {
  Inbox,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Save,
  Image as ImageIcon,
  User,
  Calendar,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface Submission {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  card_name: string;
  card_set?: string;
  card_number?: string;
  condition: string;
  quantity: number;
  description?: string;
  asking_price?: string;
  image_front?: string;
  image_back?: string;
  status: string;
  status_display?: string;
  offer_amount?: string;
  admin_notes?: string;
  created_at: string;
}

function formatDate(d: string) {
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

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

const STATUS_OPTIONS = [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
  "completed",
];

function statusColor(status: string) {
  switch (status) {
    case "accepted":
    case "completed":
      return { bg: "rgba(34,197,94,0.1)", color: "var(--success)", border: "rgba(34,197,94,0.2)" };
    case "rejected":
      return { bg: "rgba(239,68,68,0.1)", color: "var(--error)", border: "rgba(239,68,68,0.2)" };
    case "reviewing":
      return { bg: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "rgba(59,130,246,0.2)" };
    default:
      return { bg: "rgba(234,179,8,0.1)", color: "var(--warning)", border: "rgba(234,179,8,0.2)" };
  }
}

function SubmissionSkeleton() {
  return (
    <div className="animate-pulse p-5 space-y-3">
      <div className="h-3 w-40" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-2 w-32" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-8 w-full" style={{ background: "var(--bg-elevated)" }} />
    </div>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editOffer, setEditOffer] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchSubmissions = () => {
    setLoading(true);
    const params: Record<string, string> = { page: page.toString() };
    if (statusFilter) params.status = statusFilter;

    adminAPI
      .submissions(params)
      .then((res) => {
        setSubmissions(res.results);
        setTotalCount(res.count);
        setHasNext(!!res.next);
        setHasPrev(!!res.previous);
      })
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter]);

  const toggleExpand = (sub: Submission) => {
    if (expandedId === sub.id) {
      setExpandedId(null);
      setEditingId(null);
    } else {
      setExpandedId(sub.id);
      setEditingId(sub.id);
      setEditStatus(sub.status);
      setEditOffer(sub.offer_amount || "");
      setEditNotes(sub.admin_notes || "");
    }
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      const data: any = { status: editStatus };
      if (editOffer) data.offer_amount = editOffer;
      if (editNotes) data.admin_notes = editNotes;

      const updated = await adminAPI.updateSubmission(id, data);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
      );
      toast.success("Updated", "Submission updated");
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSaving(false);
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
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Submissions
        </h1>
        <p
          className="text-[11px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          {totalCount} card submissions
        </p>
      </div>

      {/* Status filters */}
      <div
        className="flex items-center gap-3 p-4 flex-wrap"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-primary)",
        }}
      >
        <Filter size={12} style={{ color: "var(--text-muted)" }} />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100"
            style={{
              fontFamily: "var(--font-mono)",
              background:
                statusFilter === f.value ? "var(--accent)" : "transparent",
              color:
                statusFilter === f.value ? "#000" : "var(--text-secondary)",
              border: `1px solid ${
                statusFilter === f.value
                  ? "var(--accent)"
                  : "var(--border-default)"
              }`,
            }}
            onMouseEnter={(e) => {
              if (statusFilter !== f.value) {
                e.currentTarget.style.borderColor = "var(--text-muted)";
              }
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== f.value) {
                e.currentTarget.style.borderColor = "var(--border-default)";
              }
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-primary)",
              }}
            >
              <SubmissionSkeleton />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div
          className="text-center py-16"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
          }}
        >
          <Inbox
            size={28}
            className="mx-auto mb-3"
            style={{ color: "var(--text-muted)" }}
          />
          <p
            className="text-[12px]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            No submissions found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const sc = statusColor(sub.status);
            const isExpanded = expandedId === sub.id;

            return (
              <div
                key={sub.id}
                style={{
                  border: `1px solid ${
                    isExpanded ? "var(--accent)" : "var(--border-subtle)"
                  }`,
                  background: "var(--bg-primary)",
                }}
              >
                {/* Card header - clickable */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-100"
                  onClick={() => toggleExpand(sub)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-surface)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <User size={12} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-[11px] font-bold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {sub.first_name} {sub.last_name}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-bold truncate"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--accent)",
                      }}
                    >
                      {sub.card_name}
                    </span>
                    <span
                      className="text-[10px] shrink-0"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {sub.condition} / Qty: {sub.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-[10px]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {formatDate(sub.created_at)}
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {sub.status_display || sub.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} style={{ color: "var(--text-muted)" }} />
                    ) : (
                      <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                      {/* Left - details */}
                      <div className="space-y-4">
                        <div>
                          <p style={labelStyle}>Contact</p>
                          <p
                            className="text-[11px]"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {sub.email}
                            {sub.phone && ` / ${sub.phone}`}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p style={labelStyle}>Card Name</p>
                            <p
                              className="text-[12px] font-bold"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {sub.card_name}
                            </p>
                          </div>
                          {sub.card_set && (
                            <div>
                              <p style={labelStyle}>Set</p>
                              <p
                                className="text-[11px]"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {sub.card_set}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p style={labelStyle}>Condition</p>
                            <p
                              className="text-[11px]"
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {sub.condition}
                            </p>
                          </div>
                          <div>
                            <p style={labelStyle}>Quantity</p>
                            <p
                              className="text-[11px]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {sub.quantity}
                            </p>
                          </div>
                          {sub.asking_price && (
                            <div>
                              <p style={labelStyle}>Asking Price</p>
                              <p
                                className="text-[11px] font-bold"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--accent)",
                                }}
                              >
                                {formatPrice(sub.asking_price)}
                              </p>
                            </div>
                          )}
                        </div>
                        {sub.description && (
                          <div>
                            <p style={labelStyle}>Description</p>
                            <p
                              className="text-[11px] leading-relaxed"
                              style={{
                                fontFamily: "var(--font-body)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {sub.description}
                            </p>
                          </div>
                        )}

                        {/* Images */}
                        {(sub.image_front || sub.image_back) && (
                          <div>
                            <p style={labelStyle}>Images</p>
                            <div className="flex gap-3">
                              {sub.image_front && (
                                <a
                                  href={sub.image_front}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block transition-opacity duration-100"
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.8")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                >
                                  <div
                                    className="w-24 h-32 flex items-center justify-center overflow-hidden"
                                    style={{
                                      border: "1px solid var(--border-default)",
                                      background: "var(--bg-surface)",
                                    }}
                                  >
                                    <img
                                      src={sub.image_front}
                                      alt="Front"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <p
                                    className="text-[9px] text-center mt-1"
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    Front
                                  </p>
                                </a>
                              )}
                              {sub.image_back && (
                                <a
                                  href={sub.image_back}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block transition-opacity duration-100"
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.8")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                >
                                  <div
                                    className="w-24 h-32 flex items-center justify-center overflow-hidden"
                                    style={{
                                      border: "1px solid var(--border-default)",
                                      background: "var(--bg-surface)",
                                    }}
                                  >
                                    <img
                                      src={sub.image_back}
                                      alt="Back"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <p
                                    className="text-[9px] text-center mt-1"
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    Back
                                  </p>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right - update form */}
                      <div
                        className="p-4 space-y-4"
                        style={{
                          border: "1px solid var(--border-subtle)",
                          background: "var(--bg-surface)",
                        }}
                      >
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.15em]"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          Update Submission
                        </p>
                        <div>
                          <label style={labelStyle}>Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full px-3 py-2.5 outline-none"
                            style={inputStyle}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Offer Amount (PLN)</label>
                          <input
                            type="number"
                            value={editOffer}
                            onChange={(e) => setEditOffer(e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                            style={inputStyle}
                            placeholder="Enter offer amount"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Admin Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none"
                            style={inputStyle}
                            placeholder="Internal notes..."
                          />
                        </div>
                        <button
                          onClick={() => handleSave(sub.id)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-50"
                          style={{
                            background: "var(--accent)",
                            color: "#000",
                            fontFamily: "var(--font-mono)",
                          }}
                          onMouseEnter={(e) => {
                            if (!saving) e.currentTarget.style.background = "#FFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--accent)";
                          }}
                        >
                          <Save size={12} />
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between">
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
  );
}
