"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { gsap } from "gsap";

interface BinderIntroProps {
  onComplete: () => void;
}

export default function BinderIntro({ onComplete }: BinderIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const binderRef = useRef<HTMLButtonElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const tiltRef = useRef({ x: 0, y: 0 });

  // Check if user has already seen the intro this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("collectify-intro-seen");
      if (seen) {
        onComplete();
      }
    }
  }, [onComplete]);

  // Mouse tilt effect
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!binderRef.current || hasInteracted) return;

      const rect = binderRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -6;
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;

      tiltRef.current = { x: rotateX, y: rotateY };

      gsap.to(binderRef.current, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.4,
        ease: "power2.out",
      });
    },
    [hasInteracted]
  );

  const handleMouseLeave = useCallback(() => {
    if (!binderRef.current || hasInteracted) return;
    setIsHovering(false);
    gsap.to(binderRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [hasInteracted]);

  // The main open animation
  const handleOpen = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);

    const tl = gsap.timeline({
      onComplete: () => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("collectify-intro-seen", "1");
        }
        onComplete();
      },
    });

    // Phase 1: Reset tilt and prepare
    tl.to(binderRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.3,
      ease: "power2.out",
    });

    // Phase 2: Glow intensifies
    tl.to(
      glowRef.current,
      {
        opacity: 0.6,
        scale: 1.3,
        duration: 0.4,
        ease: "power2.in",
      },
      "-=0.1"
    );

    // Phase 3: Cover opens (rotates on Y axis like a book)
    tl.to(coverRef.current, {
      rotateY: -165,
      duration: 1.0,
      ease: "power3.inOut",
    });

    // Phase 4: Slight zoom into binder
    tl.to(
      binderRef.current,
      {
        scale: 1.15,
        duration: 0.8,
        ease: "power2.inOut",
      },
      "-=0.8"
    );

    // Phase 5: Pages fan slightly
    tl.to(
      pagesRef.current?.children || [],
      {
        rotateY: -12,
        stagger: 0.06,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.6"
    );

    // Phase 6: Fade out everything
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.05,
        duration: 0.5,
        ease: "power2.in",
      },
      "-=0.2"
    );

    // Hide text immediately
    tl.to(
      textRef.current,
      {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: "power2.in",
      },
      "-=1.2"
    );
  }, [hasInteracted, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--bg-void)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,107,44,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Binder container with perspective */}
      <div
        style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
        className="relative"
      >
        {/* Orange glow behind binder */}
        <div
          ref={glowRef}
          className="absolute inset-0 -m-20 rounded-full opacity-30 pointer-events-none blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,44,0.4) 0%, transparent 70%)",
          }}
        />

        {/* Binder */}
        <button
          ref={binderRef}
          onClick={handleOpen}
          onMouseEnter={() => setIsHovering(true)}
          className="relative cursor-pointer select-none outline-none"
          style={{
            transformStyle: "preserve-3d",
            width: "320px",
            height: "440px",
          }}
          aria-label="Open card binder to browse products"
        >
          {/* Back cover */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "linear-gradient(145deg, #1A1A1A 0%, #111111 50%, #0D0D0D 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              transform: "translateZ(-8px)",
            }}
          />

          {/* Inner pages (visible when cover opens) */}
          <div
            ref={pagesRef}
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-r-lg"
                style={{
                  top: "8px",
                  right: "8px",
                  bottom: "8px",
                  left: "4px",
                  background: `linear-gradient(145deg, ${
                    i === 0
                      ? "#1E1E1E"
                      : i === 1
                      ? "#1A1A1A"
                      : "#171717"
                  } 0%, #121212 100%)`,
                  border: "1px solid rgba(255,255,255,0.03)",
                  transformOrigin: "left center",
                  transform: `translateZ(${(i + 1) * -2}px)`,
                }}
              >
                {/* Card slots on inner pages */}
                <div className="grid grid-cols-3 gap-2 p-4 pt-6">
                  {[...Array(9)].map((_, j) => (
                    <div
                      key={j}
                      className="rounded"
                      style={{
                        aspectRatio: "2.5/3.5",
                        background:
                          "linear-gradient(135deg, rgba(255,107,44,0.03) 0%, rgba(255,255,255,0.02) 100%)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Front cover */}
          <div
            ref={coverRef}
            className="absolute inset-0 rounded-lg"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Cover face */}
            <div
              className="absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-6 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #1C1C1C 0%, #131313 40%, #0E0E0E 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: isHovering
                  ? "0 0 40px rgba(255,107,44,0.12), 0 20px 60px rgba(0,0,0,0.5)"
                  : "0 20px 60px rgba(0,0,0,0.5)",
                transition: "box-shadow 0.4s ease",
              }}
            >
              {/* Spine detail */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,107,44,0.2), transparent)",
                }}
              />

              {/* Cover texture lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
                }}
              />

              {/* Logo on cover */}
              <div className="relative z-10 text-center">
                <div
                  className="font-[var(--font-display)] tracking-[0.3em] text-[11px] uppercase mb-1"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Premium Collection
                </div>
                <div className="relative">
                  <h1
                    className="text-4xl font-extrabold tracking-tight leading-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <span className="block text-gradient-orange">COLLE</span>
                    <span className="block text-gradient-orange">CTIFY</span>
                  </h1>
                </div>
              </div>

              {/* Decorative accent line */}
              <div
                className="w-16 h-[1px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--accent), transparent)",
                }}
              />

              {/* Subtle corner accents */}
              <div
                className="absolute top-4 left-4 w-6 h-6 pointer-events-none"
                style={{
                  borderTop: "1px solid rgba(255,107,44,0.15)",
                  borderLeft: "1px solid rgba(255,107,44,0.15)",
                }}
              />
              <div
                className="absolute bottom-4 right-4 w-6 h-6 pointer-events-none"
                style={{
                  borderBottom: "1px solid rgba(255,107,44,0.15)",
                  borderRight: "1px solid rgba(255,107,44,0.15)",
                }}
              />
            </div>

            {/* Cover back face (visible when opened) */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  "linear-gradient(145deg, #151515 0%, #0F0F0F 100%)",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            />
          </div>
        </button>
      </div>

      {/* CTA Text below binder */}
      <div
        ref={textRef}
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-center"
      >
        <p
          className="text-sm tracking-[0.25em] uppercase"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-display)",
            animation: "fadeInUp 0.8s var(--ease-out-expo) 0.5s both",
          }}
        >
          Browse our cards
        </p>
        <div
          className="mt-3 mx-auto w-5 h-5 border-b border-r rotate-45 opacity-40"
          style={{
            borderColor: "var(--accent)",
            animation:
              "fadeInUp 0.8s var(--ease-out-expo) 0.7s both, pulseGlow 2s ease-in-out 1.5s infinite",
          }}
        />
      </div>
    </div>
  );
}
