# UX Specification
## K-pop Purchase & Shipment Tracker

**Status:** Draft v1.0  
**Related documents:** `docs/PRD.md`, `docs/DATA_MODEL.md`

---

# 1. Purpose

This document defines how users interact with the MVP.

It describes:

- navigation
- screen responsibilities
- primary user flows
- interaction behavior
- form behavior
- states
- responsive behavior
- UX rules

It does not define visual styling such as colors, typography, shadows, or exact component styling. Those belong in `DESIGN_SYSTEM.md`.

The UX must follow the product behavior defined in `PRD.md` and the relationships defined in `DATA_MODEL.md`.

---

# 2. UX Goals

The application should feel:

- fast
- simple
- organized
- personal
- easy to scan
- low-maintenance

The primary UX goal is:

> Recording and checking purchases should feel easier than maintaining a spreadsheet.

---

# 3. Primary Navigation

The MVP has four primary destinations:

```text
Dashboard
Purchases
Batches
Finance
```

There should also be a prominent global action:

```text
+ Add Purchase
```

Recommended navigation structure:

```text
┌───────────────────────────────┐
│ Logo / App Name               │
│                               │
│ Dashboard                     │
│ Purchases                     │
│ Batches                       │
│ Finance                       │
│                               │
│ + Add Purchase                │
│                               │
│ Settings / Account            │
└───────────────────────────────┘
```

On mobile, primary navigation may become a bottom navigation bar.

The Add Purchase action should remain easy to access.

---

# 4. Dashboard

## Purpose

The Dashboard is the user's overview.

It should answer:

1. What do I currently have?
2. Where are my purchases?
3. How much money is involved?
4. What needs attention?

The Dashboard is not a complete purchase table.

---

## 4.1 Dashboard Sections

Recommended sections:

### Overview

Show high-level counts such as:

- Active purchases
- Active batches
- Delivered purchases

### Tracking Overview

Show purchases/batches grouped by status.

Example:

```text
Purchased       5
Warehouse       8
In Transit      12
Indonesia        4
Admin Received   3
Delivered       10
```

The system should distinguish:

- Group Order status counts from batches
- Direct Seller status counts from purchases

The UI may present them together as an overall overview.

---

### Finance Overview

Show:

```text
Spent
Rp3.250.000

To Pay
Rp450.000

Additional Costs
Rp280.000
```

Exact financial definitions are determined by the data model and should remain consistent across Dashboard and Finance.

---

### Needs Attention

Potential sections:

```text
No updates recently
Outstanding payments
```

Examples:

```text
3 batches haven't been updated recently
5 purchases have outstanding payments
```

For Direct Sellers, stale purchases may also appear here.

---

# 5. Dashboard Interaction

Clicking a summary item should take the user to the relevant detailed view.

Examples:

```text
"In Transit: 12"
→ Purchases filtered by In Transit

"3 stale batches"
→ Batches filtered to stale batches

"To Pay: Rp450.000"
→ Purchases with outstanding payment
```

The dashboard should not require users to manually recreate filters.

---

# 6. Purchase List

## Purpose

The Purchase List is the main place to browse individual purchases.

Each purchase card/row should provide enough information to understand the item without opening the detail page.

Recommended information:

```text
[Image]

Item Name
Artist / Group

Source · Country
Batch 42                 ← only for Group Order

Price
Payment Status

Tracking Status
OS indicator if applicable
```

---

# 7. Purchase List Filters

Primary filter:

```text
All
Active
Delivered
OS
```

Additional filters may include:

```text
Country
Source
Tracking Status
Payment Status
```

Filters should be simple.

Avoid exposing every possible filter simultaneously.

The UI should prioritize the most useful filters and allow secondary filters through a filter control.

---

# 8. Purchase Search

The user should be able to search purchases.

Search should support common text such as:

- item name
- artist/group
- source name
- batch number

Search should feel immediate and should not require a complex search form.

---

# 9. Purchase Sorting

Recommended default:

```text
Newest purchase first
```

Other useful sorting options may include:

- Oldest
- Price high → low
- Price low → high
- Recently updated

Do not expose unnecessary sorting options in the first version.

---

# 10. Purchase Detail

## Purpose

Purchase Detail is the complete view of one purchase.

Recommended structure:

```text
[Purchase Image]

Item Name
Artist / Group

Price
Paid
Remaining
Payment Status

Source
Country
Batch (if Group Order)

Current Status
Last Updated

Additional Costs

OS Information (if applicable)

Notes
```

---

# 11. Purchase Detail Actions

Primary actions:

