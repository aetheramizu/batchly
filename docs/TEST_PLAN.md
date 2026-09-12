# TEST PLAN
## K-pop Purchase & Shipment Tracker

**Status:** Draft v1.0  
**Related documents:** `docs/PRD.md`, `docs/DATA_MODEL.md`, `docs/UX_SPEC.md`, `docs/DESIGN_SYSTEM.md`

---

# 1. Purpose

This document defines how the MVP is tested before release.

The goal is not to create an enterprise QA system. The goal is to verify that the core product loop works reliably:

```text
Add Purchase
→ Organize
→ Track
→ Record Costs
→ Manage Payment
→ Give/Take OS
→ Review History
```

Testing should prioritize product-critical behavior over exhaustive edge cases.

---

# 2. Testing Principles

1. Test real user flows, not only isolated components.
2. Test Group Orders and Direct Sellers separately where their behavior differs.
3. Test mobile and desktop layouts.
4. Test authentication and data isolation.
5. Test derived values such as remaining payment and payment status.
6. Test destructive/state-changing actions carefully.
7. Use realistic K-pop collector data.
8. Do not add complicated test infrastructure unless it provides clear MVP value.

---

# 3. Test Levels

The MVP should use four practical levels:

```text
1. Manual smoke testing
2. Automated unit/component tests
3. Integration/database tests
4. End-to-end tests for critical flows
```

Not every feature requires an end-to-end test.

The highest-value flows should receive the strongest coverage.

---

# 4. Test Environment

Minimum environments:

### Browser/Desktop

Test at least:

- Chrome
- one additional major browser if practical

### Mobile

Test at least:

- Android Chrome
- iOS Safari if an iPhone/iOS environment is available

### Database

Use a separate development/test Supabase environment where practical.

Never use production user data for automated destructive tests.

---

# 5. Seed Test Data

Create realistic test data containing at least:

```text
8+ Sources
15+ Group Order Batches
40–60 Purchases
```

Include:

- China
- Korea
- Japan
- Thailand
- Singapore
- Indonesia

Include sources with:

- Group Order + WhatsApp
- Group Order + LINE
- Group Order + X
- Direct Seller + X
- Direct Seller + WhatsApp
- Direct Seller + Other

Include payment states:

```text
Paid
Partial
Unpaid
```

Include tracking states:

```text
Purchased
Warehouse
In Transit
Indonesia
Admin Received
Delivered
```

Include:

- stale batches
- stale Direct Seller purchases
- Given OS purchases
- Taken OS purchases
- additional costs
- missing images
- long item/source names

---

# 6. Smoke Test

Before detailed testing, verify that the application can:

- load
- authenticate
- open Dashboard
- open Purchases
- open Batches
- open Finance
- add a purchase
- open Purchase Detail
- update tracking
- add a cost
- Give OS
- Take OS
- log out

If any critical smoke test fails, do not proceed to release validation.

---

# 7. Authentication Tests

## AUTH-01 — Sign Up

**Steps**

1. Open sign-up.
2. Enter valid credentials.
3. Submit.
4. Verify account is created.
5. Verify user reaches the application.

**Expected**

- account is created
- authenticated session exists
- user sees their own application data

---

## AUTH-02 — Invalid Sign Up

Use invalid or incomplete input.

**Expected**

- validation appears
- account is not created
- error is understandable

---

## AUTH-03 — Login

**Expected**

- valid credentials authenticate successfully
- user reaches Dashboard

---

## AUTH-04 — Invalid Login

**Expected**

- authentication fails safely
- useful error appears
- no application data is exposed

---

## AUTH-05 — Logout

**Expected**

- session ends
- protected pages cannot be accessed without authentication

---

# 8. Row-Level Security / Data Isolation

This is a critical test area.

Create:

```text
User A
User B
```

Give each user separate:

- sources
- batches
- purchases
- additional costs

Verify:

```text
User A cannot read User B data.
User A cannot modify User B data.
User A cannot delete/archive User B data.
```

Also test foreign-key attempts where a User A purchase tries to reference:

```text
User B source
User B batch
```

**Expected**

The database rejects unauthorized cross-user relationships.

Frontend filtering alone is not considered sufficient.

---

# 9. Source Tests

## SRC-01 — Create Group Order Source

Enter:

