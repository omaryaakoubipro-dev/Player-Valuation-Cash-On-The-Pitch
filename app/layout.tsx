import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Player Valuator - Cash On The Pitch",
  description:
    "AI-powered football player market valuation. Get instant, position-aware analysis with comparable transfers and detailed reasoning.",
  keywords: ["football", "player valuation", "transfer market", "AI", "soccer"],
  openGraph: {
    title: "Player Valuator - Cash On The Pitch",
    description: "AI-powered football player market valuation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background antialiased">
        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                <Trophy size={16} className="text-background" />
              </div>
              <div>
                <span className="font-black text-primary text-base leading-tight">
                  Player Valuator
                </span>
                <span className="text-accent font-bold"> · </span>
                <span className="text-muted text-sm font-medium">Cash On The Pitch</span>
              </div>
            </div>

            {/* Right: theme toggle */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-muted border border-border rounded-full px-3 py-1">
                Powered by Claude AI
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────────────── */}
        <div className="flex-1">{children}</div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-border mt-8">
          <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Trophy size={14} className="text-accent" />
              <span>Player Valuator — Cash On The Pitch</span>
            </div>
            <div className="text-xs text-muted/60 text-center">
              Data: API-Football · Analysis: Claude AI (Anthropic) · Not financial advice
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