```text
Edit Purchase
Add Cost
Update Tracking
Give OS
```

Conditional:

```text
View Batch
```

is shown only for Group Order purchases.

A Direct Seller purchase does not show a Batch section or View Batch action.

---

# 12. Add Purchase

Add Purchase is the most important interaction in the application.

The flow must be optimized for repeated use.

The entry point is:

```text
+ Add Purchase
```

---

# 13. Add Purchase — Step 1

The user first chooses:

```text
New Purchase
Take OS
```

These are two different acquisition flows but share most of the form structure.

---

# 14. Add Purchase — Source

After choosing New Purchase or Take OS:

```text
Select Source
```

The user can:

- select an existing source
- create a new source

The source selection should clearly show:

```text
GO A
Group Order · WhatsApp

Seller Jane
Direct Seller · X
```

The source type should be visible.

---

# 15. Add Purchase — Source Creation

Selecting:

```text
+ Create Source
```

opens an inline form/modal.

Required:

```text
Name
Source Type
Platform
```

Example:

```text
Name: GO A
Type: Group Order
Platform: WhatsApp
```

The user should return to the purchase flow after saving.

The user should not lose any already-entered purchase data.

---

# 16. Add Purchase — Country

After selecting the source:

### Group Order

```text
Select Country
```

Then:

```text
Select Batch
```

### Direct Seller

```text
Select Country
```

Then proceed directly to:

```text
Purchase Details
```

Country options:

```text
China
Korea
Japan
Thailand
Singapore
Indonesia
```

---

# 17. Add Purchase — Group Order Batch

For Group Order sources:

```text
Select Batch
```

The list should show batches belonging to the selected:

```text
Source + Country
```

Example:

```text
GO A · China

Batch 42
5 purchases
In Transit

Batch 43
3 purchases
Warehouse

Batch 44
2 purchases
Purchased
```

The user can:

```text
+ Create Batch
```

without leaving the purchase flow.

---

# 18. Add Purchase — Create Batch

Required:

```text
Batch Number
Batch Date
```

Source and country are already selected and should not need to be entered again.

Example:

```text
Source: GO A
Country: China

Batch Number: 42
Batch Date: 12 Sep 2026
```

After creation, the newly created batch should automatically become selected.

---

# 19. Add Purchase — Purchase Details

Required:

```text
Item / Member Name
Price
Purchase Date
Paid Amount
```

Optional:

```text
Artist / Group
Image
Notes
```

The purchase date should default to today's date but remain editable.

Paid amount should default to:

```text
0
```

unless another default is chosen later.

---

# 20. Add Purchase — Tracking

### Group Order

Tracking is inherited from the selected batch.

The purchase form does not ask the user for a tracking status.

### Direct Seller

The purchase must have its own tracking status.

Recommended default:

```text
PURCHASED
```

The user may change it when necessary.

---

# 21. Add Purchase — Payment Preview

While entering payment data, show:

```text
Price:       Rp90.000
Paid:        Rp45.000
Remaining:   Rp45.000
Status:      Partial
```

The remaining amount and payment status should update immediately as the paid amount changes.

The user should not manually enter remaining amount or payment status.

---

# 22. Add Purchase — Save

Primary action:

```text
Save Purchase
```

After successful save:

- show confirmation
- return to an appropriate location
- make it easy to add another purchase

Recommended behavior:

```text
Purchase saved ✓

[View Purchase]   [Add Another]
```

For repeated entry, `Add Another` should preserve useful context where possible.

Example:

If the user just added:

```text
GO A → China → Batch 42
```

the next purchase can default to:

```text
GO A
China
Batch 42
```

The user can change it if necessary.

---

# 23. Add Another Purchase

This is an important optimization.

After saving a purchase, users frequently add another item to the same batch.

The app should minimize repeated selection.

Example:

```text
Saved:
GO A → China → Batch 42 → Juun PC

Add Another
→ GO A
→ China
→ Batch 42
→ enter item details
```

This should feel significantly faster than starting the entire flow again.

---

# 24. Take OS Flow

Take OS starts from:

```text
+ Add Purchase
→ Take OS
```

Then follows the same source-dependent structure.

### Group Order

```text
Source
→ Country
→ Batch
→ Item Details
→ OS Price / Payment
→ Save
```

### Direct Seller

```text
Source
→ Country
→ Item Details
→ OS Price / Payment
→ Save
```

---

# 25. Take OS — Details

Required:

```text
Item / Member Name
OS Price
Paid Amount
Purchase Date
```

Optional:

```text
Artist / Group
Image
Notes
```

The purchase is created with:

