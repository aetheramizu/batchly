import { test } from "node:test";
import assert from "node:assert/strict";
import { MIN_PASSWORD, validatePasswordPair } from "./password.ts";

test("validatePasswordPair: requires a password of at least 8 characters", () => {
  assert.equal(validatePasswordPair("", "abc12345").password, "Password is required.");
  assert.equal(validatePasswordPair("short", "short").password, "Use at least 8 characters.");
  assert.equal(validatePasswordPair("longenough", "longenough").password, undefined);
});

test("validatePasswordPair: requires the confirmation field", () => {
  assert.equal(validatePasswordPair("longenough", "").confirmPassword, "Confirm your password.");
});

test("validatePasswordPair: rejects a mismatch", () => {
  assert.equal(
    validatePasswordPair("longenough", "longenough2").confirmPassword,
    "Passwords don't match.",
  );
});

test("validatePasswordPair: accepts a matching pair", () => {
  const errors = validatePasswordPair("longenough", "longenough");
  assert.deepEqual(errors, {});
});

test("validatePasswordPair: honours the configured minimum length", () => {
  assert.equal(validatePasswordPair("abc", "abc", 3).password, undefined);
  assert.equal(MIN_PASSWORD, 8);
});
