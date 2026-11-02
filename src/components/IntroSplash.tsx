"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
/** Intro animasi logo sekali per sesi browser. Overlay dirender sejak SSR agar tidak ada kedipan konten. */
export default function IntroSplash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    let seen = false; try { seen = sessionStorage.getItem("fk-intro") === "1"; sessionStorage.setItem("fk-intro", "1"); } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen) { setShow(false); return; } const t = setTimeout(() => setShow(false), reduced ? 300 : 1500); return () => clearTimeout(t);
  }, []);
  return (<AnimatePresence>{show && <motion.div key="intro" className="fixed inset-0 z-[100] grid place-items-center bg-matte" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
    <motion.div initial={{ scale: 0.8, opacity: 0, rotateY: -50 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} style={{ perspective: 800 }}><Logo size={64} />
      <motion.div className="mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-champagne to-transparent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 0.8 }} /></motion.div></motion.div>}</AnimatePresence>);
}