```text
purchase_origin = TAKEN_OS
ownership_status = ACTIVE
```

---

# 26. Take OS — Payment

Show:

```text
OS Price:  Rp85.000
Paid:      Rp40.000
Remaining: Rp45.000
Status:    Partial
```

Payment status is derived.

The user does not manually select Paid/Partial/Unpaid.

---

# 27. Give OS Flow

Give OS is initiated from Purchase Detail:

```text
Purchase Detail
→ Give OS
```

The app should show the existing purchase information.

The user enters:

```text
OS Price
OS Paid Amount
OS Date
OS Notes
```

The app should display a preview:

```text
Original Price: Rp90.000
OS Price:       Rp80.000
Difference:     -Rp10.000
```

---

# 28. Give OS Confirmation

Before saving:

```text
Give this purchase through OS?

Original price: Rp90.000
OS price:       Rp80.000
Received:       Rp40.000

OS remaining:   Rp40.000
Difference:     -Rp10.000
```

Primary action:

```text
Confirm OS
```

After confirmation:

```text
ownership_status = GIVEN_OS
```

The purchase remains visible in history.

---

# 29. OS After Save

After Give OS:

The Purchase Detail should clearly show:

```text
OS
Given OS

Original price: Rp90.000
OS price: Rp80.000
Received: Rp40.000
Remaining: Rp40.000
Difference: -Rp10.000
```

The original purchase information remains visible.

---

# 30. Batch List

The Batch List contains only Group Order batches.

Direct Seller purchases do not appear here.

Each batch should show:

```text
Source · Country
Batch Number

Purchase count
Current status
Last updated
```

Example:

```text
GO A · China
Batch 42

5 purchases
In Transit
Updated 6 days ago
```

---

# 31. Batch Filters

Useful filters:

```text
All
Purchased
Warehouse
In Transit
Indonesia
Admin Received
Delivered
```

A stale filter may also be useful:

```text
Needs Update
```

---

# 32. Batch Detail

Batch Detail shows:

```text
Source
Country
Batch Number
Batch Date

Current Status
Last Updated

Purchase Count
Total Purchase Value

Purchases
```

Primary action:

```text
Update Status
```

---

# 33. Update Batch Status

The user can change the status:

```text
Purchased
Warehouse
In Transit
Indonesia
Admin Received
Delivered
```

When saved:

```text
batch.status = selected status
batch.last_updated_at = current timestamp
```

All purchases in that batch immediately display the new status.

---

# 34. Direct Seller Tracking

Direct Seller tracking is updated from Purchase Detail.

Example:

```text
Seller Jane
Japan

Mingyu PC

Status:
In Transit

Last updated:
5 days ago
```

The user can change the status directly.

Changing this status must not affect another Direct Seller purchase.

---

# 35. Stale Tracking UX

A stale item should be visually distinguishable but not alarming.

Example:

```text
Batch 42
In Transit

Last update:
14 days ago

No update for 14 days
```

The UI should communicate lack of updates, not claim that the shipment is delayed.

The stale threshold should initially use the agreed MVP default.

---

# 36. Finance

Finance provides a lightweight spending overview.

Recommended sections:

```text
Total Spent
To Pay
Additional Costs
OS Difference
```

The user should be able to understand where money has gone without needing accounting terminology.

---

# 37. Finance Detail

Finance may include simple breakdowns such as:

```text
Purchases
Additional Costs
OS
```

Potential purchase payment breakdown:

```text
Paid
Partial
Unpaid
```

Avoid complex accounting reports.

---

# 38. Additional Cost Flow

From Purchase Detail:

```text
Add Cost
```

Form:

```text
Cost Type
Amount
Paid
Notes
```

Cost types:

```text
Tax
Packing
Domestic Shipping
Other
```

After saving, the cost appears in Purchase Detail and Finance.

---

# 39. Edit Purchase

The user can edit purchase information.

Editable fields may include:

- item name
- artist/group
- price
- paid amount
- purchase date
- image
- notes
- source
- country
- batch where applicable

Changing source/batch should be handled carefully because it changes the purchase relationship.

The application should warn before moving a purchase to another batch if the operation materially changes tracking context.

---

# 40. Moving a Purchase

For MVP, moving purchases between source/batch contexts should be supported only through the Edit flow if implementation remains simple.

Rules:

### Group Order → Group Order

Allowed if the selected batch belongs to a Group Order source.

### Direct Seller → Direct Seller

Allowed.

### Group Order → Direct Seller

Allowed only if the user intentionally changes the source type and the resulting structure is valid.

### Direct Seller → Group Order

