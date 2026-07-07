"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { readStorage, writeStorage } from "@/lib/local-storage";

export interface AuthUser {
  name: string;
  email: string;
}

interface StoredAccount extends AuthUser {
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  signUp: (name: string, email: string, password: string) => boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  requestPasswordReset: (email: string) => void;
  updateName: (name: string) => void;
}

const ACCOUNTS_KEY = "bookbee_accounts";
const SESSION_KEY = "bookbee_session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(readStorage<AuthUser | null>(SESSION_KEY, null));
    setIsReady(true);
  }, []);

  const signUp = useCallback((name: string, email: string, password: string) => {
    const accounts = readStorage<StoredAccount[]>(ACCOUNTS_KEY, []);
    const normalizedEmail = email.trim().toLowerCase();

    if (accounts.some((a) => a.email === normalizedEmail)) {
      toast.error("An account with this email already exists — try logging in instead.");
      return false;
    }

    const account: StoredAccount = { name, email: normalizedEmail, password };
    writeStorage(ACCOUNTS_KEY, [...accounts, account]);
    const nextUser = { name, email: normalizedEmail };
    writeStorage(SESSION_KEY, nextUser);
    setUser(nextUser);
    toast.success(`Welcome to BookBee, ${name}!`);
    return true;
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const accounts = readStorage<StoredAccount[]>(ACCOUNTS_KEY, []);
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email === normalizedEmail);

    if (!account) {
      toast.error("No account found with that email. Try signing up instead.");
      return false;
    }
    if (account.password !== password) {
      toast.error("Incorrect password. Please try again.");
      return false;
    }

    const nextUser = { name: account.name, email: account.email };
    writeStorage(SESSION_KEY, nextUser);
    setUser(nextUser);
    toast.success(`Welcome back, ${account.name}!`);
    return true;
  }, []);

  const signOut = useCallback(() => {
    writeStorage(SESSION_KEY, null);
    setUser(null);
    toast.info("You've been signed out.");
  }, []);

  const requestPasswordReset = useCallback((email: string) => {
    const accounts = readStorage<StoredAccount[]>(ACCOUNTS_KEY, []);
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email === normalizedEmail);

    if (!account) {
      toast.error("No account found with that email.");
      return;
    }
    toast.success(`Password reset instructions sent to ${email}.`);
  }, []);

  const updateName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed || !user) return;
      const accounts = readStorage<StoredAccount[]>(ACCOUNTS_KEY, []);
      const nextAccounts = accounts.map((a) =>
        a.email === user.email ? { ...a, name: trimmed } : a,
      );
      writeStorage(ACCOUNTS_KEY, nextAccounts);
      const nextUser = { ...user, name: trimmed };
      writeStorage(SESSION_KEY, nextUser);
      setUser(nextUser);
    },
    [user],
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
