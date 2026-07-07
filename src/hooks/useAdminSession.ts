"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/local-storage";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/admin";

const ADMIN_SESSION_KEY = "bookbee_admin_session";

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsAdmin(readStorage(ADMIN_SESSION_KEY, false));
    setIsReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (ok) {
      writeStorage(ADMIN_SESSION_KEY, true);
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    writeStorage(ADMIN_SESSION_KEY, false);
    setIsAdmin(false);
  }, []);

  return { isAdmin, isReady, login, logout };
}
