"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/layout/SocialIcons";
import { useAuth } from "@/context/AuthProvider";

export function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Sign up</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create an account to start listening. Already have one?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in here
        </Link>
        .
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const name = String(form.get("name") ?? "").trim();
          const email = String(form.get("email") ?? "").trim();
          const password = String(form.get("password") ?? "");

          setIsSubmitting(true);
          const success = await signUp(name, email, password);
          setIsSubmitting(false);
          if (success) router.push("/");
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">Full name</Label>
          <Input id="signup-name" name="name" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">Email address</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="Provide your email address"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
          Sign Up
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
        onClick={async () => {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
        }}
      >
        <GoogleIcon className="size-4" />
        Continue with Google
      </Button>

      <p className="mt-6 text-xs text-muted-foreground">
        By signing up you agree to BookBee&apos;s{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
