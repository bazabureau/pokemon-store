"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { type ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

const directionMap: Record<RevealDirection, { x: string; y: string }> = {
  up: { x: "0", y: "24px" },
  down: { x: "0", y: "-24px" },
  left: { x: "24px", y: "0" },
  right: { x: "-24px", y: "0" },
  none: { x: "0", y: "0" },
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ once });
  const d = directionMap[direction];

  const translateX = distance !== undefined && direction === "left" ? `${distance}px` : distance !== undefined && direction === "right" ? `-${distance}px` : d.x;
  const translateY = distance !== undefined && direction === "up" ? `${distance}px` : distance !== undefined && direction === "down" ? `-${distance}px` : d.y;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translate3d(0, 0, 0)"
          : `translate3d(${translateX}, ${translateY}, 0)`,
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
