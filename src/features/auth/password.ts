// Password validation shared by the client form and the server actions.
// Pure — tested with node --test.

export const MIN_PASSWORD = 8;

export type PasswordFieldErrors = {
  password?: string;
  confirmPassword?: string;
};

/**
 * Validates a new password and its confirmation.
 *
 * Used on the client for instant feedback and on the server as the source of
 * truth, so a request that skips the browser validation is still rejected.
 */
export function validatePasswordPair(
  password: string,
  confirmPassword: string,
  minLength = MIN_PASSWORD,
): PasswordFieldErrors {
  const errors: PasswordFieldErrors = {};

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < minLength) {
    errors.password = `Use at least ${minLength} characters.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords don't match.";
  }

  return errors;
}
