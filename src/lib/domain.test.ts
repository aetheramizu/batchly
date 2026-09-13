import { test } from "node:test";
import assert from "node:assert/strict";
import {
  daysSince,
  isStale,
  osDifference,
  paymentStatus,
  remainingAmount,
} from "./domain.ts";

// TEST_PLAN §13 PAY-01..03
test("payment status is derived from price and paid amount", () => {
  assert.equal(paymentStatus(90_000, 0), "UNPAID");
  assert.equal(paymentStatus(90_000, 40_000), "PARTIAL");
  assert.equal(paymentStatus(90_000, 90_000), "PAID");
});

test("remaining amount is price minus paid", () => {
  assert.equal(remainingAmount(90_000, 0), 90_000);
  assert.equal(remainingAmount(90_000, 40_000), 50_000);
  assert.equal(remainingAmount(90_000, 90_000), 0);
});

// TEST_PLAN §17 OS-GIVE-02, OS-GIVE-03
test("OS payment and OS difference", () => {
  assert.equal(paymentStatus(80_000, 40_000), "PARTIAL");
  assert.equal(remainingAmount(80_000, 40_000), 40_000);
  assert.equal(osDifference(80_000, 90_000), -10_000);
  assert.equal(osDifference(95_000, 90_000), 5_000);
});

// TEST_PLAN §14 TRACK-04, TRACK-05
test("stale tracking uses the 14 day threshold and never flags delivered", () => {
  const now = new Date("2026-09-14T12:00:00Z");
  assert.equal(daysSince("2026-09-01T12:00:00Z", now), 13);
  assert.equal(isStale("IN_TRANSIT", "2026-09-01T12:00:00Z", now), false);
  assert.equal(isStale("IN_TRANSIT", "2026-08-31T12:00:00Z", now), true);
  assert.equal(isStale("DELIVERED", "2026-01-01T00:00:00Z", now), false);
});
