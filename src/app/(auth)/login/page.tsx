import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice =
    params.error === "link"
      ? "That link is invalid or has expired. Sign in, or request a new link."
      : undefined;

  return <AuthForm mode="sign-in" next={next} notice={notice} />;
}
