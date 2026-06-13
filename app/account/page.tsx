"use client";

import { useState } from "react";
import Link from "next/link";
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

const USER = {
  name: "Daniel Okafor",
  email: "daniel.okafor@example.com",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SettingsPage() {
  const [plan, setPlan] = useState<"standard" | "premium">("standard");
  const [modal, setModal] = useState<null | "upgrade" | "downgrade" | "cancel" | "delete">(null);
  const [deleteText, setDeleteText] = useState("");

  const close = () => {
    setModal(null);
    setDeleteText("");
  };

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
              {getInitials(USER.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold truncate">{USER.name}</p>
              <p className="text-sm text-muted-foreground truncate">{USER.email}</p>
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
                plan === "premium"
                  ? "inline-flex items-center rounded-full px-4 py-1.5 text-base font-semibold bg-[color:var(--neon-green)]/15 text-[color:var(--neon-green)] border border-[color:var(--neon-green)]/30"
                  : "inline-flex items-center rounded-full px-4 py-1.5 text-base font-semibold bg-muted text-muted-foreground border border-border"
              }
            >
              {plan === "premium" ? "Premium" : "Standard"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Renews on 12 July 2026</p>

          <div className="space-y-3">
            {plan === "standard" ? (
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

      {/* Upgrade */}
      <Dialog open={modal === "upgrade"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              You'll be charged ₦15,000 today and every 30 days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button
              className="gradient-primary text-white"
              onClick={() => {
                setPlan("premium");
                close();
              }}
            >
              Confirm upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade */}
      <Dialog open={modal === "downgrade"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Downgrade to Standard</DialogTitle>
            <DialogDescription>
              You'll keep Premium access until your current period ends, then switch to Standard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={close}>Keep Premium</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPlan("standard");
                close();
              }}
            >
              Confirm downgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={modal === "cancel"} onOpenChange={(o: boolean) => !o && close()}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              Your subscription will end at the current billing period. You'll lose access to all features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={close}>Keep subscription</Button>
            <Button variant="destructive" onClick={close}>
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
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
          <DialogFooter>
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteText !== "DELETE"}
              onClick={close}
            >
              Permanently delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}