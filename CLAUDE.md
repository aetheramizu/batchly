@AGENTS.md

# CLAUDE.md
## K-pop Purchase & Shipment Tracker

This file contains the implementation rules for Claude working on this project.

---

# 1. Project Context

This is a responsive web application for K-pop collectors.

The core problem:

> Collectors buy many K-pop items through Group Orders (GOs) and Direct Sellers and need one simple place to remember what they bought, where it is, how much they have paid, and what they still need to pay.

The product replaces messy spreadsheets and notes with a lightweight personal purchase tracker.

The product is intentionally an MVP.

Do not turn it into a marketplace, logistics platform, accounting system, or social application.

---

# 2. Authoritative Documentation

Before implementing product functionality, read:

```text
/docs/PRD.md
/docs/DATA_MODEL.md
/docs/UX_SPEC.md
/docs/DESIGN_SYSTEM.md
/docs/TEST_PLAN.md
```

These documents are the source of truth.

Use this priority when resolving conflicts:

```text
PRD
↓
DATA_MODEL
↓
UX_SPEC
↓
DESIGN_SYSTEM
↓
TEST_PLAN
↓
Implementation
```

If implementation details conflict with product behavior, do not silently choose a new behavior.

If the conflict materially affects the product, stop and ask.

---

# 3. Core Product Rule

The app has two fundamentally different source types:

```text
GROUP_ORDER
DIRECT_SELLER
```

The distinction is critical.

---

# 4. Group Order Rules

A Group Order purchase belongs to:

```text
Source
→ Country
→ Batch
→ Purchase
```

A Group Order always uses a batch.

Tracking is batch-level.

Example:

```text
GO A
China
Batch 42

├── Juun PC
├── Ian PC
└── Soobin PC

Status: In Transit
```

Changing Batch 42's tracking status changes the displayed tracking status of all purchases in that batch.

Do not create separate tracking status for each Group Order purchase.

---

# 5. Direct Seller Rules

A Direct Seller purchase belongs to:

```text
Source
→ Country
→ Purchase
```

Direct Seller purchases do NOT use batches.

Do not create artificial batches for Direct Sellers.

Tracking is purchase-level.

Example:

```text
Seller Jane
Japan

Purchase A → In Transit
Purchase B → Purchased
```

Changing Purchase A must not affect Purchase B.

---

# 6. Source Rules

A Source represents the seller/order source.

Fields include:

```text
name
type
platform
```

Source type:

```text
GROUP_ORDER
DIRECT_SELLER
```

Platform is independent from source type.

For example:

```text
Group Order + WhatsApp
Group Order + LINE
Group Order + X
Direct Seller + X
Direct Seller + WhatsApp
```

Do not assume X means Direct Seller.

Do not assume WhatsApp or LINE means Group Order.

Source type must come from the stored source record.

---

# 7. Batch Rules

Batches exist only for Group Orders.

Recommended uniqueness:

```text
(user_id, source_id, country, batch_number)
```

Batch number is NOT globally unique.

This is valid:

```text
GO A → China → Batch 42
GO B → Korea → Batch 42
```

Do not use batch number alone as an identifier.

A batch must belong to a Group Order source.

---

# 8. Purchase Rules

Each individual item/slot is one purchase record.

Example:

```text
Juun PC = one purchase
Ian PC = one purchase
```

Both can belong to the same batch.

Do not create unnecessary product/member tables for the MVP.

Artist/group is free text.

Quantity is not required for the MVP.

---

# 9. Purchase Fields

The purchase model includes:

```text
id
user_id
source_id
batch_id nullable
country where applicable
item_name
artist_group nullable
price
paid_amount
purchase_date
purchase_origin
ownership_status
tracking_status where applicable
last_updated_at where applicable
image_url nullable
notes nullable
os_price nullable
os_paid_amount nullable
os_date nullable
os_notes nullable
archived_at nullable
created_at
updated_at
```

Follow `/docs/DATA_MODEL.md` if exact schema details differ.

---

# 10. Payment Rules

Do not store redundant payment status if it can be derived.

Purchase payment status:

```text
paid_amount <= 0
→ UNPAID

paid_amount < price
→ PARTIAL

paid_amount >= price
→ PAID
```

