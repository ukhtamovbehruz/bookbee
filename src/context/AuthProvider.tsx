"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { syncPointsForUser } from "@/lib/points";
import { syncProfileForUser } from "@/lib/profile";
import { syncPremiumForUser } from "@/lib/premium";

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Derive the `{ name, email }` shape the rest of the app expects from a
 * Supabase auth user. The display name lives in user_metadata — set by our
 * sign-up form (`name`) or supplied by Google OAuth (`full_name`/`name`).
 */
function toAuthUser(u: SupabaseUser | null | undefined): AuthUser | null {
  if (!u) return null;
  const meta = u.user_metadata ?? {};
  const metaName = typeof meta.name === "string" ? meta.name : "";
  const metaFullName = typeof meta.full_name === "string" ? meta.full_name : "";
  const fallback = u.email ? u.email.split("@")[0] : "Listener";
  return {
    name: metaName || metaFullName || fallback,
    email: (u.email ?? "").toLowerCase(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const supabaseUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const syncSideEffects = (su: SupabaseUser | null | undefined) => {
      const authUser = toAuthUser(su);
      supabaseUserIdRef.current = su?.id ?? null;
      const statsUser = su && authUser ? { id: su.id, ...authUser } : null;
      void syncPointsForUser(statsUser);
      void syncProfileForUser(statsUser ? { id: statsUser.id, email: statsUser.email } : null);
      void syncPremiumForUser(statsUser);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toAuthUser(data.session?.user));
      setIsReady(true);
      syncSideEffects(data.session?.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user));
      setIsReady(true);
      syncSideEffects(session?.user);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: trimmedName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      // When email confirmation is enabled in Supabase, no session is returned
      // until the user clicks the link in their inbox.
      if (!data.session) {
        toast.success("Account created! Check your email to confirm, then log in.");
        return false;
      }
      toast.success(`Welcome to BookBee, ${trimmedName}!`);
      return true;
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : error.message,
        );
        return false;
      }
      toast.success(`Welcome back, ${toAuthUser(data.user)?.name ?? "friend"}!`);
      return true;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.info("You've been signed out.");
  }, [supabase]);

  const requestPasswordReset = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        },
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Password reset instructions sent to ${email}.`);
    },
    [supabase],
  );

  const updateName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const { error } = await supabase.auth.updateUser({ data: { name: trimmed } });
      if (error) {
        toast.error(error.message);
        return;
      }
      setUser((prev) => {
        if (!prev) return prev;
        const userId = supabaseUserIdRef.current;
        if (userId) {
          void syncPointsForUser({ id: userId, email: prev.email, name: trimmed });
          void syncPremiumForUser({ id: userId, email: prev.email, name: trimmed });
        }
        return { ...prev, name: trimmed };
      });
    },
    [supabase],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