```text
Name
Type = Group Order
Platform
```

**Expected**

Source is created and can be selected during purchase creation.

---

## SRC-02 — Create Direct Seller Source

**Expected**

Source is created with:

```text
Type = Direct Seller
```

and can be selected during purchase creation.

---

## SRC-03 — Source Metadata

Verify source displays:

```text
Name
Type
Platform
```

correctly.

---

## SRC-04 — Source Type Integrity

A source with existing batches/purchases must not be changed in a way that creates invalid data.

If source type changes are not supported after use, the UI should prevent the operation.

---

# 10. Group Order Batch Tests

## BATCH-01 — Create Batch

Create:

```text
GO A
China
Batch 42
```

**Expected**

Batch is created successfully.

---

## BATCH-02 — Same Batch Number Across Sources

Create:

```text
GO A → China → Batch 42
GO B → Korea → Batch 42
```

**Expected**

Both are allowed.

They are treated as different batches.

---

## BATCH-03 — Duplicate Batch Within Same Context

Try:

```text
GO A → China → Batch 42
GO A → China → Batch 42
```

**Expected**

Duplicate is rejected according to the unique batch rule.

---

## BATCH-04 — Batch Belongs to Group Order

Attempt to associate a batch with a Direct Seller source.

**Expected**

Operation is rejected.

---

## BATCH-05 — Batch Status Update

Change:

```text
Purchased → Warehouse
```

**Expected**

- batch status changes
- last updated timestamp changes
- associated purchases display Warehouse

---

# 11. Direct Seller Tests

## DS-01 — Create Direct Seller Purchase

Flow:

```text
Add Purchase
→ New Purchase
→ Direct Seller
→ Country
→ Details
```

**Expected**

No batch step appears.

---

## DS-02 — Direct Seller Has No Batch

Verify database and UI:

```text
batch_id = null
```

**Expected**

No Batch section is displayed.

---

## DS-03 — Direct Seller Tracking

Change:

```text
Purchased → In Transit
```

**Expected**

Only the selected purchase changes.

---

## DS-04 — Independent Direct Seller Purchases

Create two purchases from the same seller:

```text
Purchase A → In Transit
Purchase B → Purchased
```

**Expected**

Changing A does not change B.

---

# 12. New Purchase Tests

## PUR-01 — New Group Order Purchase

Flow:

```text
Add Purchase
→ New Purchase
→ Group Order
→ Source
→ Country
→ Batch
→ Details
→ Save
```

**Expected**

Purchase is created with:

```text
purchase_origin = NEW
ownership_status = ACTIVE
source_id = selected source
batch_id = selected batch
```

---

## PUR-02 — New Direct Seller Purchase

**Expected**

Purchase is created with:

```text
purchase_origin = NEW
ownership_status = ACTIVE
source_id = selected source
batch_id = null
country = selected country
```

---

## PUR-03 — Required Fields

Try saving without:

- item name
- price
- purchase date
- country
- batch where required

**Expected**

Validation prevents invalid submission.

---

## PUR-04 — Optional Fields

Create a purchase without:

- artist/group
- image
- notes

**Expected**

Purchase saves successfully.

---

# 13. Payment Tests

## PAY-01 — Unpaid

```text
Price = 90,000
Paid = 0
```

Expected:

```text
Status = Unpaid
Remaining = 90,000
```

---

## PAY-02 — Partial

```text
Price = 90,000
Paid = 40,000
```

Expected:

```text
Status = Partial
Remaining = 50,000
```

---

## PAY-03 — Paid

```text
Price = 90,000
Paid = 90,000
```

Expected:

```text
Status = Paid
Remaining = 0
```

---

## PAY-04 — Overpayment

```text
Price = 90,000
Paid = 100,000
```

Expected:

Submission is rejected if MVP constraint is:

```text
paid_amount <= price
```

---

## PAY-05 — Negative Payment

```text
Paid = -10,000
```

Expected:

Validation rejects the value.

---

## PAY-06 — Derived Status

Change paid amount after purchase creation.

**Expected**

Payment status and remaining amount update automatically.

The user does not manually edit payment status.

---

# 14. Tracking Tests

## TRACK-01 — Group Order Tracking

Create a batch with multiple purchases.

Change batch:

```text
Warehouse → In Transit
```

