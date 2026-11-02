import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
// Menukar kode dari email (verifikasi, reset password, ganti email) menjadi sesi.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/dashboard";
  if (code) { const { error } = await supabaseServer().auth.exchangeCodeForSession(code); if (error) return NextResponse.redirect(new URL("/login", req.url)); }
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"; // cegah open redirect
  return NextResponse.redirect(new URL(safe, req.url));
}
