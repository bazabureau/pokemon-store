"use client";

import { useState, useEffect, FormEvent } from "react";
import { Star } from "lucide-react";
import { reviewsAPI, Review } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface ReviewSectionProps {
  productId: number;
}

function StarRating({
  rating,
  size = 14,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? star <= (hovered || rating) : star <= rating;
        return (
          <Star
            key={star}
            size={size}
            fill={filled ? "var(--accent)" : "none"}
            stroke={filled ? "var(--accent)" : "var(--text-muted)"}
            style={{
              cursor: interactive ? "pointer" : "default",
              transition: "color 0.1s",
            }}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRate?.(star)}
          />
        );
      })}
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchReviews() {
      try {
        const data = await reviewsAPI.list(productId);
        if (!cancelled) {
          setReviews(data.results);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const userHasReviewed =
    isAuthenticated && user
      ? reviews.some((r) => r.user === user.id)
      : false;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formRating === 0) {
      toast.error("Ocena wymagana", "Proszę wybrać ocenę gwiazdkową");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("Tytuł wymagany", "Proszę wpisać tytuł opinii");
      return;
    }
    if (!formComment.trim()) {
      toast.error("Komentarz wymagany", "Proszę wpisać komentarz do opinii");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.create({
        product: productId,
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
      });
      setSubmitted(true);
      setShowForm(false);
      toast.success("Opinia wysłana", "Twoja opinia została przesłana do zatwierdzenia");
    } catch (err: any) {
      toast.error("Błąd", err.message || "Nie udało się wysłać opinii");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div
        className="py-12"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 animate-spin"
            style={{
              border: "2px solid var(--border-default)",
              borderTopColor: "var(--accent)",
            }}
          />
          <span
            className="text-[11px] uppercase tracking-wider"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Ładowanie opinii...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-12"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* Header with average rating */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            Opinie klientów
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(averageRating)} size={16} />
              <span
                className="text-[13px] font-bold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {averageRating.toFixed(1)}
              </span>
              <span
                className="text-[11px]"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ({reviews.length} {reviews.length === 1 ? "opinia" : "opinii"})
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && !userHasReviewed && !submitted && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100"
            style={{
              background: "var(--accent)",
              color: "#000",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#FFF")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
          >
            Napisz opinię
          </button>
        )}
      </div>

      {/* Submitted confirmation */}
      {submitted && (
        <div
          className="p-4 mb-8"
          style={{
            border: "1px solid var(--accent)",
            background: "var(--bg-surface)",
          }}
        >
          <p
            className="text-[12px]"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Opinia przesłana do zatwierdzenia. Pojawi się po sprawdzeniu przez nasz
            zespół.
          </p>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 p-6"
          style={{
            border: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
          }}
        >
          <h3
            className="text-[11px] font-black tracking-[0.15em] uppercase mb-5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Napisz opinię
          </h3>

          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Ocena *</label>
              <StarRating
                rating={formRating}
                size={22}
                interactive
                onRate={setFormRating}
              />
            </div>

            <div>
              <label style={labelStyle}>Tytuł *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                style={inputStyle}
                placeholder="Podsumuj swoje doświadczenie..."
              />
            </div>

            <div>
              <label style={labelStyle}>Komentarz *</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none"
                style={inputStyle}
                placeholder="Podziel się swoimi wrażeniami o tym produkcie..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-50"
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
                {submitting ? "Wysyłanie..." : "Wyślij opinię"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormRating(0);
                  setFormTitle("");
                  setFormComment("");
                }}
                className="px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-100"
                style={{
                  border: "1px solid var(--border-default)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  background: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-default)")
                }
              >
                Anuluj
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 && !submitted ? (
        <div
          className="py-10 text-center"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
          }}
        >
          <Star
            size={28}
            style={{ color: "var(--text-muted)", margin: "0 auto 12px" }}
          />
          <p
            className="text-[13px] mb-1"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Brak opinii.
          </p>
          <p
            className="text-[11px]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Bądź pierwszy, który napisze opinię!
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="py-5"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[12px] font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {review.username}
                  </span>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <span
                  className="text-[10px]"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {new Date(review.created_at).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.title && (
                <h4
                  className="text-[13px] font-bold mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {review.title}
                </h4>
              )}
              <p
                className="text-[12px] leading-relaxed"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
