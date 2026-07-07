"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminLoginPage() {
  const { login } = useAdminSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Shield className="size-6" />
          </span>
          <h1 className="text-xl font-bold">BookBee Admin</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage the book catalog.
          </p>
        </div>

        <form
          className="glass space-y-4 rounded-2xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const email = String(form.get("email") ?? "").trim();
            const password = String(form.get("password") ?? "");

            setIsSubmitting(true);
            const ok = login(email, password);
            setIsSubmitting(false);

            if (ok) {
              toast.success("Welcome back, admin.");
              router.push("/admin");
            } else {
              toast.error("Invalid admin credentials.");
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" name="password" type="password" required />
          </div>
          <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            Back to BookBee
          </Link>
        </p>
      </div>
    </div>
  );
}