**Expected**

Every purchase in the batch displays:

```text
In Transit
```

---

## TRACK-02 — Direct Seller Tracking

Change one Direct Seller purchase.

**Expected**

Only that purchase changes.

---

## TRACK-03 — Last Updated

Change a tracking status.

**Expected**

`last_updated_at` is updated.

Editing unrelated purchase information should not falsely appear as a tracking update.

---

## TRACK-04 — Delivered Is Not Stale

A Delivered batch/purchase must not display a stale warning.

---

## TRACK-05 — Stale Tracking

Use a tracking update older than the agreed threshold.

**Expected**

The item displays a stale/no-update indicator.

The message must not claim that the shipment is lost or delayed.

---

# 15. Additional Cost Tests

## COST-01 — Add Tax

Create:

```text
Type = Tax
Amount = 6,000
```

**Expected**

Cost appears on Purchase Detail and Finance.

---

## COST-02 — Add Packing

**Expected**

Cost is categorized as Packing.

---

## COST-03 — Add Domestic Shipping

**Expected**

Cost is categorized correctly.

---

## COST-04 — Other Cost

**Expected**

Other costs can be recorded.

---

## COST-05 — Paid Cost

Set:

```text
Paid = true
```

**Expected**

Finance reflects the cost as paid.

---

## COST-06 — Unpaid Cost

Set:

```text
Paid = false
```

**Expected**

Finance can distinguish the outstanding additional cost.

---

# 16. Take OS Tests

## OS-TAKE-01 — Take OS from Group Order

Flow:

```text
Add Purchase
→ Take OS
→ Group Order Source
→ Country
→ Batch
→ Details
→ Save
```

Expected:

```text
purchase_origin = TAKEN_OS
ownership_status = ACTIVE
```

---

## OS-TAKE-02 — Take OS from Direct Seller

Expected:

```text
purchase_origin = TAKEN_OS
ownership_status = ACTIVE
batch_id = null
```

---

## OS-TAKE-03 — Take OS Payment

Verify:

```text
OS Price
Paid
Remaining
Payment Status
```

are calculated correctly.

---

## OS-TAKE-04 — Taken OS Can Be Tracked

A Taken OS purchase should behave like a normal owned purchase after creation.

---

# 17. Give OS Tests

## OS-GIVE-01 — Give OS

From Purchase Detail:

```text
Give OS
```

Enter valid OS information.

**Expected**

Purchase changes to:

```text
ownership_status = GIVEN_OS
```

and remains in history.

---

## OS-GIVE-02 — OS Payment

Verify:

```text
OS Price = 80,000
OS Paid = 40,000
Remaining = 40,000
```

---

## OS-GIVE-03 — OS Difference

Example:

```text
Original Price = 90,000
OS Price = 80,000
```

Expected:

```text
OS Difference = -10,000
```

The UI must label this:

```text
OS Difference
```

not Profit.

---

## OS-GIVE-04 — Original Purchase Preserved

After Give OS, verify original information remains available:

- original item
- original price
- original source
- original batch where applicable
- original costs

---

## OS-GIVE-05 — Additional Costs Preserved

If tax/packing/shipping was already recorded before Give OS:

**Expected**

Those costs remain in the user's history.

---

## OS-GIVE-06 — Give OS Before Arrival

Give a purchase while its tracking status is still active.

**Expected**

OS ownership changes without requiring the item to be Delivered.

---

# 18. Archive Tests

## ARC-01 — Archive Purchase

Archive an existing purchase.

**Expected**

- purchase disappears from normal active views
- data remains stored
- historical financial information is not silently destroyed

---

## ARC-02 — Archived Purchase

Verify archived purchase does not appear in normal active purchase counts.

---

# 19. Dashboard Tests

## DASH-01 — Purchase Count

Verify Dashboard counts match actual data.

---

## DASH-02 — Active Batch Count

Verify only relevant Group Order batches are counted.

---

## DASH-03 — Tracking Summary

Verify status summaries reflect current data.

For Group Orders, status comes from batch.

For Direct Sellers, status comes from purchase.

---

## DASH-04 — Outstanding Payment

Create:

```text
Paid
Partial
Unpaid
```

purchases.

**Expected**

Dashboard's outstanding purchase amount equals the sum of remaining purchase payments.

---

