# Data Model
## K-pop Purchase & Shipment Tracker

**Status:** Draft v1.0  
**Related document:** `docs/PRD.md`  
**Database:** Supabase PostgreSQL

---

## 1. Purpose

This document defines the data structure required to implement the MVP described in `PRD.md`.

The data model is intentionally simple and must support:

- personal purchase tracking
- Group Order (GO) batches
- Direct Seller purchases
- batch-level tracking for Group Orders
- purchase-level tracking for Direct Sellers
- purchase payments
- additional costs
- Give OS
- Take OS
- purchase history
- user data isolation

The MVP does **not** require separate entities for artists, members, OS buyers, tracking events, couriers, tax rules, or marketplace listings.

---

## 2. Core Domain Model

The application has two purchase structures depending on the source type.

### Group Order

```text
User
└── Source (GROUP_ORDER)
    └── Batch
        └── Purchase
            └── Additional Costs
```

### Direct Seller

```text
User
└── Source (DIRECT_SELLER)
    └── Purchase
        └── Additional Costs
```

### Key rule

> **Direct Seller purchases do not use batches.**

A Direct Seller purchase must never receive an artificial batch.

---

## 3. Entities

The MVP uses five main application entities:

1. `profiles` (optional lightweight profile linked to Supabase Auth)
2. `sources`
3. `batches`
4. `purchases`
5. `additional_costs`

Supabase Auth owns authentication identities through `auth.users`.

No separate tables are required for:

- artists
- groups
- members
- OS buyers
- tracking events
- couriers
- tracking numbers
- tax rules
- payment providers
- OS marketplace listings

---

# 4. `profiles`

A profile table is optional.

If the application does not need any user profile information beyond Supabase Auth, it may be omitted.

If a profile table is used:

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Same ID as `auth.users.id`; primary key |
| `created_at` | TIMESTAMPTZ | Yes | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | Last modification timestamp |

Do not add profile fields unless the product actually needs them.

---

# 5. `sources`

A source represents where a purchase originated.

Examples:

- GO A
- GO B
- Seller Jane

### Schema

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Owner; references `auth.users.id` |
| `name` | TEXT | Yes | Source/GO/seller name |
| `type` | ENUM | Yes | `GROUP_ORDER` or `DIRECT_SELLER` |
| `platform` | TEXT | Yes | e.g. WhatsApp, LINE, X, Other |
| `created_at` | TIMESTAMPTZ | Yes | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | Last modification timestamp |

### Source type

```text
GROUP_ORDER
DIRECT_SELLER
```

The source type determines whether the source can have batches.

### Rules

- A source belongs to exactly one user.
- A source has exactly one type.
- A `GROUP_ORDER` source may have batches.
- A `DIRECT_SELLER` source must not have batches.
- Platform does not determine source type.

For example, both are valid:

```text
GO A
Type: GROUP_ORDER
Platform: X
```

```text
Seller Jane
Type: DIRECT_SELLER
Platform: X
```

---

# 6. Countries

Countries are controlled values and do not require a separate table in the MVP.

Supported values:

```text
CHINA
KOREA
JAPAN
THAILAND
SINGAPORE
INDONESIA
```

The country is stored differently depending on source type:

### Group Order

```text
batches.country
```

### Direct Seller

```text
purchases.country
```

This avoids repeating the same country on every purchase in a Group Order batch.

---

# 7. `batches`

A batch exists **only for Group Order sources**.

### Schema

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Owner; references `auth.users.id` |
| `source_id` | UUID | Yes | References `sources.id` |
| `country` | ENUM/TEXT | Yes | Country of the batch |
| `batch_number` | TEXT | Yes | User-facing batch number |
| `batch_date` | DATE | Yes | Date the batch was created |
| `status` | ENUM | Yes | Current physical tracking status |
| `last_updated_at` | TIMESTAMPTZ | Yes | Last tracking update |
| `notes` | TEXT | No | Optional batch notes |
| `created_at` | TIMESTAMPTZ | Yes | Database creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | Last modification timestamp |

### Batch status