Allowed only if the user selects a valid Group Order batch.

The application must not leave invalid relationships such as:

```text
Direct Seller + batch_id
```

or:

```text
Group Order + no batch
```

---

# 41. Delete / Archive UX

Preferred MVP behavior:

```text
Archive Purchase
```

rather than immediate permanent deletion.

Archived purchases should disappear from normal active lists.

The user may have access to an archived/history view later if needed.

The UI should avoid making destructive deletion easy to trigger accidentally.

---

# 42. Empty States

Every main screen needs a useful empty state.

## Dashboard

```text
No purchases yet.

Add your first purchase to start tracking your collection.

[Add Purchase]
```

## Purchases

```text
No purchases found.

[Add Purchase]
```

## Batches

```text
No Group Order batches yet.

Create a Group Order purchase to get started.
```

## Finance

```text
No financial data yet.

Your spending summary will appear here after adding purchases.
```

---

# 43. Empty Search Results

When filters/search return nothing:

```text
No purchases match your filters.
```

Provide:

```text
Clear Filters
```

Do not show the same empty state used for a brand-new account.

---

# 44. Loading States

Use lightweight loading states.

Examples:

```text
Skeleton cards
Skeleton rows
Loading spinner for small actions
```

Avoid full-screen loading for small operations.

For save/update actions:

```text
Saving...
```

The submit button should be disabled while the request is in progress.

---

# 45. Error States

Errors should be understandable.

Avoid technical messages such as:

```text
Foreign key constraint violation
```

Instead show:

```text
Couldn't save this purchase.
Please check the information and try again.
```

For network/database errors:

```text
Something went wrong.
Please try again.
```

If retry is safe, provide:

```text
Try Again
```

---

# 46. Form Validation

Required fields should be clearly indicated.

Validation should happen before submission where possible.

Examples:

```text
Item name is required.
Price is required.
Paid amount cannot be negative.
Paid amount cannot exceed price.
```

For Group Order:

```text
Batch is required.
```

For Direct Seller:

```text
Batch must not be selected.
Country is required.
```

---

# 47. Currency Input

The primary currency is Indonesian Rupiah.

The UI should display values in a readable format:

```text
Rp90.000
Rp1.250.000
```

Users should enter numeric amounts without manually typing formatting characters where possible.

The database should store monetary values as numeric values, not formatted strings.

---

# 48. Mobile UX

The application must be usable on mobile-sized screens.

Priorities:

- Add Purchase
- Purchase List
- Purchase Detail
- Batch Detail
- Finance summary

Forms should avoid excessive scrolling where possible.

Use:

- bottom sheets
- modals
- compact selectors
- sticky actions

when appropriate.

Do not force desktop-style tables onto mobile.

Purchase and batch lists should use cards or responsive rows when necessary.

---

# 49. Desktop UX

On desktop, the application can use:

- sidebar navigation
- wider list layouts
- two-column detail layouts
- dashboard cards

The interface should still avoid becoming a spreadsheet.

---

# 50. Responsive Behavior

The same product behavior must work across:

```text
Mobile
Tablet
Desktop
```

Responsive changes may affect layout but should not change the underlying workflow.

Example:

```text
Desktop:
Sidebar + Content

Mobile:
Bottom Navigation + Content
```

---

# 51. Notifications / Toasts

Use lightweight feedback for successful actions.

Examples:

```text
Purchase added
Batch updated
Cost added
OS recorded
```

Toasts should not be the only indication of an important state change.

For important changes, the updated content should also be visible immediately.

---

# 52. Confirmation Rules

Do not ask for confirmation for every action.

Confirmation is appropriate for:

- Give OS
- Archive purchase
- potentially moving a purchase between tracking contexts

No confirmation is required for:

- changing a filter
- opening a detail page
- updating a batch status
- adding a normal purchase

---

# 53. Context Preservation

The app should preserve useful context during repeated workflows.

Example:

```text
GO A
China
Batch 42
```

If the user selects:

```text
Add Another
```

those values should remain selected.

However, the user must be able to change them easily.

---

# 54. Navigation Rules

Opening a purchase from a batch:

```text
Batch Detail
→ Purchase Detail
```

The user should be able to return to the same Batch Detail context.

Opening a batch from a purchase:

```text
Purchase Detail
→ Batch Detail
```

The user should be able to return to the purchase.

The application should preserve navigation context where practical.

---

# 55. Source Type Visibility

Source type should always be clear where source is displayed.

Example:

```text
GO A
Group Order · WhatsApp
```

```text
Seller Jane
Direct Seller · X
```