## DASH-05 — Attention Items

Create stale batches/purchases.

**Expected**

Dashboard identifies them as needing attention.

---

# 20. Finance Tests

## FIN-01 — Purchase Spending

Verify paid purchase amounts are represented correctly.

---

## FIN-02 — Outstanding Purchases

Verify unpaid/partial purchase balances are represented correctly.

---

## FIN-03 — Additional Costs

Verify additional costs appear separately from purchase price.

---

## FIN-04 — OS Difference

Verify Give OS transactions appear under OS Difference.

---

## FIN-05 — Taken OS

A Taken OS purchase should count as the user's purchase spending based on the amount they paid for the OS.

---

# 21. Image Tests

## IMG-01 — Upload Image

Upload one valid purchase image.

**Expected**

Image is stored and displayed.

---

## IMG-02 — No Image

Create purchase without an image.

**Expected**

Neutral placeholder appears.

---

## IMG-03 — Replace Image

Replace an existing image.

**Expected**

New image is displayed.

---

## IMG-04 — Remove Image

Remove an image.

**Expected**

Purchase remains valid and displays placeholder.

---

# 22. Search and Filter Tests

## SEARCH-01 — Item Search

Search by item name.

**Expected**

Matching purchases appear.

---

## SEARCH-02 — Artist Search

Search by artist/group.

**Expected**

Matching purchases appear.

---

## SEARCH-03 — Source Search

Search by source.

**Expected**

Matching purchases appear.

---

## SEARCH-04 — Batch Search

Search by batch number.

**Expected**

Relevant purchases appear.

---

## FILTER-01 — Active

Verify only active purchases appear.

---

## FILTER-02 — Delivered

Verify delivered purchases appear.

---

## FILTER-03 — OS

Verify Given OS and Taken OS purchases are represented correctly.

---

## FILTER-04 — Combined Filters

Apply multiple filters.

**Expected**

Results satisfy all selected filters.

---

## FILTER-05 — Clear Filters

**Expected**

Full result set returns.

---

# 23. Navigation Tests

Verify:

```text
Dashboard → Purchases
Purchases → Purchase Detail
Purchase → Batch
Batch → Purchase
Dashboard → Finance
```

Back navigation should preserve useful context where practical.

---

# 24. Responsive Tests

Test core screens at:

```text
Mobile
Tablet
Desktop
```

At minimum verify:

- Dashboard
- Purchase List
- Purchase Detail
- Add Purchase
- Batch Detail
- Finance

Check for:

- horizontal overflow
- clipped text
- unusable buttons
- broken forms
- overlapping navigation
- inaccessible dialogs
- unreadable status badges

---

# 25. Long Data Tests

Use deliberately long values:

```text
Very Long Group Order Source Name
Very Long Artist / Group Name
Very Long Item Name
Very Long Notes
```

Expected:

- layout remains intact
- text wraps or truncates appropriately
- actions remain accessible

---

# 26. Empty State Tests

Test a new account with no data.

Verify:

```text
Dashboard
Purchases
Batches
Finance
```

all have useful empty states.

Also test:

```text
Search with no result
Filter with no result
```

These should not be confused with a brand-new account.

---

# 27. Error / Recovery Tests

Simulate or reproduce:

- network failure
- database error
- failed image upload
- invalid form submission
- expired session

Expected:

- useful error message
- no misleading success state
- entered information is preserved where practical
- user can retry safely

---

# 28. Duplicate Submission Test

Slow or double-click:

```text
Save Purchase
```

**Expected**

Only one purchase is created.

This is especially important for mobile/network conditions.

---

# 29. Data Integrity Tests

Verify the following invariants:

### Purchase

```text
user_id matches owner
source belongs to user
batch belongs to user
```

### Group Order

```text
source.type = GROUP_ORDER
batch is required
```

### Direct Seller

```text
source.type = DIRECT_SELLER
batch_id = null
country is required
```

### Payment

```text
0 <= paid_amount <= price
```

### OS

```text
os_paid_amount <= os_price
```

when OS price is present.

---

# 30. Regression Checklist

After every meaningful change, manually verify:

