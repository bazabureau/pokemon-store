"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Card3DProps {
  slug: string;
  name: string;
  image: string | null;
  price: string;
  gradeBadge?: string | null;
  condition?: string | null;
  className?: string;
}

export default function Card3D({
  slug,
  name,
  image,
  price,
  gradeBadge,
  condition,
  className = "",
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setRotate({
      x: -(mouseY / (rect.height / 2)) * 18,
      y: (mouseX / (rect.width / 2)) * 18,
    });
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.35,
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  const formatPrice = (p: string) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(parseFloat(p));

  return (
    <Link href={`/product/${slug}`} className={`block ${className}`}>
      <div style={{ perspective: "1000px" }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-[3/4] cursor-pointer"
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${isHovering ? "scale(1.06)" : "scale(1)"}`,
            transition: isHovering ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Card body */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 50%, #1a1a2e 100%)",
              border: "2px solid var(--border-strong)",
              boxShadow: isHovering
                ? "0 30px 80px rgba(255,107,44,0.25), 0 15px 40px rgba(0,0,0,0.6)"
                : "0 12px 40px rgba(0,0,0,0.4)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Product image */}
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-contain p-3"
                sizes="(max-width: 768px) 50vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-20 h-20 flex items-center justify-center rounded-lg"
                  style={{
                    border: "1px solid rgba(255,107,44,0.3)",
                    background: "radial-gradient(circle, rgba(255,107,44,0.08) 0%, transparent 70%)",
                  }}
                >
                  <span
                    className="text-4xl font-black"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-display)",
                      textShadow: "0 0 30px rgba(255,107,44,0.3)",
                    }}
                  >
                    {name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Holographic rainbow overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(
                  circle at ${glare.x}% ${glare.y}%,
                  rgba(255,107,44,${glare.opacity * 0.5}) 0%,
                  rgba(168,85,247,${glare.opacity * 0.4}) 25%,
                  rgba(59,130,246,${glare.opacity * 0.3}) 50%,
                  rgba(16,185,129,${glare.opacity * 0.2}) 75%,
                  transparent 100%
                )`,
                mixBlendMode: "overlay",
                transition: isHovering ? "none" : "all 0.5s ease",
                zIndex: 3,
              }}
            />

            {/* Glare shine */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(
                  ellipse at ${glare.x}% ${glare.y}%,
                  rgba(255,255,255,${glare.opacity * 0.5}) 0%,
                  rgba(255,255,255,${glare.opacity * 0.08}) 30%,
                  transparent 60%
                )`,
                transition: isHovering ? "none" : "all 0.5s ease",
                zIndex: 4,
              }}
            />

            {/* Scan lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 3px)",
                zIndex: 2,
              }}
            />
          </div>

          {/* Grade / condition badge */}
          {gradeBadge && (
            <div
              className="absolute -top-2 -right-2 z-10 rounded-md"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#000",
                padding: "4px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.05em",
                boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
                transform: "translateZ(30px)",
              }}
            >
              {gradeBadge}
            </div>
          )}

          {/* Floating particles on hover */}
          {isHovering && (
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "3px",
                    height: "3px",
                    background: i % 2 === 0 ? "var(--accent)" : "rgba(168,85,247,0.8)",
                    top: `${15 + i * 18}%`,
                    left: `${10 + i * 20}%`,
                    animation: `float-particle ${1.5 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.6,
                    zIndex: 5,
                    transform: "translateZ(40px)",
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Card info below */}
      <div className="mt-4 text-center">
        <p
          className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider line-clamp-1 mb-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
        >
          {name}
        </p>
        {condition && (
          <p
            className="text-[9px] uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            {condition.replace(/_/g, " ")}
          </p>
        )}
        <p
          className="text-[14px] sm:text-[16px] font-black"
          style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
        >
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
