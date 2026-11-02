"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Lazy-load, fallback statis untuk perangkat tanpa WebGL / reduced-motion. */
export default function SceneLoader({ compact = false, auth = false }: { compact?: boolean; auth?: boolean }) {
  const [mode, setMode] = useState<"loading" | "3d" | "static">("loading");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = !!document.createElement("canvas").getContext("webgl2");
    const weak = (navigator.hardwareConcurrency ?? 4) <= 2 || ((navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8) <= 2;
    setReduced(rm); setMode(gl && !weak ? "3d" : "static");
  }, []);
  if (mode === "3d") return <Scene reduced={reduced} compact={compact} auth={auth} />;
  return <div className="h-full w-full" style={{ background: "radial-gradient(60% 50% at 50% 45%, #2a2318 0%, #0B0B0B 70%)" }} />;
}