```text
PURCHASED
WAREHOUSE
IN_TRANSIT
INDONESIA
ADMIN_RECEIVED
DELIVERED
```

Statuses do not need to be followed sequentially.

For example:

```text
PURCHASED
→ IN_TRANSIT
→ INDONESIA
→ DELIVERED
```

is valid.

### Batch rules

1. A batch must belong to a `GROUP_ORDER` source.
2. A batch cannot belong to a `DIRECT_SELLER` source.
3. A batch belongs to exactly one source.
4. A batch belongs to exactly one user.
5. Batch number is not globally unique.

---

# 8. Batch Identity

The database primary key is the UUID:

```text
batches.id
```

`batch_number` is only a user-facing identifier.

The same batch number may exist in different contexts:

```text
GO A → China → Batch 42
GO B → Korea → Batch 42
GO B → China → Batch 42
```

These are different batches.

Recommended uniqueness rule:

```text
UNIQUE(user_id, source_id, country, batch_number)
```

This prevents accidental duplicates such as:

```text
GO A → China → Batch 42
GO A → China → Batch 42
```

while allowing the same batch number in other source/country contexts.

---

# 9. `purchases`

A purchase represents one individual item or slot tracked by the user.

Examples:

```text
Juun PC
Ian PC
IVE Album
```

Each is a separate purchase record.

The MVP does not require quantity management.

### Schema

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Owner; references `auth.users.id` |
| `source_id` | UUID | Yes | References `sources.id` |
| `batch_id` | UUID | Conditional | References `batches.id`; required for GO |
| `country` | ENUM/TEXT | Conditional | Required for Direct Seller; null for GO |
| `item_name` | TEXT | Yes | Item/member/slot name |
| `artist_group` | TEXT | No | Free-text artist/group |
| `price` | NUMERIC | Yes | Purchase/OS acquisition price |
| `paid_amount` | NUMERIC | Yes | Amount paid for the purchase |
| `purchase_date` | DATE | Yes | Date purchase was made |
| `purchase_origin` | ENUM | Yes | `NEW` or `TAKEN_OS` |
| `ownership_status` | ENUM | Yes | `ACTIVE` or `GIVEN_OS` |
| `tracking_status` | ENUM | Conditional | Used only for Direct Seller purchases |
| `last_updated_at` | TIMESTAMPTZ | Conditional | Used only for Direct Seller purchases |
| `image_url` | TEXT | No | Supabase Storage image reference |
| `notes` | TEXT | No | Optional notes |
| `os_price` | NUMERIC | No | OS selling/acquisition price when applicable |
| `os_paid_amount` | NUMERIC | No | Amount received from OS buyer |
| `os_date` | DATE | No | Date of OS |
| `os_notes` | TEXT | No | Optional OS-specific notes |
| `archived_at` | TIMESTAMPTZ | No | Soft-delete/archive timestamp |
| `created_at` | TIMESTAMPTZ | Yes | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | Last modification timestamp |

---

# 10. Purchase Structure Rules

A purchase follows one of two structures.

## Group Order Purchase

```text
source.type = GROUP_ORDER
batch_id IS NOT NULL
country IS NULL
tracking_status IS NULL
last_updated_at IS NULL
```

The hierarchy is:

```text
Source
→ Batch
→ Purchase
```

The country comes from the batch.

### Example

```text
GO A
China
Batch 42
└── Juun PC
```

---

## Direct Seller Purchase

```text
source.type = DIRECT_SELLER
batch_id IS NULL
country IS NOT NULL
tracking_status IS NOT NULL
last_updated_at IS NOT NULL
```

The hierarchy is:

```text
Source
→ Purchase
```

### Example

```text
Seller Jane
Japan
└── Mingyu PC
```

No batch is created.

---

# 11. Purchase Tracking

Tracking is source-dependent.

## Group Order

Physical tracking status comes from:

```text
batch.status
```

The purchase does not have an independent tracking status.

The UI should display the batch status for every purchase in that batch.

Example:

```text
Batch 42
Status: IN_TRANSIT

├── Juun PC → IN_TRANSIT
├── Ian PC  → IN_TRANSIT
└── IVE PC  → IN_TRANSIT
```

Updating the batch updates the status shown for all purchases in the batch.

---

## Direct Seller

Because there is no batch, each purchase has its own:

```text
tracking_status
last_updated_at
```

Example:

```text
Seller Jane
Japan

Mingyu PC → DELIVERED
Wonwoo PC → IN_TRANSIT
Album     → PURCHASED
```

Changing one Direct Seller purchase must not affect another purchase from the same source.

---

# 12. Tracking Status Enum

Use the same status vocabulary for both Group Order batches and Direct Seller purchases:

```text
PURCHASED
WAREHOUSE
IN_TRANSIT
INDONESIA
ADMIN_RECEIVED
DELIVERED
```

Not every purchase/batch must use every state.

The MVP does not require a strict state transition system.

---

# 13. Last Update / Stale Tracking

For Group Orders:

```text
batches.last_updated_at
```

For Direct Sellers:

```text
purchases.last_updated_at
```

The application can calculate:

```text
days_since_update =
current_time - last_updated_at
```

This value should not be stored.

The UI may highlight old updates.

Example:

```text
Batch 42
IN_TRANSIT
Last update: 14 days ago
⚠ No update for 14 days
```

The MVP does not predict delays.

---

# 14. Payment Model

Purchase payment uses two stored values:

```text
price
paid_amount
```

Remaining payment is calculated:

```text
remaining_amount = price - paid_amount
```

Do not store `remaining_amount`.

This prevents inconsistent data.

### Example

```text
Price: 90,000
Paid: 45,000
Remaining: 45,000
```

---

# 15. Purchase Payment Status

Payment status is derived.

```text
if paid_amount <= 0
    UNPAID

else if paid_amount < price
    PARTIAL

else
    PAID
```

The database should prevent negative values.

Recommended MVP constraint:

```text
0 <= paid_amount <= price
```

Overpayment is not supported in the MVP.

---

# 16. Purchase Origin

`purchase_origin` describes how the current user acquired the purchase.

Values:

```text
NEW
TAKEN_OS
```

### NEW

The user originally purchased the item from the source.

### TAKEN_OS

The user acquired the item through an OS from another person.

No previous-owner account or relationship is required.

---

# 17. Ownership Status

`ownership_status` describes the current ownership state from the user's perspective.

Values:

```text
ACTIVE
GIVEN_OS
```

### ACTIVE

The user currently owns the purchase.

### GIVEN_OS

The user has given the purchase to someone else through OS.

Physical tracking status is independent of ownership status.

Example:

```text
Tracking: IN_TRANSIT
Ownership: GIVEN_OS
```

is valid.

---

# 18. Give OS

When a user gives an existing purchase through OS:

```text
ownership_status = GIVEN_OS
os_price = entered OS price
os_paid_amount = entered amount
os_date = entered date
os_notes = optional
```

The original purchase remains unchanged where applicable:

```text
price
purchase_date
source_id
batch_id
country
additional costs
```

The purchase must not be deleted.

---

# 19. Take OS

When a user takes an OS:

A new purchase record is created for the current user.

Example:

```text
purchase_origin = TAKEN_OS
ownership_status = ACTIVE
price = OS price
paid_amount = amount paid to previous owner
```

### Group Order Take OS

```text
Source
→ Country
→ Existing/New Batch
→ Purchase
```

### Direct Seller Take OS

```text
Source
→ Country
→ Purchase
```

No cross-user ownership relationship is created.

---

# 20. OS Payment

For Give OS:

```text
os_price
os_paid_amount
```

OS remaining amount is calculated:

```text
os_remaining = os_price - os_paid_amount
```

OS payment status is derived:

```text
if os_paid_amount <= 0
    UNPAID

else if os_paid_amount < os_price
    PARTIAL

else
    PAID
```

Do not store a separate `os_payment_status`.

Recommended constraint:

```text
0 <= os_paid_amount <= os_price
```

when OS data exists.

---

# 21. OS Difference

