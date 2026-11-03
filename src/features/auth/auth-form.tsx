"use client";

import { Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import {
  describedBy,
  Field,
  FormAlert,
  FormErrorSummary,
  Input,
} from "@/components/ui/field";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthFormState,
} from "./actions";
import { MIN_PASSWORD, validatePasswordPair, type PasswordFieldErrors } from "./password";

type Mode = "sign-in" | "sign-up" | "forgot" | "reset";

type ModeConfig = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  title: string;
  description: string;
  submit: string;
  pending: string;
  passwordLabel?: string;
  passwordHint?: string;
  confirmLabel?: string;
};

const PASSWORD_HINT =
  "At least 8 characters. Use a new password for Batchly — not your email password.";

const config: Record<Mode, ModeConfig> = {
  "sign-in": {
    action: signIn,
    title: "Welcome back",
    description: "Sign in to see your purchases, batches, and payments.",
    submit: "Sign in",
    pending: "Signing in…",
    passwordLabel: "Password",
  },
  "sign-up": {
    action: signUp,
    title: "Create your account",
    description:
      "Start tracking your GO and direct seller purchases. We only use your email to sign in and send confirmations.",
    submit: "Create account",
    pending: "Creating account…",
    passwordLabel: "Create password",
    passwordHint: PASSWORD_HINT,
    confirmLabel: "Confirm password",
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
    description: "Choose a new password with at least 8 characters.",
    submit: "Save password",
    pending: "Saving…",
    passwordLabel: "New password",
    passwordHint: PASSWORD_HINT,
    confirmLabel: "Confirm new password",
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
  const {
    action,
    title,
    description,
    submit,
    pending: pendingLabel,
    passwordLabel,
    passwordHint,
    confirmLabel,
  } = config[mode];

  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientErrors, setClientErrors] = useState<PasswordFieldErrors>({});
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [serverErrorsCleared, setServerErrorsCleared] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const lastState = useRef(state);

  const needsConfirmation = Boolean(confirmLabel);
  const showEmail = mode !== "reset";
  const showPasswordField = mode !== "forgot";

  // After a failed server submission, move focus to the error summary and clear
  // the password fields so a masked typo is never silently re-submitted.
  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    setServerErrorsCleared(false);

    if (!state.fieldErrors) return;

    summaryRef.current?.focus();
    for (const name of ["password", "confirmPassword"]) {
      const input = formRef.current?.querySelector<HTMLInputElement>(
        `input[name="${name}"]`,
      );
      if (input) input.value = "";
    }
  }, [state]);

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

  const serverFieldErrors = serverErrorsCleared ? undefined : state.fieldErrors;
  const emailError = serverFieldErrors?.email;
  const passwordError = clientErrors.password ?? serverFieldErrors?.password;
  const confirmError = clientErrors.confirmPassword ?? serverFieldErrors?.confirmPassword;

  const summaryItems: { id: string; label: string }[] = [];
  if (emailError) summaryItems.push({ id: "email", label: emailError });
  if (passwordError) summaryItems.push({ id: "password", label: passwordError });
  if (confirmError) summaryItems.push({ id: "confirm-password", label: confirmError });

  function currentPasswords() {
    return {
      password: passwordRef.current?.value ?? "",
      confirm: confirmRef.current?.value ?? "",
    };
  }

  function setPasswordError(key: keyof PasswordFieldErrors, message?: string) {
    setClientErrors((prev) => {
      const nextErrors = { ...prev };
      if (message) nextErrors[key] = message;
      else delete nextErrors[key];
      return nextErrors;
    });
  }

  function handlePasswordInput() {
    if (!needsConfirmation) return;
    const { password, confirm } = currentPasswords();
    if (password.length >= MIN_PASSWORD) setPasswordError("password");
    if (confirm && confirm === password) setPasswordError("confirmPassword");
  }

  function handlePasswordBlur() {
    if (!needsConfirmation) return;
    const { password, confirm } = currentPasswords();

    if (password && password.length < MIN_PASSWORD) {
      setPasswordError("password", `Use at least ${MIN_PASSWORD} characters.`);
    } else if (password) {
      setPasswordError("password");
    }

    if (confirm) {
      setPasswordError(
        "confirmPassword",
        confirm === password ? undefined : "Passwords don't match.",
      );
    }
  }

  function handleConfirmBlur() {
    const { password, confirm } = currentPasswords();
    if (!confirm) setPasswordError("confirmPassword", "Confirm your password.");
    else if (confirm !== password)
      setPasswordError("confirmPassword", "Passwords don't match.");
    else setPasswordError("confirmPassword");
  }

  function handleConfirmInput() {
    const { password, confirm } = currentPasswords();
    if (confirm && confirm === password) setPasswordError("confirmPassword");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!needsConfirmation) return;

    const { password, confirm } = currentPasswords();
    const errors = validatePasswordPair(password, confirm);

    if (errors.password || errors.confirmPassword) {
      event.preventDefault();
      setClientErrors(errors);
      setSummaryVisible(true);
      (errors.password ? passwordRef : confirmRef).current?.focus();
      return;
    }

    setClientErrors({});
    setSummaryVisible(false);
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        noValidate
        onSubmit={handleSubmit}
        onChange={() => {
          if (!serverErrorsCleared) setServerErrorsCleared(true);
        }}
        className="flex flex-col gap-4"
      >
        {next && <input type="hidden" name="next" value={next} />}

        {(state.error || notice) && <FormAlert>{state.error ?? notice}</FormAlert>}

        {(summaryVisible || serverFieldErrors) && (
          <FormErrorSummary ref={summaryRef} items={summaryItems} />
        )}

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

        {showPasswordField && passwordLabel && (
          <PasswordField
            id="password"
            name="password"
            label={passwordLabel}
            hint={passwordHint}
            error={passwordError}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            visible={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            toggleLabels={{ show: "Show password", hide: "Hide password" }}
            inputRef={passwordRef}
            onBlur={handlePasswordBlur}
            onInput={handlePasswordInput}
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
          />
        )}

        {needsConfirmation && confirmLabel && (
          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            label={confirmLabel}
            hint="Re-enter the same password."
            error={confirmError}
            autoComplete="new-password"
            visible={showConfirm}
            onToggle={() => setShowConfirm((value) => !value)}
            toggleLabels={{
              show: "Show confirm password",
              hide: "Hide confirm password",
            }}
            inputRef={confirmRef}
            onBlur={handleConfirmBlur}
            onInput={handleConfirmInput}
          />
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

function PasswordField({
  id,
  name,
  label,
  hint,
  error,
  autoComplete,
  visible,
  onToggle,
  toggleLabels,
  inputRef,
  onBlur,
  onInput,
  action,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
  autoComplete: string;
  visible: boolean;
  onToggle: () => void;
  toggleLabels: { show: string; hide: string };
  inputRef: RefObject<HTMLInputElement | null>;
  onBlur?: () => void;
  onInput?: () => void;
  action?: ReactNode;
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint} action={action}>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className="pr-12"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          onBlur={onBlur}
          onInput={onInput}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? toggleLabels.hide : toggleLabels.show}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-3 hover:text-ink"
        >
          {visible ? (
            <EyeOff className="size-[18px]" aria-hidden="true" />
          ) : (
            <Eye className="size-[18px]" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
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
