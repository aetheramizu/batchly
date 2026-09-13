// Finance calculations shared by Dashboard and Finance (DATA_MODEL §33,
// UX_SPEC §4, §36). Pure — tested with node --test.
//
// Scope: non-archived purchases and their additional costs. Payment status,
// remaining amounts and OS Difference are always derived, never stored.

// Relative .ts import so node --test can resolve it without the "@/" alias.
import { osDifference, paymentStatus, remainingAmount, type CostType } from "../../lib/domain.ts";
import type { CostRow, PurchaseView } from "../purchases/queries";

type FinancePurchase = Pick<
  PurchaseView,
  "id" | "price" | "paid_amount" | "ownership_status" | "purchase_origin" | "os_price" | "os_paid_amount"
>;
type FinanceCost = Pick<CostRow, "purchase_id" | "type" | "amount" | "paid">;

export type AmountCount = { count: number; amount: number };

export type PurchaseFinance = {
  /** Sum of every purchase price (for Taken OS, the price is the OS price). */
  totalValue: number;
  /** Total Spent: SUM(paid_amount). */
  spent: number;
  /** To Pay: SUM(price − paid_amount) for purchases not fully paid. */
  toPay: number;
  /** Outstanding amount per payment status; `amount` is what is still owed. */
  byPayment: { PAID: AmountCount; PARTIAL: AmountCount; UNPAID: AmountCount };
  outstandingCount: number;
};

export function summarizePurchases(purchases: FinancePurchase[]): PurchaseFinance {
  const byPayment = {
    PAID: { count: 0, amount: 0 },
    PARTIAL: { count: 0, amount: 0 },
    UNPAID: { count: 0, amount: 0 },
  };
  let totalValue = 0;
  let spent = 0;
  let toPay = 0;

  for (const p of purchases) {
    const status = paymentStatus(p.price, p.paid_amount);
    const remaining = remainingAmount(p.price, p.paid_amount);
    totalValue += p.price;
    spent += p.paid_amount;
    toPay += remaining;
    byPayment[status].count += 1;
    byPayment[status].amount += status === "PAID" ? p.paid_amount : remaining;
  }

  return {
    totalValue,
    spent,
    toPay,
    byPayment,
    outstandingCount: byPayment.PARTIAL.count + byPayment.UNPAID.count,
  };
}

export type CostFinance = {
  total: number;
  paid: number;
  unpaid: number;
  unpaidCount: number;
  byType: Record<CostType, number>;
};

/** Costs are only counted for purchases in `purchaseIds` (e.g. non-archived). */
export function summarizeCosts(costs: FinanceCost[], purchaseIds?: Set<string>): CostFinance {
  const byType: Record<CostType, number> = { TAX: 0, PACKING: 0, DOMESTIC_SHIPPING: 0, OTHER: 0 };
  let total = 0;
  let paid = 0;
  let unpaidCount = 0;

  for (const cost of costs) {
    if (purchaseIds && !purchaseIds.has(cost.purchase_id)) continue;
    total += cost.amount;
    byType[cost.type] += cost.amount;
    if (cost.paid) paid += cost.amount;
    else unpaidCount += 1;
  }

  return { total, paid, unpaid: total - paid, unpaidCount, byType };
}

export type OsFinance = {
  givenCount: number;
  takenCount: number;
  /** Total agreed OS price for Give OS purchases. */
  osPrice: number;
  /** Amount received so far from people the user gave OS to. */
  osReceived: number;
  /** OS price not received yet. */
  osToReceive: number;
  /** SUM(os_price − price) for Give OS purchases. Never "profit". */
  difference: number;
  /** Amount paid for Taken OS purchases (already part of Total Spent). */
  takenSpent: number;
};

export function summarizeOs(purchases: FinancePurchase[]): OsFinance {
  const result: OsFinance = {
    givenCount: 0,
    takenCount: 0,
    osPrice: 0,
    osReceived: 0,
    osToReceive: 0,
    difference: 0,
    takenSpent: 0,
  };

  for (const p of purchases) {
    if (p.purchase_origin === "TAKEN_OS") {
      result.takenCount += 1;
      result.takenSpent += p.paid_amount;
    }
    if (p.ownership_status === "GIVEN_OS" && p.os_price !== null) {
      const received = p.os_paid_amount ?? 0;
      result.givenCount += 1;
      result.osPrice += p.os_price;
      result.osReceived += received;
      result.osToReceive += remainingAmount(p.os_price, received);
      result.difference += osDifference(p.os_price, p.price);
    }
  }

  return result;
}
