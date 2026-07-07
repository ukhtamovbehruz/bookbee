"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/layout/SocialIcons";
import { useAuth } from "@/context/AuthProvider";

export function LoginForm() {
  const { signIn, requestPasswordReset } = useAuth();
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email on your account and we&apos;ll send reset instructions.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const email = String(form.get("email") ?? "").trim();
            requestPasswordReset(email);
            setShowForgotPassword(false);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              placeholder="Provide your email address"
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full rounded-full">
            Send reset link
          </Button>
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Back to log in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick up where you left off. New to BookBee?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up here
        </Link>
        .
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const email = String(form.get("email") ?? "").trim();
          const password = String(form.get("password") ?? "");
          const success = signIn(email, password);
          if (success) router.push("/");
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="Provide your email address"
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full rounded-full">
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2 rounded-full"
        onClick={() => toast.info("Google sign-in isn't wired up yet in this demo.")}
      >
        <GoogleIcon className="size-4" />
        Continue with Google
      </Button>
    </div>
  );
}