MVP constraint:

```text
0 <= paid_amount <= price
```

Remaining:

```text
remaining = price - paid_amount
```

The user should not manually enter:

```text
remaining
payment_status
```

The application derives them.

---

# 11. OS Rules

There are two OS concepts.

## Take OS

The user takes over someone else's purchase/slot.

It creates a purchase belonging to the current user:

```text
purchase_origin = TAKEN_OS
ownership_status = ACTIVE
```

The amount the user pays for the OS is the purchase's price.

No cross-user ownership system is required.

Do not create:

- buyer accounts
- seller accounts
- ownership-transfer entities
- marketplace listings
- offers
- chat

A previous owner can be mentioned in notes if the user wants.

---

## Give OS

The user gives their purchase/slot to another person.

Do not delete the original purchase.

Instead:

```text
ownership_status = GIVEN_OS
```

Record:

```text
os_price
os_paid_amount
os_date
os_notes
```

The original purchase remains in history.

Do not require the new owner's account.

---

# 12. OS Payment Rules

OS payment status is derived the same way:

```text
os_paid_amount <= 0
→ UNPAID

os_paid_amount < os_price
→ PARTIAL

os_paid_amount >= os_price
→ PAID
```

Recommended constraint:

```text
0 <= os_paid_amount <= os_price
```

OS remaining:

```text
os_remaining = os_price - os_paid_amount
```

---

# 13. OS Difference

Use:

```text
OS Difference
```

Never call it:

```text
Profit
```

MVP calculation:

```text
os_difference = os_price - original purchase price
```

Additional costs are not included in this simple OS Difference calculation.

Do not silently change this formula.

---

# 14. Additional Costs

Additional costs are attached to individual purchases.

Types:

```text
TAX
PACKING
DOMESTIC_SHIPPING
OTHER
```

Fields:

```text
purchase_id
type
amount
paid
notes
```

No partial cost payment system is required.

Do not automatically calculate tax.

The user records tax manually.

---

# 15. Archive Rules

Prefer soft archive:

```text
archived_at
```

Do not permanently delete purchase history as part of normal archive behavior.

Archived purchases should be excluded from normal active views.

Historical financial information should not silently disappear.

---

# 16. Tracking Rules

Tracking status options:

```text
PURCHASED
WAREHOUSE
IN_TRANSIT
INDONESIA
ADMIN_RECEIVED
DELIVERED
```

There is no strict state machine.

Users may need to move between statuses manually.

Do not enforce unnecessary transition rules.

---

# 17. Last Updated Rules

For Group Orders:

```text
batch.last_updated_at
```

changes when batch tracking status changes.

For Direct Sellers:

```text
purchase.last_updated_at
```

changes when purchase tracking status changes.

Editing unrelated information should not falsely count as a tracking update.

---

# 18. Stale Tracking

Initial stale threshold:

```text
14 days
```

A stale indicator means:

> No recent tracking update has been recorded.

It does NOT mean:

- shipment is lost
- shipment is delayed
- admin is inactive
- courier has a problem

Do not make claims the data cannot support.

Delivered items should not be marked stale.

---

# 19. Country Rules

Initial country options:

```text
China
Korea
Japan
Thailand
Singapore
Indonesia
```

If the product later requires additional countries, update the relevant documentation before expanding behavior.

---

# 20. Authentication & Security

Use Supabase Auth.

Every user's data must be isolated.

RLS is mandatory.

Do not rely only on frontend filtering.

A user must only be able to access their own:

```text
sources
batches
purchases
additional costs
```

Also prevent cross-user references such as:

```text
User A purchase → User B batch
User A purchase → User B source
```

Test these rules against the database, not just the UI.

Never expose service-role credentials in client-side code.

---

# 21. Storage

Purchase images use Supabase Storage.

Recommended path:

```text
purchase-images/<user_id>/<purchase_id>/image
```

Only one image is required for the MVP.

Image upload is optional.

The UI must still work when no image exists.

---

# 22. Technical Stack

The intended stack is:

```text
Next.js
Supabase
```

Use the project's existing TypeScript/framework configuration rather than introducing a competing stack.

Do not replace major technologies without an explicit reason.

