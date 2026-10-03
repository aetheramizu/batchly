"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  message?: string;
  email?: string;
};

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function validateEmail(email: string) {
  if (!email) return "Email is required.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return undefined;
}

/** Only allow redirects to paths inside the app. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

async function siteOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

function authErrorMessage(error: { message?: string; status?: number; code?: string }) {
  console.error("[batchly] auth:", error);
  const message = error.message?.toLowerCase() ?? "";
  if (error.status === 429 || message.includes("rate limit")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for the confirmation link.";
  }
  if (message.includes("already registered") || error.code === "user_already_exists") {
    return "An account with this email already exists. Sign in instead.";
  }
  if (message.includes("password")) {
    return `Choose a stronger password with at least ${MIN_PASSWORD} characters.`;
  }
  return "Something went wrong. Please try again.";
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const fieldErrors = {
    email: validateEmail(email),
    password: password ? undefined : "Password is required.",
  };
  if (fieldErrors.email || fieldErrors.password) return { fieldErrors, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error), email };

  redirect(safeNext(formData.get("next")));
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const fieldErrors = {
    email: validateEmail(email),
    password:
      password.length >= MIN_PASSWORD
        ? undefined
        : `Use at least ${MIN_PASSWORD} characters.`,
  };
  if (fieldErrors.email || fieldErrors.password) return { fieldErrors, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm` },
  });
  if (error) return { error: authErrorMessage(error), email };

  // With email confirmation enabled there is no session until the link is used.
  if (!data.session) {
    return {
      message: `We sent a confirmation link to ${email}. Open it to finish creating your account.`,
      email,
    };
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=/reset-password`,
  });
  if (error && error.status === 429) return { error: authErrorMessage(error), email };
  if (error) console.error("[batchly] reset password:", error);

  // Same response whether or not the account exists.
  return {
    message: `If an account exists for ${email}, a password reset link is on its way.`,
    email,
  };
}

export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { fieldErrors: { password: `Use at least ${MIN_PASSWORD} characters.` } };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) {
    return { error: "Your reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error) };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
