import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Lapisan pertama saja. Otorisasi sebenarnya ada di requireRole()/requireUser() pada setiap action & API.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: (l: { name: string; value: string; options: CookieOptions }[]) => { const so = req.cookies.get("fk_remember")?.value === "0"; l.forEach(({ name, value, options }) => res.cookies.set(name, value, so ? { ...options, maxAge: undefined, expires: undefined } : options)); } },
  });
  const { data } = await sb.auth.getUser();
  const protectedPath = /^\/(dashboard|finance|savings|goals|transactions|reports|profile|settings|admin|founder)/.test(req.nextUrl.pathname);
  if (protectedPath && !data.user) return NextResponse.redirect(new URL("/login", req.url));
  if (data.user && req.nextUrl.pathname === "/login") return NextResponse.redirect(new URL("/dashboard", req.url));
  return res;
}
export const config = { matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"] };
