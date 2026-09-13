"use client";

import { Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { describedBy, Field, FormAlert, Input } from "@/components/ui/field";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthFormState,
} from "./actions";

type Mode = "sign-in" | "sign-up" | "forgot" | "reset";

const config: Record<
  Mode,
  {
    action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
    title: string;
    description: string;
    submit: string;
    pending: string;
  }
> = {
  "sign-in": {
    action: signIn,
    title: "Welcome back",
    description: "Sign in to see your purchases, batches, and payments.",
    submit: "Sign in",
    pending: "Signing in…",
  },
  "sign-up": {
    action: signUp,
    title: "Create your account",
    description: "Start tracking your GO and direct seller purchases.",
    submit: "Create account",
    pending: "Creating account…",
  },
  forgot: {
    action: requestPasswordReset,
    title: "Reset your password",
    description: "Enter your email and we'll send you a link to set a new password.",
    submit: "Send reset link",
    pending: "Sending…",
  },
  reset: {
    action: updatePassword,
    title: "Set a new password",
    description: "Choose a password with at least 8 characters.",
    submit: "Save password",
    pending: "Saving…",
  },
};

export function AuthForm({
  mode,
  next,
  notice,
}: {
  mode: Mode;
  next?: string;
  notice?: string;
}) {
  const { action, title, description, submit, pending: pendingLabel } = config[mode];
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);

  if (state.message) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-success-soft text-success">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Check your email</h1>
        <p role="status" className="mt-2 text-[15px] text-ink-2">
          {state.message}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-accent-ink hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;
  const showEmail = mode !== "reset";
  const showPasswordField = mode !== "forgot";

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>
      </div>

      <form action={formAction} noValidate className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}

        {(state.error || notice) && <FormAlert>{state.error ?? notice}</FormAlert>}

        {showEmail && (
          <Field id="email" label="Email" error={emailError}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              defaultValue={state.email}
              placeholder="you@example.com"
              required
              aria-invalid={Boolean(emailError)}
              aria-describedby={describedBy("email", emailError)}
            />
          </Field>
        )}

        {showPasswordField && (
          <Field
            id="password"
            label={mode === "reset" ? "New password" : "Password"}
            error={passwordError}
            hint={mode === "sign-up" ? "At least 8 characters." : undefined}
            action={
              mode === "sign-in" ? (
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-accent-ink hover:underline"
                >
                  Forgot password?
                </Link>
              ) : undefined
            }
          >
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                className="pr-12"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={describedBy(
                  "password",
                  passwordError,
                  mode === "sign-up" ? "hint" : undefined,
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-3 hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-[18px]" aria-hidden="true" />
                ) : (
                  <Eye className="size-[18px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </Field>
        )}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {pending ? pendingLabel : submit}
        </Button>
      </form>

      <FooterLink mode={mode} />
    </>
  );
}

function FooterLink({ mode }: { mode: Mode }) {
  const links: Record<Mode, ReactNode> = {
    "sign-in": (
      <>
        New to Batchly? <AuthLink href="/signup">Create an account</AuthLink>
      </>
    ),
    "sign-up": (
      <>
        Already have an account? <AuthLink href="/login">Sign in</AuthLink>
      </>
    ),
    forgot: (
      <>
        Remembered it? <AuthLink href="/login">Back to sign in</AuthLink>
      </>
    ),
    reset: null,
  };
  if (!links[mode]) return null;
  return <p className="mt-6 text-center text-sm text-ink-2">{links[mode]}</p>;
}

function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-accent-ink hover:underline">
      {children}
    </Link>
  );
}
