import type { Metadata } from "next";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up — BookBee",
};

export default function SignUpPage() {
  return (
    <AuthSplitLayout mode="signup">
      <SignUpForm />
    </AuthSplitLayout>
  );
}
