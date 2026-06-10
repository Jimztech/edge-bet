import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 group">
      <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-purple">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4.5 13h6l-1.5 9L18 11h-6l1-9z" />
        </svg>
        <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
      </div>
      <span className="text-lg font-bold tracking-tight">
        Edge<span className="text-gradient">IQ</span>
      </span>
    </Link>
  );
}