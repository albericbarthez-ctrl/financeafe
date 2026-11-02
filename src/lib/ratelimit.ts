const mem = new Map<string, number[]>();
/** true bila melewati batas. Pakai Upstash Redis (REST) bila env tersedia, selain itu in-memory. */
export async function limited(key: string, max = 8, windowSec = 60): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && tok) {
    try {
      const r = await fetch(`${url}/pipeline`, { method: "POST", headers: { Authorization: `Bearer ${tok}` }, cache: "no-store",
        body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(windowSec), "NX"]]) });
      const j = (await r.json()) as { result: number }[];
      return Number(j[0].result) > max;
    } catch { /* jatuh ke memori */ }
  }
  const now = Date.now(); const arr = (mem.get(key) ?? []).filter((t) => now - t < windowSec * 1000); arr.push(now); mem.set(key, arr); return arr.length > max;
}
