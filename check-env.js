const fs = require("fs");
for (const k of ["postgresql://postgres.hcspjqbedgnyaxpxuvba:LbyiQicj$.ViPa7@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres", "postgresql://postgres.hcspjqbedgnyaxpxuvba:LbyiQicj$.ViPa7@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"]) {
  const line = fs.readFileSync(".env", "utf8").split(/\r?\n/).find((x) => x.startsWith(k + "="));
  if (!line) { console.log(k, "-> TIDAK ADA di .env"); continue; }
  const v = line.slice(k.length + 1);
  try {
    const u = new URL(v.trim());
    console.log(k, {
      user: u.username, host: u.hostname, port: u.port, db: u.pathname,
      panjangPassword: decodeURIComponent(u.password).length,
      adaKutip: /^["']/.test(v), adaSpasiUjung: v !== v.trim(),
    });
  } catch { console.log(k, "-> format URL RUSAK (biasanya karena simbol di password)"); }
}