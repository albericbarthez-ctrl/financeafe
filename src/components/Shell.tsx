"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, BarChart3, Settings, LayoutDashboard, Wallet, PiggyBank, ListChecks, Target, UserRound, LogOut, ShieldCheck, Pin, ChevronsLeft, ChevronsRight } from "lucide-react";
import Logo from "./Logo";
import ToastHost from "./Toast";
import { logout } from "@/app/actions/auth";

type U = { username: string; fullName: string; role: string; avatarUrl: string | null; displayMode: string };
const items = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/finance", "Financial Management", Wallet], ["/savings", "Savings", PiggyBank],
  ["/transactions", "Transactions / Logs", ListChecks], ["/goals", "Savings Goals", Target], ["/reports", "Reports & Analytics", BarChart3], ["/profile", "My Profile", UserRound], ["/settings", "Settings", Settings],
] as const;

function Avatar({ u, size = 40 }: { u: U; size?: number }) {
  return u.avatarUrl /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={u.avatarUrl} alt="" style={{ width: size, height: size }} className="rounded-full object-cover" />
    : <span style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-ivory to-gold font-semibold text-matte">{u.username[0]?.toUpperCase()}</span>;
}

export default function Shell({ user, theme = "dark", reduced = false, children }: { user: U; theme?: string; reduced?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false), [pinned, setPinned] = useState(false), [mini, setMini] = useState(false), [menu, setMenu] = useState(false);
  const path = usePathname(); const shown = user.displayMode === "username" ? user.username : user.fullName;
  useEffect(() => { try { setPinned(localStorage.getItem("fk-pin") === "1"); setMini(localStorage.getItem("fk-mini") === "1"); } catch {} }, []);
  const save = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch {} };
  const nav = [...items, ...(user.role !== "USER" ? ([["/founder", user.role === "FOUNDER" ? "Founder Dashboard" : "Admin Dashboard", ShieldCheck]] as const) : [])];
  const slim = pinned && mini;
  return (
    <div className="min-h-screen" data-theme={theme} data-reduced={reduced ? "1" : undefined}>
      <div aria-hidden className="spotlight pointer-events-none fixed inset-x-0 top-0 h-[70vh]" />
      <div className={`transition-[padding] duration-200 ${pinned ? (mini ? "lg:pl-20" : "lg:pl-72") : ""}`}>
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-champagne/15 bg-matte/80 px-4 py-3 backdrop-blur">
          <button aria-label="Buka menu" onClick={() => setOpen(true)} className={`rounded-lg p-2 hover:bg-obsidian ${pinned ? "lg:hidden" : ""}`}><Menu /></button>
          <Logo size={26} />
          <div className="relative ml-auto">
            <button onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu} className="flex items-center gap-2 rounded-xl p-1 pr-3 hover:bg-obsidian"><Avatar u={user} size={32} /><span className="hidden text-sm sm:block">{shown}</span></button>
            {menu && <div role="menu" onClick={() => setMenu(false)} className="glass absolute right-0 mt-2 w-52 space-y-1 rounded-xl bg-obsidian p-2 text-sm">
              <p className="px-3 py-1 text-xs text-platinum">{user.role}</p>
              <Link role="menuitem" href="/profile" className="block rounded-lg px-3 py-2 hover:bg-white/5">My Profile</Link><Link role="menuitem" href="/settings" className="block rounded-lg px-3 py-2 hover:bg-white/5">Settings</Link>
              <form action={logout}><button role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-platinum hover:bg-white/5">Logout</button></form></div>}
          </div>
        </header>
        <main className="relative mx-auto max-w-6xl p-4 sm:p-6">{children}</main>
      </div>
      <AnimatePresence>{open && <motion.div className={`fixed inset-0 z-40 bg-black/60 ${pinned ? "lg:hidden" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}</AnimatePresence>
      <aside className={`fixed inset-y-0 left-0 z-50 flex max-w-[85vw] flex-col border-r border-champagne/20 bg-matte p-3 transition-all duration-200 ${slim ? "w-20" : "w-72"} ${open ? "translate-x-0" : pinned ? "-translate-x-full lg:translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="hidden gap-1 lg:flex">
            <button aria-label={pinned ? "Lepas sidebar" : "Sematkan sidebar"} aria-pressed={pinned} onClick={() => { setPinned(!pinned); save("fk-pin", !pinned); }} className={`rounded-lg p-2 hover:bg-obsidian ${pinned ? "text-champagne" : ""}`}><Pin size={16} /></button>
            {pinned && <button aria-label={mini ? "Perluas" : "Ciutkan"} onClick={() => { setMini(!mini); save("fk-mini", !mini); }} className="rounded-lg p-2 hover:bg-obsidian">{mini ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}</button>}
          </div>
          <button aria-label="Tutup menu" onClick={() => setOpen(false)} className="ml-auto p-2 lg:hidden"><X /></button>
        </div>
        <nav className="flex-1 space-y-1">{nav.map(([href, label, Icon]) => (
          <Link key={href} href={href} title={label} onClick={() => setOpen(false)} aria-current={path.startsWith(href) ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 ${path.startsWith(href) ? "bg-champagne/15 text-champagne" : "text-platinum hover:bg-obsidian"}`}>
            {path.startsWith(href) && <span className="absolute inset-y-2 left-0 w-0.5 rounded bg-champagne" />}<Icon size={18} className="shrink-0" />{!slim && label}</Link>))}</nav>
        <Link href="/profile" onClick={() => setOpen(false)} className="mb-2 flex items-center gap-3 rounded-xl bg-obsidian p-3"><Avatar u={user} />
          {!slim && <span><span className="block text-sm">{shown}</span><span className="text-xs text-platinum">@{user.username} · {user.role}</span></span>}</Link>
        <form action={logout}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-platinum hover:bg-obsidian"><LogOut size={18} />{!slim && "Logout"}</button></form>
      </aside>
      <ToastHost />
    </div>
  );
}
