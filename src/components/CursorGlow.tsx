"use client";
import { useEffect, useRef } from "react";
/** Kursor kustom halus (cincin emas) hanya untuk pointer presisi & tanpa reduced-motion. Kursor asli tetap tampil. */
export default function CursorGlow() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0; const node = el.current!; node.style.opacity = "1";
    const mv = (e: PointerEvent) => { x = e.clientX; y = e.clientY; }; const loop = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; node.style.transform = `translate(${cx - 14}px, ${cy - 14}px)`; raf = requestAnimationFrame(loop); };
    window.addEventListener("pointermove", mv); loop(); return () => { window.removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={el} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] h-7 w-7 rounded-full border border-champagne/60 opacity-0 transition-opacity" style={{ boxShadow: "0 0 18px rgba(214,195,154,.35)" }} />;
}
