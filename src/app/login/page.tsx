import type { Metadata } from "next";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In — BookBee",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout mode="login">
      <LoginForm />
    </AuthSplitLayout>
  );
}
