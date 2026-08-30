"use client";

import React, { useRef, useState, useCallback } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(16, 185, 129, 0.12)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: -1000, y: -1000 });
      }}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
      {...props}
    >
      {/* Subtle radial spotlight glow tracking mouse */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit] z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col justify-between h-full">{children}</div>
    </div>
  );
}