The MVP calculates:

```text
os_difference = os_price - price
```

Example:

```text
Original price: 90,000
OS price:       80,000

OS difference: -10,000
```

This is a simple difference, not accounting profit.

Additional costs are not included in this calculation.

---

# 22. Additional Costs

Additional costs represent expenses associated with a purchase.

Examples:

- Tax
- Packing
- Domestic Shipping
- Other

### Schema

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | UUID | Yes | Owner; references `auth.users.id` |
| `purchase_id` | UUID | Yes | References `purchases.id` |
| `type` | ENUM/TEXT | Yes | Cost category |
| `amount` | NUMERIC | Yes | Cost amount |
| `paid` | BOOLEAN | Yes | Whether the cost has been paid |
| `notes` | TEXT | No | Optional notes |
| `created_at` | TIMESTAMPTZ | Yes | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | Last modification timestamp |

### Cost types

```text
TAX
PACKING
DOMESTIC_SHIPPING
OTHER
```

Amounts must not be negative.

---

# 23. Additional Cost Payment

The MVP only tracks whether an additional cost has been paid.

```text
paid BOOLEAN
```

Partial payment of an additional cost is not supported in the MVP.

This can be added later if real users need it.

---

# 24. Additional Cost History

Additional costs remain associated with the purchase even if the purchase is later given through OS.

Example:

```text
Purchase
Price: 90,000

Tax: 7,000
Packing: 3,000

→ Give OS for 80,000
```

The original user's history still contains:

```text
Tax: 7,000
Packing: 3,000
```

because those costs were actually incurred by that user.

---

# 25. Purchase Images

Purchase images are optional.

The database stores only an image reference:

```text
image_url
```

The actual file should be stored in Supabase Storage.

Recommended conceptual path:

```text
purchase-images/
└── <user_id>/
    └── <purchase_id>/
        └── image
```

The MVP supports one optional image per purchase.

Multiple images are out of scope unless validated as necessary.

---

# 26. Notes

Notes are free-form text.

They can be used for:

```text
Taken OS from Sarah
```

```text
Blue back PC
```

```text
Seller said packed with album
```

No structured note system is required.

---

# 27. Archive / Soft Delete

The preferred approach is soft deletion.

Set:

```text
archived_at = timestamp
```

when a purchase is archived.

Archived purchases should be excluded from normal active views while remaining available for history and financial records.

Permanent deletion is not required for MVP.

---

# 28. Relationships

```text
auth.users
│
├── sources
│   │
│   ├── batches
│   │   └── purchases
│   │       └── additional_costs
│   │
│   └── purchases
│       └── additional_costs
│
└── profiles (optional)
```

Cardinality:

```text
User 1 ─── N Sources

Source 1 ─── N Batches
Source 1 ─── N Purchases

Batch 1 ─── N Purchases

Purchase 1 ─── N Additional Costs
```

A Direct Seller source simply has no batches.

---

# 29. Data Integrity Rules

The following rules must be enforced by the application and, where practical, by database constraints.

## Source

```text
user_id IS NOT NULL
name IS NOT NULL
type IS NOT NULL
platform IS NOT NULL
```

## Batch

```text
user_id IS NOT NULL
source_id IS NOT NULL
country IS NOT NULL
batch_number IS NOT NULL
batch_date IS NOT NULL
status IS NOT NULL
last_updated_at IS NOT NULL
```

A batch must reference a Group Order source.

## Purchase

```text
user_id IS NOT NULL
source_id IS NOT NULL
item_name IS NOT NULL
price IS NOT NULL
paid_amount IS NOT NULL
purchase_date IS NOT NULL
purchase_origin IS NOT NULL
ownership_status IS NOT NULL
```

Conditional rules:

```text
GROUP_ORDER:
    batch_id IS NOT NULL
    country IS NULL
    tracking_status IS NULL
    last_updated_at IS NULL

DIRECT_SELLER:
    batch_id IS NULL
    country IS NOT NULL
    tracking_status IS NOT NULL
    last_updated_at IS NOT NULL
```

## Additional Cost