This helps users understand why one purchase has a batch and another does not.

---

# 56. Batch Visibility Rules

Batch information appears only when relevant.

### Group Order purchase

Show:

```text
Batch 42
```

### Direct Seller purchase

Do not show:

```text
Batch
```

Do not show empty placeholders such as:

```text
Batch: —
```

The UI should simply omit the concept.

---

# 57. Tracking Visibility Rules

### Group Order

Display:

```text
Batch status
```

### Direct Seller

Display:

```text
Purchase status
```

The UI can use the same visual component for status, but the underlying data source is different.

---

# 58. OS Visibility Rules

For normal active purchase:

```text
No OS indicator
```

For Give OS:

```text
OS
Given OS
```

For Take OS:

```text
OS
Taken OS
```

The purchase should remain visible in normal history.

---

# 59. Finance Visibility Rules

Finance should distinguish between:

```text
Purchase spending
Additional costs
OS differences
Outstanding amounts
```

Do not label OS difference as profit.

Use:

```text
OS Difference
```

---

# 60. Accessibility

The MVP should support basic accessibility:

- readable text
- sufficient touch target sizes
- keyboard navigation on desktop
- visible focus states
- labels for form controls
- meaningful button text
- alt text for purchase images where appropriate

Accessibility should not require a separate complex design system.

---

# 61. UX Anti-Patterns

Do NOT:

- force Direct Seller purchases into batches
- ask for tracking status for a Group Order purchase
- ask users to manually enter remaining payment
- ask users to manually select payment status
- require artist setup before adding a purchase
- require OS buyer accounts
- require warehouse photos
- expose unnecessary database concepts
- make the main interface look like a spreadsheet
- require users to configure the app before their first purchase

---

# 62. Primary User Flows Summary

## New Group Order Purchase

```text
Add Purchase
→ New Purchase
→ Source
→ Country
→ Batch
→ Purchase Details
→ Save
```

## New Direct Seller Purchase

```text
Add Purchase
→ New Purchase
→ Source
→ Country
→ Purchase Details
→ Save
```

## Take OS from Group Order

```text
Add Purchase
→ Take OS
→ Source
→ Country
→ Batch
→ Purchase Details
→ OS Payment
→ Save
```

## Take OS from Direct Seller

```text
Add Purchase
→ Take OS
→ Source
→ Country
→ Purchase Details
→ OS Payment
→ Save
```

## Give OS

```text
Purchase Detail
→ Give OS
→ Enter OS Details
→ Confirm
```

## Update Group Order

```text
Batch Detail
→ Update Status
→ Save
→ All purchases reflect new status
```

## Update Direct Seller

```text
Purchase Detail
→ Update Status
→ Save
→ Only this purchase changes
```

## Add Additional Cost

```text
Purchase Detail
→ Add Cost
→ Enter Cost
→ Save
```

---

# 63. UX Acceptance Criteria

The MVP UX is acceptable when:

1. A new user can understand the purpose of the app without instructions.
2. A user can add a Group Order purchase without creating unnecessary data.
3. A user can add a Direct Seller purchase without seeing a batch step.
4. A user can add another item to an existing batch quickly.
5. A user can take OS through the same main Add Purchase entry point.
6. A user can give OS from Purchase Detail.
7. A user can update a Group Order batch and see all associated purchases update.
8. A user can update a Direct Seller purchase independently.
9. A user can see outstanding payments without manually calculating them.
10. A user can see stale tracking information.
11. A user can record additional costs.
12. A user can understand OS history without losing the original purchase.
13. The Dashboard provides useful information without becoming a spreadsheet.
14. The main flows work on mobile and desktop.
15. Empty, loading, validation, and error states are handled.
16. The UI does not expose implementation/database concepts unnecessarily.

---

# 64. Source of Truth

The documentation hierarchy is:

```text
PRD.md
   ↓
DATA_MODEL.md
   ↓
UX_SPEC.md
   ↓
DESIGN_SYSTEM.md
   ↓
STITCH
   ↓
Implementation
```

This document defines user experience and interaction behavior.

It does not override product requirements or data relationships.

If a design or implementation conflicts with this document, the conflict must be resolved before implementation.

---

# 65. Next Document

After this document is approved, create:

```text
docs/DESIGN_SYSTEM.md
```

The Design System should define:

- visual direction
- color system
- typography
- spacing
- border radius
- elevation
- icons
- buttons
- inputs
- cards
- badges
- status indicators
- navigation
- tables/lists
- modals
- bottom sheets
- empty states
- responsive design tokens

The Design System should remain consistent with the UX flows defined here.
