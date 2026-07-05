"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AuthForm({
  mode,
  onSuccess,
}: {
  mode: "login" | "register";
  onSuccess: () => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success(
          mode === "login" ? "Welcome back to BookBee!" : "Account created — welcome to BookBee!",
        );
        onSuccess();
      }}
    >
      {mode === "register" && (
        <div className="space-y-1.5">
          <Label htmlFor={`${mode}-name`}>Full name</Label>
          <Input id={`${mode}-name`} name="name" placeholder="Jane Doe" required />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input
          id={`${mode}-email`}
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>
      <DialogFooter>
        <Button type="submit" className="w-full">
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="default">
          Log in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log in to BookBee</DialogTitle>
          <DialogDescription>
            Pick up where you left off across all your devices.
          </DialogDescription>
        </DialogHeader>
        <AuthForm mode="login" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function RegisterDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>
            Join BookBee to build your library and track your listening.
          </DialogDescription>
        </DialogHeader>
        <AuthForm mode="register" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