```text
[ ] Login
[ ] Dashboard loads
[ ] Add Group Order purchase
[ ] Add Direct Seller purchase
[ ] Payment calculation
[ ] Batch status update
[ ] Direct Seller status update
[ ] Add additional cost
[ ] Take OS
[ ] Give OS
[ ] Purchase search/filter
[ ] Finance totals
[ ] Mobile layout
```

---

# 31. Pre-Release Acceptance

The MVP is release-ready when:

1. Authentication works.
2. RLS prevents cross-user data access.
3. Group Order purchases correctly require a batch.
4. Direct Seller purchases do not create/use batches.
5. Group Order tracking is batch-level.
6. Direct Seller tracking is purchase-level.
7. Payment status and remaining amounts are correct.
8. Additional costs can be recorded.
9. Give OS preserves purchase history.
10. Take OS creates the correct purchase origin.
11. OS payment calculations are correct.
12. Dashboard totals are correct.
13. Finance totals are correct.
14. Stale tracking is displayed correctly.
15. Search and filters work.
16. Image upload works or fails gracefully.
17. Mobile core flows are usable.
18. No critical data integrity issues remain.
19. No critical console/runtime errors remain.
20. The complete core loop can be performed by a real test user.

---

# 32. Manual User Acceptance Test

Before public release, perform one realistic session as a collector.

Simulate:

```text
1. Create several sources
2. Create China/Korea/Japan GOs
3. Create multiple batches
4. Add several purchases to the same batch
5. Add Direct Seller purchases
6. Use Paid/Partial/Unpaid
7. Update batch tracking
8. Update Direct Seller tracking
9. Add tax
10. Add packing/domestic shipping
11. Take OS
12. Give OS
13. Search for an old purchase
14. Check Finance
15. Check Dashboard
16. Use the app on mobile
```

The test should answer:

> Does this actually feel easier than maintaining the spreadsheet/notes workflow it replaces?

If the answer is no, prioritize UX changes before adding more features.

---

# 33. Bug Severity

Use four levels.

### P0 — Blocker

Examples:

- cannot log in
- data from another user is visible
- purchases can be lost
- critical database corruption

Must be fixed before release.

### P1 — Critical

Examples:

- Add Purchase fails
- Group Order tracking updates the wrong purchases
- payment totals are incorrect
- Give/Take OS corrupts ownership state

Must be fixed before release.

### P2 — Major

Examples:

- broken mobile layout on an important screen
- search/filter partially broken
- image upload unreliable

Should be fixed before or immediately after MVP launch.

### P3 — Minor

Examples:

- spacing issue
- minor copy problem
- non-critical visual inconsistency

Can be fixed after launch.

---

# 34. What Not to Test Yet

Do not build a large QA system around features that do not exist.

No testing is required for:

- courier API integrations
- WhatsApp integration
- LINE integration
- X integration
- automatic warehouse tracking
- automatic tax calculation
- OS marketplace
- multi-user ownership transfer
- payment gateway
- AI features
- tracking event history

These are outside the MVP.

---

# 35. Testing Priority

If time is limited, test in this order:

```text
P0
Authentication + RLS
        ↓
P1
Add Purchase
        ↓
P1
Group Order vs Direct Seller behavior
        ↓
P1
Tracking
        ↓
P1
Payment calculations
        ↓
P1
Give / Take OS
        ↓
P2
Additional Costs
        ↓
P2
Dashboard / Finance
        ↓
P2
Search / Filters
        ↓
P2
Responsive UX
        ↓
P3
Visual polish
```

The product should never sacrifice data correctness for visual polish.

---

# 36. Source of Truth

Documentation hierarchy:

```text
PRD.md
   ↓
DATA_MODEL.md
   ↓
UX_SPEC.md
   ↓
DESIGN_SYSTEM.md
   ↓
TEST_PLAN.md
   ↓
Implementation
```

If implementation behavior conflicts with this test plan, determine whether:

1. the implementation is wrong, or
2. the product documentation needs an intentional update.

Do not silently change expected product behavior.

---

# 37. Next Document

After this document, create:

```text
CLAUDE.md
```

`CLAUDE.md` will act as the implementation instruction layer for Claude.

It should tell Claude:

- what the product is
- what documents are authoritative
- the technical stack
- the core architecture rules
- the MVP non-goals
- the critical product rules
- how to work with the existing codebase
- how to implement vertical slices
- when to ask instead of inventing behavior
- how to validate changes before finishing
