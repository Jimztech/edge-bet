"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/supabase";
import type { User } from "@supabase/supabase-js";

type UserPlan = "free" | "standard" | "premium";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  plan_expires_at: string | null;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  const isStandard = profile?.plan === "standard" || profile?.plan === "premium";
  const isPremium = profile?.plan === "premium";

  return { user, profile, loading, isStandard, isPremium };
}