Use the project's existing styling/component conventions if they already exist.

---

# 23. Implementation Philosophy

Prefer:

```text
Simple
Explicit
Maintainable
Boring
Reliable
```

over:

```text
Over-engineered
Highly abstracted
Prematurely generalized
```

Do not create abstractions merely because they might be useful later.

---

# 24. No Silent Product Decisions

Do not invent product behavior for ambiguous requirements.

If an ambiguity is:

### Low impact

Choose the simplest reasonable implementation.

### Product-impacting

Ask before implementing.

Examples of product-impacting ambiguity:

- changing how OS Difference is calculated
- adding a new purchase type
- changing Group Order tracking from batch-level
- introducing Direct Seller batches
- adding automatic tax
- changing payment rules
- introducing cross-user ownership

---

# 25. MVP Non-Goals

Do NOT implement unless explicitly requested:

```text
Automatic courier tracking
Courier APIs
WhatsApp integration
LINE integration
X integration
Automatic warehouse tracking
Automatic tax calculation
Tracking event history
GO admin portal
Warehouse proof photo system
OS marketplace
Multi-user ownership transfer
Payment gateway
AI features
Social/community features
Complex accounting
Debt management system
Artist/member database
```

Do not build infrastructure for these features just because they might exist in a future version.

---

# 26. Vertical Slice Development

Do not build the entire frontend first and backend later.

Implement end-to-end vertical slices.

Recommended order:

```text
1. Foundation
2. Purchase Management
3. Tracking
4. Finance
5. OS
6. Polish + Testing
```

Each slice should work through:

```text
UI
→ validation
→ server/backend
→ database
→ security
→ feedback
```

---

# 27. Goal 1 — Foundation

Implement:

- Next.js foundation
- Supabase connection
- Auth
- database schema
- RLS
- Storage
- base layout
- navigation
- design tokens/components required by the first slice

Do not build every screen before testing the foundation.

---

# 28. Goal 2 — Purchase Management

Implement:

```text
Add Purchase
Edit Purchase
Purchase List
Purchase Detail
Source creation
Batch creation
Payment calculation
Image upload
Notes
```

Must support:

```text
New Group Order Purchase
New Direct Seller Purchase
```

and correctly branch the workflow.

---

# 29. Goal 3 — Tracking

Implement:

```text
Batch List
Batch Detail
Batch status update
Direct Seller purchase status update
Last updated
Stale indicator
```

Critical rule:

```text
Group Order = batch-level tracking
Direct Seller = purchase-level tracking
```

---

# 30. Goal 4 — Finance

Implement:

```text
Dashboard financial summary
Finance page
Additional costs
Outstanding payments
```

Keep finance lightweight.

Do not turn it into accounting software.

---

# 31. Goal 5 — OS

Implement:

```text
Take OS
Give OS
OS payment
OS Difference
OS history
```

Preserve original purchase history.

---

# 32. Goal 6 — Polish and Testing

Before considering the MVP complete:

- fix responsive issues
- verify empty states
- verify loading states
- verify error states
- verify RLS
- verify payment calculations
- verify tracking behavior
- verify OS behavior
- verify finance calculations
- seed realistic data
- run the critical test plan

---

# 33. Seed Data

Use realistic development data.

Target:

```text
8+ sources
15+ batches
40–60 purchases
```

Include multiple:

```text
countries
sources
batch numbers
tracking statuses
payment states
OS states
additional costs
```

Include stale tracking examples.

Do not use fake complexity just to make the database look large.

---

# 34. UI Rules

Follow `UX_SPEC.md` and `DESIGN_SYSTEM.md`.

Important rules:

- Add Purchase must be easy to find.
- Direct Seller must not show batch UI.
- Group Order must show batch UI.
- Group Order tracking comes from the batch.
- Direct Seller tracking belongs to the purchase.
- Payment status is derived.
- Remaining payment is derived.
- OS Difference is labeled correctly.
- Dashboard is a summary, not a spreadsheet.
- Mobile must support the core flows.

---

# 35. Component Philosophy

Create reusable components when the same concept appears repeatedly.

Good reusable components include:

```text
StatusBadge
PaymentStatus
PurchaseCard
BatchCard
MoneyDisplay
SourceSelector
BatchSelector
EmptyState
ConfirmDialog
```

