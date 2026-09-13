import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatMoneyInput, formatRupiah, parseMoneyInput } from "./format.ts";
import {
  hasErrors,
  validateOsDraft,
  validatePurchaseDraft,
  type PurchaseDraft,
} from "./validation.ts";

const base: PurchaseDraft = {
  origin: "NEW",
  sourceId: "source-1",
  sourceType: "GROUP_ORDER",
  country: "CHINA",
  batchId: "batch-1",
  itemName: "Juun PC",
  artistGroup: "",
  price: 90_000,
  paidAmount: 0,
  purchaseDate: "2026-09-12",
  trackingStatus: "",
  notes: "",
};

test("a valid Group Order purchase passes", () => {
  assert.equal(hasErrors(validatePurchaseDraft(base)), false);
});

// PUR-03
test("required fields are enforced", () => {
  const errors = validatePurchaseDraft({
    ...base,
    itemName: " ",
    price: null,
    purchaseDate: "",
    country: "",
  });
  assert.ok(errors.itemName);
  assert.ok(errors.price);
  assert.ok(errors.purchaseDate);
  assert.ok(errors.country);
});

test("Group Order requires a batch", () => {
  assert.equal(
    validatePurchaseDraft({ ...base, batchId: "" }).batchId,
    "Batch is required.",
  );
});

// DS-02
test("Direct Seller must not have a batch and needs a tracking status", () => {
  const errors = validatePurchaseDraft({
    ...base,
    sourceType: "DIRECT_SELLER",
    batchId: "batch-1",
    trackingStatus: "",
  });
  assert.equal(errors.batchId, "Batch must not be selected.");
  assert.ok(errors.trackingStatus);

  const valid = validatePurchaseDraft({
    ...base,
    sourceType: "DIRECT_SELLER",
    batchId: "",
    trackingStatus: "PURCHASED",
  });
  assert.equal(hasErrors(valid), false);
});

// PAY-04, PAY-05
test("paid amount cannot exceed price or be negative", () => {
  assert.equal(
    validatePurchaseDraft({ ...base, paidAmount: 100_000 }).paidAmount,
    "Paid amount cannot exceed price.",
  );
  assert.equal(
    validatePurchaseDraft({ ...base, paidAmount: -10_000 }).paidAmount,
    "Paid amount cannot be negative.",
  );
});

test("OS received cannot exceed OS price", () => {
  const errors = validateOsDraft({
    osPrice: 80_000,
    osPaidAmount: 90_000,
    osDate: "2026-09-12",
    osNotes: "",
  });
  assert.ok(errors.osPaidAmount);
});

test("money formatting", () => {
  assert.equal(formatRupiah(90_000), "Rp90.000");
  assert.equal(formatRupiah(1_250_000), "Rp1.250.000");
  assert.equal(formatRupiah(-10_000), "-Rp10.000");
  assert.equal(formatMoneyInput("0090000"), "90.000");
  assert.equal(parseMoneyInput("1.250.000"), 1_250_000);
  assert.equal(parseMoneyInput(""), null);
  assert.equal(formatDate("2026-09-12"), "12 Sep 2026");
  // 20:13 UTC is already the next day in Jakarta.
  assert.equal(formatDate("2026-09-13T20:13:45+00:00"), "14 Sep 2026");
});
