"use client";
import { useRef } from "react";
/** Elemen tertarik ke kursor; nonaktif untuk touch & reduced-motion. */
export default function Magnetic({ children, className = "", strength = 0.25 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const r = useRef<HTMLDivElement>(null);
  return <div ref={r} className={`inline-block transition-transform duration-150 ${className}`}
    onPointerMove={(e) => { if (e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const b = r.current!.getBoundingClientRect(); r.current!.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * strength}px, ${(e.clientY - b.top - b.height / 2) * strength}px)`; }}
    onPointerLeave={() => { r.current!.style.transform = ""; }}>{children}</div>;
}
