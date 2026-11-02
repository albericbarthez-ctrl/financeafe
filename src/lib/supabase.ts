import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/** sessionOnly=true (Remember Me mati): cookie sesi hilang saat browser ditutup. */
export function supabaseServer(opts?: { sessionOnly?: boolean }) {
  const store = cookies();
  const sessionOnly = opts?.sessionOnly ?? store.get("fk_remember")?.value === "0";
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => { try { list.forEach(({ name, value, options }) => store.set(name, value, sessionOnly ? { ...options, maxAge: undefined, expires: undefined } : options)); } catch {} },
    },
  });
}
