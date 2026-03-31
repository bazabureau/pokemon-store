"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Check,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { adminAPI, Review } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function ReviewSkeleton() {
  return (
    <div className="animate-pulse p-5 space-y-3">
      <div className="h-3 w-40" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-2 w-24" style={{ background: "var(--bg-elevated)" }} />
      <div className="h-8 w-full" style={{ background: "var(--bg-elevated)" }} />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= rating ? "var(--warning)" : "none"}
          style={{
            color: i <= rating ? "var(--warning)" : "var(--border-default)",
          }}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const toast = useToast();

  const fetchReviews = () => {
    setLoading(true);
    const params: Record<string, string> = { page: page.toString() };
    if (statusFilter) params.status = statusFilter;

    adminAPI
      .reviews(params)
      .then((res) => {
        setReviews(res.results);
        setTotalCount(res.count);
        setHasNext(!!res.next);
        setHasPrev(!!res.previous);
      })
      .catch((err) => toast.error("Error", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await adminAPI.updateReview(id, { status });
      toast.success("Updated", `Review ${status}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Reviews
        </h1>
        <p
          className="text-[11px] mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          {totalCount} reviews total
        </p>
      </div>

      {/* Status filters */}
      <div
        className="flex items-center gap-3 p-4"
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

      {/* Reviews grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-primary)",
              }}
            >
              <ReviewSkeleton />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-16"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
          }}
        >
          <MessageSquare
            size={28}
            className="mx-auto mb-3"
            style={{ color: "var(--text-muted)" }}
          />
          <p
            className="text-[12px]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            No reviews found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => {
            const isPending = review.status === "pending";
            const isApproved = review.status === "approved";
            const isRejected = review.status === "rejected";

            return (
              <div
                key={review.id}
                style={{
                  border: `1px solid ${
                    isPending
                      ? "var(--warning)"
                      : isApproved
                      ? "rgba(34,197,94,0.3)"
                      : isRejected
                      ? "rgba(239,68,68,0.3)"
                      : "var(--border-subtle)"
                  }`,
                  background: "var(--bg-primary)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: isPending
                          ? "rgba(234,179,8,0.1)"
                          : isApproved
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: isPending
                          ? "var(--warning)"
                          : isApproved
                          ? "var(--success)"
                          : "var(--error)",
                        border: `1px solid ${
                          isPending
                            ? "rgba(234,179,8,0.2)"
                            : isApproved
                            ? "rgba(34,197,94,0.2)"
                            : "rgba(239,68,68,0.2)"
                        }`,
                      }}
                    >
                      {review.status}
                    </span>
                  </div>
                  <span
                    className="text-[9px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      by {review.username}
                    </span>
                  </div>
                  {review.title && (
                    <p
                      className="text-[12px] font-bold mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {review.title}
                    </p>
                  )}
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {review.comment}
                  </p>
                </div>

                {/* Actions */}
                {isPending && (
                  <div
                    className="flex items-center gap-2 px-5 py-3"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <button
                      onClick={() => handleUpdateStatus(review.id, "approved")}
                      disabled={updatingId === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100 disabled:opacity-50"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "rgba(34,197,94,0.1)",
                        color: "var(--success)",
                        border: "1px solid rgba(34,197,94,0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--success)";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                        e.currentTarget.style.color = "var(--success)";
                      }}
                    >
                      <Check size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(review.id, "rejected")}
                      disabled={updatingId === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-100 disabled:opacity-50"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "rgba(239,68,68,0.1)",
                        color: "var(--error)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--error)";
                        e.currentTarget.style.color = "#FFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                        e.currentTarget.style.color = "var(--error)";
                      }}
                    >
                      <X size={12} />
                      Reject
                    </button>
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
