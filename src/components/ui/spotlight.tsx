"use client";

import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  fill?: string;
}

export function Spotlight({
  className,
  fill = "white",
  ...props
}: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement> | MouseEvent
  ) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    div.addEventListener("mousemove", handleMouseMove);
    div.addEventListener("mouseenter", handleMouseEnter);
    div.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      div.removeEventListener("mousemove", handleMouseMove);
      div.removeEventListener("mouseenter", handleMouseEnter);
      div.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className={cn(
        "h-full w-full absolute inset-0 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px z-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill}10, transparent 40%)`,
        }}
      />
    </div>
  );
}