```text
user_id IS NOT NULL
purchase_id IS NOT NULL
type IS NOT NULL
amount IS NOT NULL
paid IS NOT NULL
```

All monetary amounts must be zero or greater.

---

# 30. Cross-User Relationship Protection

A user must not be able to reference another user's source or batch.

Invalid examples:

```text
My purchase
→ Another user's source
```

```text
My purchase
→ Another user's batch
```

```text
My additional cost
→ Another user's purchase
```

The database security model must prevent these relationships.

---

# 31. Row Level Security (RLS)

Supabase Row Level Security is required.

Users may only access their own:

- sources
- batches
- purchases
- additional costs
- profile, if used

The application must not rely on frontend filtering for security.

RLS must protect the database itself.

Conceptually:

```text
record.user_id = authenticated_user_id
```

For nested relationships, ownership must still be validated.

---

# 32. Calculated Values

Do not store values that can reliably be derived.

### Purchase remaining

```text
price - paid_amount
```

### Purchase payment status

```text
UNPAID
PARTIAL
PAID
```

### OS remaining

```text
os_price - os_paid_amount
```

### OS payment status

```text
UNPAID
PARTIAL
PAID
```

### OS difference

```text
os_price - price
```

### Days since tracking update

```text
current_time - last_updated_at
```

These values should be calculated by queries, database views, or application logic as appropriate.

---

# 33. Finance Calculations

The Finance section may calculate:

### Purchase amount paid

```text
SUM(paid_amount)
```

### Purchase amount remaining

```text
SUM(price - paid_amount)
```

for purchases with outstanding payment.

### Additional costs

```text
SUM(additional_costs.amount)
```

according to the selected financial view.

### OS difference

```text
SUM(os_price - price)
```

for purchases with Give OS data.

Exact inclusion/exclusion rules for dashboard cards should be finalized in `UX_SPEC.md`.

---

# 34. No Tracking Events

The MVP does not have a `tracking_events` table.

Only the current status and last update are stored.

Example:

```text
Batch 42

Current status:
IN_TRANSIT

Last updated:
2026-09-01
```

The application does not retain a full timeline such as:

```text
PURCHASED
→ WAREHOUSE
→ IN_TRANSIT
```

A tracking history can be introduced later if validated.

---

# 35. No Artist / Group Tables

The MVP does not have:

```text
artists
groups
members
```

tables.

Instead:

```text
artist_group TEXT
item_name TEXT
```

are sufficient.

This keeps purchase entry fast.

---

# 36. No OS Buyer Table

The MVP does not have an `os_buyers` table.

If the user wants to remember who received an OS, they can use:

```text
notes
```

No second user account is required.

---

# 37. No Marketplace Tables

The MVP does not have tables for:

```text
listings
offers
conversations
buyers
sellers
```

OS is a personal tracking feature, not a marketplace.

---

# 38. No Courier Tables

The MVP does not require:

```text
couriers
tracking_numbers
shipments
```

Tracking is manually maintained.

---

# 39. Recommended Indexes

Start with indexes that match common queries.

Recommended:

```text
sources(user_id)

batches(user_id)
batches(source_id)
batches(status)
batches(last_updated_at)

purchases(user_id)
purchases(source_id)
purchases(batch_id)
purchases(country)
purchases(purchase_date)
purchases(ownership_status)
purchases(purchase_origin)

additional_costs(user_id)
additional_costs(purchase_id)
```

Do not add indexes indiscriminately.

---

# 40. Suggested Database-Level Constraints

Recommended constraints include:

```text
price >= 0
paid_amount >= 0
paid_amount <= price

os_price >= 0
os_paid_amount >= 0
os_paid_amount <= os_price

additional_costs.amount >= 0
```

Conditional OS constraints should only apply when OS fields are populated.

---

# 41. Suggested Conditional Validation

The database/application should validate:

### Group Order purchase

```text
source.type = GROUP_ORDER
batch_id IS NOT NULL
country IS NULL
```

### Direct Seller purchase

```text
source.type = DIRECT_SELLER
batch_id IS NULL
country IS NOT NULL
```

