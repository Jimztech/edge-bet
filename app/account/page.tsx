"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/db/supabase-client";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, user, loading: userLoading } = useUser();

  const [modal, setModal] = useState<null | "upgrade" | "downgrade" | "cancel" | "delete">(null);
  const [deleteText, setDeleteText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setModal(null);
    setDeleteText("");
    setError("");
  };

  const name = profile?.name ?? user?.email ?? "User";
  const email = user?.email ?? "";
  const plan = profile?.plan ?? "free";
  const isPremium = plan === "premium";
  const expiresAt = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paystack/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to cancel subscription");
        setActionLoading(false);
        return;
      }

      close();
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete account");
        setActionLoading(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setActionLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8 text-gradient">
          Account Settings
        </h1>

        {/* Profile */}
        <section className="glass rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
            Profile
          </h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-semibold text-white shadow-glow-purple shrink-0">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="glass rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
            Current Plan
          </h2>

          <div className="flex items-center gap-3 mb-2">
            <span
              className={
                isPremium
                  ? "inline-flex items-center rounded-full px-4 py-1.5 text-base font-semibold bg-[color:var(--neon-green)]/15 text-[color:var(--neon-green)] border border-[color:var(--neon-green)]/30"
                  : "inline-flex items-center rounded-full px-4 py-1.5 text-base font-semibold bg-muted text-muted-foreground border border-border"
              }
            >
              {plan === "free" ? "No active plan" : isPremium ? "Premium" : "Standard"}
            </span>
          </div>
          {expiresAt && (
            <p className="text-xs text-muted-foreground mb-6">Renews on {expiresAt}</p>
          )}

          <div className="space-y-3">
            {plan !== "free" && (
              <>
                {!isPremium ? (
                  <button
                    onClick={() => setModal("upgrade")}
                    className="w-full gradient-primary text-white font-medium rounded-xl py-3 px-4 shadow-glow-purple hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Premium — ₦15,000/mo
                  </button>
                ) : (
                  <button
                    onClick={() => setModal("downgrade")}
                    className="w-full bg-muted hover:bg-muted/70 text-muted-foreground font-medium rounded-xl py-3 px-4 transition"
                  >
                    Downgrade to Standard
                  </button>
                )}

                <button
                  onClick={() => setModal("cancel")}
                  className="w-full text-sm text-destructive hover:underline py-2"
                >
                  Cancel subscription
                </button>
              </>
            )}

            {plan === "free" && (
              <Link
                href="/plans"
                className="block text-center w-full gradient-primary text-white font-medium rounded-xl py-3 px-4 shadow-glow-purple hover:opacity-90 transition"
              >
                Choose a plan
              </Link>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl p-6 sm:p-8 border border-destructive/40 bg-destructive/5">
          <h2 className="text-sm font-medium uppercase tracking-widest text-destructive mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button
            onClick={() => setModal("delete")}
            className="w-full border border-destructive text-destructive font-medium rounded-xl py-3 px-4 hover:bg-destructive/10 transition"
          >
            Delete my account
          </button>
        </section>
      </div>

      {/* Upgrade — UI only, no functional logic yet */}
      <Dialog open={modal === "upgrade"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              This feature is coming soon. Please check back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={close}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade — UI only, no functional logic yet */}
      <Dialog open={modal === "downgrade"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Downgrade to Standard</DialogTitle>
            <DialogDescription>
              This feature is coming soon. Please check back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={close}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel — fully wired */}
      <Dialog open={modal === "cancel"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              Your subscription will end at the current billing period. You'll lose access to all features after that.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={actionLoading}>Keep subscription</Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={actionLoading}>
              {actionLoading ? "Cancelling…" : "Cancel subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete — fully wired */}
      <Dialog open={modal === "delete"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated data. Type{" "}
              <span className="font-semibold text-destructive">DELETE</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="Type DELETE"
            className="mt-2"
          />
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={actionLoading}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteText !== "DELETE" || actionLoading}
              onClick={handleDeleteAccount}
            >
              {actionLoading ? "Deleting…" : "Permanently delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}