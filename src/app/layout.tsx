import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import IntroSplash from "@/components/IntroSplash";
import CursorGlow from "@/components/CursorGlow";
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
export const metadata: Metadata = {
  title: { default: "Financekorn", template: "%s | Financekorn" },
  description: "Kelola pemasukan, pengeluaran, dan tabungan Anda dalam satu platform.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body className={`${jakarta.variable} font-sans antialiased`}><IntroSplash /><CursorGlow />{children}</body></html>;
}
