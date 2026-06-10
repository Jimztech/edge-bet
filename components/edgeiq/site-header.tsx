import Link from "next/link";
import { Logo } from "@/components/edgeiq/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
      <div className="glass-strong rounded-full px-4 py-2.5 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <a href="#features" className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition">Features</a>
          <a href="#bookmakers" className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition">Bookmakers</a>
          <a href="#pricing" className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition">Pricing</a>
          <a href="#demo" className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition">Demo</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition">
            Login
          </Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 rounded-full gradient-primary text-white font-medium shadow-glow-purple hover:opacity-90 transition">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}