Do not create a component abstraction for every small piece of markup.

Prefer readable code over abstraction for abstraction's sake.

---

# 36. Data Fetching

Keep data fetching close to the feature that needs it unless there is a clear reason to centralize it.

Avoid creating a giant global data layer for a small MVP.

Use server-side capabilities where appropriate for protected data and Supabase access.

Do not expose sensitive credentials to the browser.

---

# 37. Validation

Validate important rules in more than one layer when appropriate.

Frontend validation improves UX.

Backend/database validation protects data integrity.

Never assume frontend validation is sufficient.

Critical examples:

```text
paid_amount >= 0
paid_amount <= price
```

and:

```text
Group Order → batch required
Direct Seller → batch null
```

---

# 38. Error Handling

Never expose raw database errors to normal users.

Bad:

```text
23503 foreign_key_violation
```

Good:

```text
Couldn't save this purchase.
Please check the selected source or batch and try again.
```

Keep detailed technical information available in logs/development tools where appropriate.

---

# 39. Loading and Mutation States

Every important asynchronous action should have a visible state.

Examples:

```text
Saving...
Uploading...
Updating...
```

Prevent accidental duplicate submissions.

A double-click on Save must not create duplicate purchases.

---

# 40. Navigation and UX

Follow `UX_SPEC.md`.

Preserve useful context.

Example:

```text
Batch Detail
→ Purchase Detail
→ Back
→ same Batch Detail context
```

Repeated purchase entry should preserve useful context:

```text
Source
Country
Batch
```

when adding another purchase.

---

# 41. Design Implementation

The approved design from Stitch is a visual reference.

Do not let Stitch override:

```text
product rules
database rules
UX behavior
security
```

If the Stitch design conflicts with the docs, implement the product behavior and adapt the visual design.

Do not copy unnecessary visual complexity from generated designs.

---

# 42. Testing Before Completion

Before marking a feature complete:

1. Run the relevant tests.
2. Manually exercise the critical flow.
3. Check mobile layout.
4. Check loading/error states.
5. Check database behavior.
6. Check RLS where applicable.
7. Check that unrelated data was not affected.

For core features, refer to `TEST_PLAN.md`.

---

# 43. Definition of Done

A feature is not done merely because the UI renders.

It is done when:

```text
[ ] UI implemented
[ ] Correct validation
[ ] Correct backend behavior
[ ] Correct database behavior
[ ] RLS/security considered
[ ] Loading state handled
[ ] Error state handled
[ ] Mobile checked
[ ] Critical tests passed
[ ] No unintended product behavior introduced
```

---

# 44. Before Coding

At the beginning of a substantial task:

1. Read the relevant documentation.
2. Inspect the existing project structure.
3. Identify existing patterns/components.
4. Check whether the requested behavior already exists.
5. Make a concise implementation plan.
6. Identify ambiguities.

Do not rewrite working code unnecessarily.

---

# 45. Before Changing Existing Behavior

If changing an existing feature:

1. Identify the current behavior.
2. Compare it against the docs.
3. Determine whether the current behavior is intentional or a bug.
4. Check affected flows.
5. Update tests where necessary.

Do not break another vertical slice to implement a new one.

---

# 46. Documentation Updates

If implementation reveals a genuine product decision that is missing from the docs:

- stop if the decision materially affects user behavior
- ask for clarification
- update the appropriate documentation after the decision

Do not silently create new product rules in code.

---

# 47. Git / Change Hygiene

Keep changes focused.

Prefer small logical commits such as:

```text
feat: add purchase creation flow
feat: add batch tracking
feat: add finance summary
feat: add give os flow
fix: prevent duplicate purchase submission
fix: enforce direct seller batch rules
```

Avoid giant commits containing unrelated changes.

Do not commit secrets.

---

# 48. Final Rule

The goal is not to build the most sophisticated system.

The goal is to build the simplest reliable product that proves:

> K-pop collectors will use one place to track what they bought, where it is, what they paid, and what happens to it next.

When in doubt:

```text
Check the docs.
Prefer the simplest implementation.
Do not invent product behavior.
Protect user data.
Test the core flow.
```
