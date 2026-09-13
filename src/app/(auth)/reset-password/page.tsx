import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Set new password" };

// Reached from the password reset email via /auth/confirm, which signs the
// user in first. The proxy redirects visitors without a session to /login.
export default function ResetPasswordPage() {
  return <AuthForm mode="reset" />;
}