### Group Order batch

```text
source.type = GROUP_ORDER
```

This is important because PostgreSQL foreign keys alone do not automatically guarantee that a referenced source has the correct `type`.

---

# 42. Example Data

## Group Order

```text
Source
--------------------------------
name: GO A
type: GROUP_ORDER
platform: WhatsApp

Batch
--------------------------------
source: GO A
country: CHINA
batch_number: 42
batch_date: 2026-09-12
status: IN_TRANSIT

Purchases
--------------------------------
Juun PC   | 90,000 | 90,000
Ian PC    | 90,000 | 45,000
IVE Album | 150,000 | 0
```

All three purchases display:

```text
IN_TRANSIT
```

because they belong to the same batch.

---

## Direct Seller

```text
Source
--------------------------------
name: Seller Jane
type: DIRECT_SELLER
platform: X

Purchases
--------------------------------
Mingyu PC  | JAPAN | DELIVERED
Wonwoo PC  | JAPAN | IN_TRANSIT
IVE Album  | JAPAN | PURCHASED
```

Each purchase has its own tracking status.

No batch exists.

---

## Give OS

```text
Purchase
--------------------------------
price: 90,000
paid_amount: 90,000
ownership_status: GIVEN_OS

OS
--------------------------------
os_price: 80,000
os_paid_amount: 40,000
```

Calculated:

```text
OS remaining: 40,000
OS difference: -10,000
OS payment status: PARTIAL
```

---

## Take OS

```text
Purchase
--------------------------------
purchase_origin: TAKEN_OS
ownership_status: ACTIVE
price: 85,000
paid_amount: 40,000
```

Calculated:

```text
remaining: 45,000
payment status: PARTIAL
```

---

# 43. Final Domain Rules

These are the rules Claude must not violate:

1. A source is either `GROUP_ORDER` or `DIRECT_SELLER`.
2. Group Orders use batches.
3. Direct Sellers do not use batches.
4. A batch can only belong to a Group Order source.
5. Group Order purchase tracking comes from the batch.
6. Direct Seller purchase tracking is stored on the purchase.
7. Batch numbers are not globally unique.
8. Purchase payment status is derived from `price` and `paid_amount`.
9. OS payment status is derived from `os_price` and `os_paid_amount`.
10. Give OS does not delete the original purchase.
11. Ownership status and physical tracking status are separate concepts.
12. Take OS creates a purchase belonging to the current user.
13. Additional costs remain in the user's history.
14. Artist/group is free text.
15. OS buyers do not require accounts.
16. Tracking history is not stored in the MVP.
17. Users can only access their own data.
18. Calculated values should not be unnecessarily duplicated.
19. Direct Seller purchases must never receive an artificial batch.
20. Keep the schema as small as possible while satisfying the PRD.

---

# 44. Implementation Notes for Claude

When implementing this model:

1. Read `docs/PRD.md` before modifying the schema.
2. Treat this file as the source of truth for data relationships.
3. Do not introduce new tables unless required by the PRD or explicitly approved.
4. Do not create artificial batches for Direct Sellers.
5. Do not create a purchase-level tracking status for Group Order purchases.
6. Use Supabase Auth for authentication.
7. Use Supabase RLS for user isolation.
8. Use Supabase Storage for purchase images.
9. Prefer database constraints for basic data integrity.
10. Prefer derived values over duplicated database fields.
11. Keep migrations small and understandable.
12. If implementation requires a product decision not covered here, stop and ask rather than silently changing the product behavior.

---

# 45. Next Document

After this data model is approved, create:

```text
docs/UX_SPEC.md
```

The UX specification should define:

- navigation
- page structure
- Add Purchase flow
- New Purchase flow
- Take OS flow
- Give OS flow
- Group Order flow
- Direct Seller flow
- dashboard behavior
- purchase list behavior
- batch list behavior
- finance behavior
- empty states
- loading states
- error states
- mobile behavior
- interaction rules

The UX specification must follow this data model and must not reintroduce batches for Direct Seller purchases.
