"use client";
import { useRef } from "react";
/** Tilt 3D mengikuti pointer; nonaktif untuk reduced-motion. */
export default function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const r = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || e.pointerType === "touch") return;
    const b = r.current!.getBoundingClientRect(); const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    r.current!.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateZ(6px)`;
    r.current!.style.background = `radial-gradient(240px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(214,195,154,.14), rgba(21,21,21,.55))`;
  };
  const leave = () => { r.current!.style.transform = ""; r.current!.style.background = ""; };
  return <div ref={r} onPointerMove={move} onPointerLeave={leave} className={`glass transition-transform duration-150 ${className}`}>{children}</div>;
}
