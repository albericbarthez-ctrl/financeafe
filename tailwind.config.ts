import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { matte:"#0B0B0B", obsidian:"#151515", champagne:"#D6C39A", gold:"#C5A66A", ivory:"#F0E7D5", platinum:"#C8C5BF" },
    fontFamily: { sans: ["var(--font-jakarta)","system-ui","sans-serif"] },
  }},
  plugins: [],
} satisfies Config;
