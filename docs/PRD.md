# Product Requirements Document
## K-pop Purchase & Shipment Tracker

**Status:** Draft v1.1  
**Product stage:** MVP  
**Primary platform:** Responsive Web  
**Target user:** K-pop collectors / buyers who frequently purchase through Group Orders (GOs) and direct sellers

---

# 1. Product Overview

A personal web application for K-pop collectors to keep track of everything they purchase from **Group Orders (GOs)** and **Direct Sellers**.

The app organizes purchases according to the type of source:

### Group Order

```text
Source
  ↓
Country
  ↓
Batch
  ↓
Purchase
```

### Direct Seller

```text
Source
  ↓
Country
  ↓
Purchase
```

The application provides a simple way to:

- remember what was purchased,
- know where a purchase or batch currently is,
- see how long a batch/purchase has gone without an update,
- track payments and additional costs,
- understand total spending,
- record items that are given away through OS (oper slot),
- record items taken over from someone else through OS.

The MVP is intentionally manual.

It does not attempt to automatically track shipments or integrate with GOs, couriers, WhatsApp, LINE, X, or payment providers.

The core principle is:

> **Enter a purchase once, then let the app organize and summarize it automatically.**

---

# 2. Problem

K-pop collectors may have purchases spread across many:

- Group Orders,
- direct sellers,
- countries,
- batches,
- artists/groups,
- individual members/items.

Tracking these purchases through spreadsheets, notes, screenshots, and chat messages becomes difficult as the number of purchases increases.

Common problems:

1. Forgetting what was purchased.
2. Forgetting which GO/source an item belongs to.
3. Not knowing the current status of a batch or direct-seller purchase.
4. Not noticing that a batch/purchase has not received an update for a long time.
5. Losing track of how much money has already been spent.
6. Forgetting unpaid or partially paid purchases.
7. Difficulty tracking additional costs such as tax, packing, and domestic shipping.
8. Difficulty remembering which purchases have been OS.
9. Maintaining a spreadsheet feels like work itself.

The product should reduce this friction rather than become another spreadsheet.

---

# 3. Product Goal

The MVP should make it significantly easier for a collector to answer four questions:

### 1. What did I buy?

See all purchases in one organized place.

### 2. Where is it?

See the current status of a purchase or batch and its last update.

### 3. How much have I spent?

See paid, unpaid, partial payments, additional costs, and OS-related amounts.

### 4. What needs my attention?

See stale batches/purchases, unpaid amounts, and other pending items.

---

# 4. Target User

## Primary User

A K-pop collector who:

- buys multiple photocards, albums, or merchandise,
- uses GOs or direct sellers,
- purchases from multiple countries,
- makes purchases frequently,
- sometimes uses OS,
- wants to monitor spending,
- does not want to maintain a complicated spreadsheet.

## User Characteristics

The user is comfortable using a normal web application but does not want to perform administrative work just to track personal purchases.

The app should therefore optimize for:

- fast data entry,
- low cognitive load,
- simple organization,
- useful summaries,
- minimal manual maintenance.

---

# 5. Core Product Model

The product has two source types:

- **Group Order**
- **Direct Seller**

The data hierarchy depends on the source type.

## Group Order

```text
Source
  ↓
Country
  ↓
Batch
  ↓
Purchase
```

Example:

```text
GO A
└── China
    ├── Batch 42
    │    ├── Juun PC
    │    ├── Ian PC
    │    └── IVE Album
    │
    └── Batch 43
         └── Another PC
```

## Direct Seller

Direct sellers do not use batches.

```text
Source
  ↓
Country
  ↓
Purchase
```

Example:

```text
Seller Jane
└── Japan
    ├── Mingyu PC
    └── IVE Album
```

This distinction is intentional and reflects the actual purchase workflow.

The application must not create artificial batches for direct-seller purchases.

---

# 6. Source

A source represents where the purchase originated.

A source has:

- name,
- source type,
- platform.

## Source Types

### Group Order

A GO or organizer handling purchases for multiple buyers.

Example:

```text
GO A
Type: Group Order
Platform: WhatsApp
```

### Direct Seller

A person or seller selling directly to the user.

Example:

```text
Seller Jane
Type: Direct Seller
Platform: X
```

The platform does not determine the source type.

For example, a seller using X is still a **Direct Seller**, while a GO using X is still a **Group Order**.

---

# 7. Country

Each purchase is associated with a country.

For Group Orders, the country belongs to the batch.

For Direct Sellers, the country belongs directly to the purchase.

Initial supported countries:

- China
- Korea
- Japan
- Thailand
- Singapore
- Indonesia

---

# 8. Batch

A Batch exists **only for Group Order sources**.

A batch represents a group of purchases belonging to the same GO and batch number.

Example:

```text
GO A
└── China
    ├── Batch 42
    ├── Batch 43
    └── Batch 44
```

Batch numbers are **not globally unique**.

The same batch number may exist under another source/country.

Example:

```text
GO A → China → Batch 42
GO B → Korea → Batch 42
```

These are different batches.

A Group Order batch contains:

- batch number,
- batch date,
- current tracking status,
- last updated timestamp,
- purchases.

---

# 9. Purchase

Each individual item/slot is represented as a separate purchase record.

Example:

```text
China — Batch 42

Juun PC       Rp90.000
Ian PC        Rp90.000
IVE Album     Rp150.000
```

These are three separate purchase records.

The MVP does not require quantity management.

If a user wants to track multiple individual items separately, they create separate purchase records.

A purchase may belong to:

### Group Order

```text
Source → Country → Batch → Purchase
```

### Direct Seller

```text
Source → Country → Purchase
```

A purchase must therefore **not always require a batch**.

---

# 10. Tracking Model

Tracking depends on the source type.

## Group Order Tracking

Tracking is performed at the **batch level**.

All purchases belonging to the same batch inherit the batch's physical shipment status.

Example:

```text
Batch 42
Status: In Transit

├── Juun PC → In Transit
├── Ian PC  → In Transit
└── IVE PC  → In Transit
```

Updating the batch status updates what users see for all purchases in that batch.

The MVP must not maintain independent physical shipment statuses for purchases inside the same Group Order batch.

---

## Direct Seller Tracking

Direct Seller purchases do not have a batch.

Therefore, their physical tracking status is maintained at the **purchase level**.

Example:

```text
Seller Jane
└── Japan

Mingyu PC
Status: In Transit
```

Changing the status of this purchase does not affect other purchases from the same seller.

---

# 11. Tracking Statuses

The MVP supports a simple status model.

Suggested statuses:

```text
Purchased
Warehouse
In Transit
Indonesia
Admin Received
Delivered
```

Not every purchase/batch must go through every status.

The application must allow statuses to be skipped where appropriate.

Example:

```text
Purchased
→ In Transit
→ Indonesia
→ Delivered
```

is valid.

---

# 12. Last Update / Stale Tracking

Every trackable entity has a `last updated` timestamp.

For Group Orders:

- the timestamp belongs to the batch.

For Direct Sellers:

- the timestamp belongs to the purchase.

The user should be able to quickly understand how long the batch/purchase has gone without an update.

Example:

```text
Batch 42
In Transit
Last update: 14 days ago

⚠ No update for 14 days
```

The goal is not to predict shipment delays.

The goal is simply:

> "I haven't received an update about this for a while."

---

# 13. Purchase Information

Each purchase should support:

### Required

- Item/member name
- Price
- Source
- Country
- Purchase date

### Batch Requirement

For a Group Order:

- Batch is required.

For a Direct Seller:

- Batch does not exist.

### Payment

- Paid amount
- Remaining amount
- Payment status

Supported payment states:

```text
Paid
Partial
Unpaid
```

Partial payment must support arbitrary amounts.

Example:

```text
Price:       Rp90.000
Paid:        Rp45.000
Remaining:   Rp45.000
Status:      Partial
```

The application should derive remaining payment from:

```text
remaining = price - paid_amount
```

---

# 14. Optional Purchase Information

A purchase may also contain:

- Artist/group
- Purchase image
- Notes

Artist/group is free text in the MVP.

The application must not require a predefined artist/group database.

Example:

```text
Item: Juun
Artist/Group: SEVENTEEN
Image: [optional]
Notes: blue back PC
```

The image is intended primarily as a visual reminder of what was purchased.

The MVP does not require warehouse proof images or shipment evidence photos.

---

# 15. Additional Costs

Additional costs can be associated with a purchase.

Examples:

- Tax
- Packing
- Domestic shipping
- Other

The user can manually record:

- Cost type
- Amount
- Status
- Notes

The MVP does not automatically calculate taxes.

The user is responsible for entering the actual additional cost.

Additional costs remain associated with the user's purchase history even if the purchase is later given through OS, because they represent costs the user actually incurred.

---

# 16. OS — Give

The user can give away an existing purchase through OS.

Example:

```text
Original purchase
Price: Rp90.000

OS price: Rp80.000
```

The original purchase must **not be deleted**.

Instead, it remains in the user's history and is clearly marked as OS.

The app should retain:

- original purchase price,
- OS price,
- OS paid amount,
- OS payment status,
- OS date,
- optional notes.

OS payment supports:

```text
Paid
Partial
Unpaid
```

Partial payment supports arbitrary amounts.

Example:

```text
OS Price: Rp90.000
OS Paid:  Rp45.000
Status:   Partial
```

---

# 17. OS Difference

The MVP should show a simple OS difference:

```text
OS difference = OS price - original purchase price
```

Example:

```text
Original price: Rp90.000
OS price:       Rp80.000

OS difference: -Rp10.000
```

This should be labeled as an **OS difference**, not accounting profit.

Additional costs may make the user's actual economic result different.

The MVP does not attempt to build a complete accounting/profit system.

---

# 18. OS — Take

The user can also take over an OS slot from another person.

The Take OS flow follows the source type.

## Taking OS from a Group Order

```text
Add Purchase
→ Take OS
→ Select Source
→ Select Country
→ Select Batch
→ Enter Purchase Details
→ Enter OS Price/Payment
→ Save
```

## Taking OS from a Direct Seller

```text
Add Purchase
→ Take OS
→ Select Source
→ Select Country
→ Enter Purchase Details
→ Enter OS Price/Payment
→ Save
```

No artificial batch is created for a Direct Seller.

The user does not need to create or link another user's account.

The original owner's identity is not a first-class entity in the MVP.

If necessary, the user can record a name in Notes.

Example:

```text
Item: Mingyu PC
Source: GO A
Country: Korea
Batch: 12

OS price: Rp85.000
Paid: Rp40.000

Notes:
Taken OS from Sarah
```

---

# 19. OS Ownership Rules

For MVP:

### New purchase

```text
Purchase origin: New
Ownership: Active
```

### User gives OS

```text
Purchase origin: New
Ownership: Given OS
```

### User takes OS

```text
Purchase origin: Taken OS
Ownership: Active
```

The original purchase record remains visible after Give OS.

The app does not need cross-user ownership synchronization.

---

# 20. Dashboard

The dashboard should provide a quick overview of the user's current situation.

It should answer:

### What do I have?

Examples:

- Active purchases
- Active batches
- Delivered purchases
- OS purchases

### Where is it?

For Group Orders, summarize by batch status.

For Direct Sellers, summarize by purchase status.

Example:

```text
Purchased       5
Warehouse       8
In Transit      12
Indonesia       4
Admin Received  3
Delivered       10
```

### How much?

Examples:

```text
Spent
Rp3.250.000

To Pay
Rp450.000

Additional Costs
Rp280.000
```

### What needs attention?

Examples:

```text
3 batches have not been updated recently
5 purchases have outstanding payments
```

The dashboard should remain a summary.

It should not become a spreadsheet containing every purchase.

---

# 21. Purchase List

The purchase list allows users to browse all purchases.

Each purchase should make it easy to see:

- item,
- artist/group,
- source,
- country,
- batch if applicable,
- price,
- payment status,
- physical tracking status,
- OS status.

For Direct Seller purchases, Batch should simply not be displayed.

The user should be able to search and apply simple filters.

Initial filters:

- All
- Active
- Delivered
- OS

Additional useful filters may include:

- Country
- Source
- Batch status where applicable
- Payment status

Filters should remain simple and should not turn the interface into a spreadsheet.

---

# 22. Purchase Detail

The purchase detail page should show:

```text
Purchase image
Item
Artist/group

Price
Payment status
Paid amount
Remaining amount

Source
Country
Batch (if Group Order)

Current status
Last update

Additional costs

OS information, if applicable

Notes
```

Possible actions:

- Edit purchase
- Add cost
- Update tracking status
- Give OS
- View batch, if applicable

For a Group Order purchase, updating tracking from the purchase detail must update the associated batch.

For a Direct Seller purchase, updating tracking updates only that purchase.

---

# 23. Batch List

The Batch section contains **Group Order batches only**.

Direct Seller purchases do not appear as batches.

The batch list should organize batches around:

```text
Source
Country
Batch number
```

Each batch should show:

- source,
- country,
- batch number,
- number of purchases,
- current status,
- last updated time.

Example:

```text
GO A · China
Batch 42
5 purchases
In Transit
Updated 6 days ago
```

---

# 24. Batch Detail

The batch detail page should show:

- Source
- Country
- Batch number
- Batch date
- Current status
- Last updated
- Number of purchases
- Total purchase value
- Purchases belonging to the batch

The user should be able to update the batch's status from this page.

Changing the status here must update the status shown by every purchase in the batch.

---

# 25. Finance

The Finance section provides a lightweight overview of spending.

It should show at minimum:

### Spending

Total amount paid for purchases.

### To Pay

Outstanding purchase amounts.

### Additional Costs

Total recorded additional costs.

### OS

OS-related amounts and simple OS differences.

The Finance section is for personal spending awareness.

It is not intended to replace accounting software.

---

# 26. Add Purchase Flow

The primary action of the application is adding a purchase.

The user should be able to start from:

```text
+ Add Purchase
```

First choose:

```text
New Purchase
Take OS
```

Then choose the source.

The next step depends on source type.

## Group Order

```text
Source
↓
Country
↓
Batch
↓
Purchase details
```

## Direct Seller

```text
Source
↓
Country
↓
Purchase details
```

The user must be able to create a new Source or Batch without leaving the purchase flow.

A Batch creation option must only be available for Group Order sources.

The goal is fast repeated entry.

For a user who already has a source and batch, adding another purchase should require minimal interaction.

---

# 27. Source Creation

A source contains:

- Name
- Platform
- Source type

Example:

```text
Name: GO A
Platform: WhatsApp
Type: Group Order
```

or:

```text
Name: Seller Jane
Platform: X
Type: Direct Seller
```

A source can be reused across multiple purchases and batches.

---

# 28. Batch Creation

A new batch can only be created for a **Group Order** source.

A batch is created within the selected:

```text
Source + Country
```

The user enters:

- Batch number
- Batch date

Example:

```text
Source: GO A
Country: China

Batch number: 42
Batch date: 12 Sep 2026
```

The batch number does not need to be globally unique.

The system should prevent ambiguous duplicate batches within the same source/country context if this is determined to be desirable during data-model design.

---

# 29. Authentication

The MVP requires personal user accounts.

Each user's purchases, sources, batches, and costs must be isolated from other users.

Users must not be able to see another user's personal purchase data.

Authentication is required before accessing personal data.

The exact authentication methods are an implementation decision and are documented separately from this PRD.

---

# 30. MVP Scope

## Must Have

### Purchase Management

- Create purchase
- Edit purchase
- View purchase
- Delete/archive purchase
- Purchase image
- Artist/group text
- Notes
- Purchase date

### Source

- Create source
- Select existing source
- Platform
- Source type
- Group Order
- Direct Seller

### Country

- China
- Korea
- Japan
- Thailand
- Singapore
- Indonesia

### Group Order Batch

- Create batch
- Select batch
- Batch number
- Batch date
- Current status
- Last updated
- Batch purchase list

### Tracking

- Batch-level tracking for Group Orders
- Purchase-level tracking for Direct Sellers
- Status update
- Last update
- Stale indicator

### Payment

- Price
- Paid amount
- Remaining amount
- Paid / Partial / Unpaid

### Additional Costs

- Tax
- Packing
- Domestic shipping
- Other
- Amount
- Notes

### OS

- Give OS
- Take OS
- OS price
- OS paid amount
- OS payment status
- OS difference
- OS history/indicator
- Notes

### Dashboard

- Purchase overview
- Batch overview
- Spending overview
- Outstanding payments
- Stale batches/purchases

### Finance

- Paid spending
- Outstanding spending
- Additional costs
- OS summary

---

# 31. Out of Scope — MVP

The following must NOT be built unless explicitly added to the requirements later.

### Automatic Tracking

- Courier API
- Automatic shipment tracking
- Tracking number integration
- Automatic status updates

### External Integrations

- WhatsApp integration
- LINE integration
- X integration
- GO/admin integration
- Courier integration

### GO Administration

- GO admin accounts
- Warehouse management
- Admin dashboards
- Warehouse inventory
- Warehouse proof photos
- Automatic participant notifications

### Marketplace

- OS marketplace
- Public listings
- Buyer/seller matching
- In-app buyer accounts
- Public profiles
- Chat between users

### Payments

- Payment gateway
- Automatic payment verification
- Bank integration
- E-wallet integration

### Tax

- Automatic tax calculation
- Customs API
- Tax prediction

### Advanced Accounting

- Full accounting
- Profit & loss statements
- Balance sheets
- Complex financial reporting

### AI

- AI purchase categorization
- AI shipment prediction
- AI recommendations
- AI chatbot

### Social Features

- Community
- Following users
- Likes
- Comments
- Public collections

### Advanced Analytics

- Complex spending analytics
- Investment-style dashboards
- Predictive spending

---

# 32. Core User Stories

## US-01 — Add New Purchase

**As a collector, I want to record a purchase quickly so that I don't need to maintain a spreadsheet.**

### Acceptance Criteria

- User can select New Purchase.
- User can select or create a source.
- User can select a country.
- If the source is a Group Order, user can select or create a batch.
- If the source is a Direct Seller, no batch is required or created.
- User can enter purchase information.
- User can enter price and paid amount.
- Purchase is saved.
- Purchase appears in the purchase list.
- If it is a Group Order purchase, it appears in the selected batch.
- Payment status is derived correctly.

---

## US-02 — Add Another Purchase to Existing Batch

**As a collector, I want to add another item to an existing Group Order batch without recreating the batch.**

### Acceptance Criteria

- Existing Group Order source can be selected.
- Existing batch can be selected.
- New purchase is linked to the existing batch.
- Batch purchase count increases.
- Existing batch status remains unchanged.

This user story does not apply to Direct Seller purchases because Direct Sellers do not use batches.

---

## US-03 — Track Group Order Batch

**As a collector, I want to update a Group Order batch's status so that I know where my purchases are.**

### Acceptance Criteria

- User can update the batch status.
- Last updated timestamp changes.
- All purchases belonging to that batch display the new status.
- No individual physical tracking status is created for purchases within that batch.

---

## US-04 — Track Direct Seller Purchase

**As a collector, I want to update the status of a Direct Seller purchase because it does not belong to a batch.**

### Acceptance Criteria

- Direct Seller purchase has its own tracking status.
- User can update that status.
- Last updated timestamp changes.
- Other purchases from the same seller are unaffected.

---

## US-05 — Identify Stale Tracking

**As a collector, I want to see batches/purchases that haven't been updated for a long time so that I know which ones need attention.**

### Acceptance Criteria

- Group Order batches show last update time.
- Direct Seller purchases show last update time.
- Old updates can be visually highlighted.
- User can see how long it has been since the last update.

---

## US-06 — Track Payment

**As a collector, I want to record partial payments so that I know how much I still owe.**

### Acceptance Criteria

- User can enter arbitrary paid amounts.
- Remaining amount is calculated automatically.
- Status becomes Paid, Partial, or Unpaid appropriately.
- Dashboard/Finance reflects outstanding amount.

---

## US-07 — Record Additional Cost

**As a collector, I want to record tax and other additional costs so that my spending view is more accurate.**

### Acceptance Criteria

- User can add a cost.
- User can specify cost type and amount.
- Cost appears in purchase detail.
- Finance reflects the cost.

---

## US-08 — Give OS

**As a collector, I want to mark an unwanted purchase as OS without deleting its history.**

### Acceptance Criteria

- User can mark a purchase as OS.
- Original purchase price remains visible.
- OS price can be entered.
- OS paid amount can be entered.
- OS payment status is supported.
- Purchase remains visible in history.
- OS difference can be displayed.
- Existing additional costs remain associated with the purchase.

---

## US-09 — Take OS

**As a collector, I want to record an item I took over from someone else.**

### Acceptance Criteria

- User can select Take OS.
- User can select/create source.
- User can select country.
- If source is a Group Order, user can select/create a batch.
- If source is a Direct Seller, no batch is created.
- User can record item information.
- User can record OS price and payment.
- Purchase becomes part of the user's own purchase list.
- No second user account is required.

---

## US-10 — Understand Spending

**As a collector, I want to see how much money I have spent and still need to pay.**

### Acceptance Criteria

- Dashboard shows paid spending.
- Dashboard shows outstanding payments.
- Finance shows additional costs.
- Finance shows OS-related information.
- Values update when purchases, payments, or costs change.

---

# 33. UX Principles

### 1. Fast over comprehensive

Entering a purchase should feel faster than maintaining a spreadsheet.

### 2. Context over repetition

Once the user selects a source and country, the application should reuse that context when possible.

### 3. Batch-level tracking for Group Orders

Do not duplicate tracking information across every purchase in a batch.

### 4. Purchase-level tracking for Direct Sellers

Because Direct Sellers do not have batches, each purchase maintains its own tracking status.

### 5. One purchase = one trackable item/slot

Keep purchase records simple.

### 6. No unnecessary configuration

Do not require users to create artists, categories, tax rules, etc.

### 7. History should not disappear

OS should preserve the original purchase history.

### 8. Summary first

Dashboard answers important questions without requiring the user to inspect every record.

---

# 34. Success Criteria

The MVP is successful if real users demonstrate that it solves the original problem.

Primary signals:

### Activation

A new user successfully adds their first purchase.

### Repeat Usage

Users return to:

- add purchases,
- update batches,
- update direct-seller purchases,
- check spending,
- review their purchases.

### Purchase Volume

Users are comfortable entering many purchases instead of abandoning the app after a few records.

### Spreadsheet Replacement

Users feel they can reduce or stop relying on their existing spreadsheet/notes.

### Tracking Value

Users use batch status for GOs and purchase status for Direct Sellers to understand their purchases.

### Financial Awareness

Users gain a clearer understanding of how much they have spent and still owe.

### OS Usefulness

Users with OS activity can record both Give OS and Take OS without maintaining separate notes.

---

# 35. MVP Release Criteria

The MVP should not be considered ready until:

- A user can create an account.
- A user can create a Group Order source.
- A user can create a Direct Seller source.
- A user can create a Group Order batch.
- A user can add multiple purchases to a Group Order batch.
- A user can add a Direct Seller purchase without creating a batch.
- A user can record paid/partial/unpaid amounts.
- Group Order batch tracking works correctly.
- All purchases in a Group Order batch reflect the batch status.
- Direct Seller purchases have independent tracking status.
- Stale batches/purchases are identifiable.
- Additional costs work.
- Give OS works without deleting history.
- Take OS works.
- Dashboard totals are correct.
- Finance totals are correct.
- User data is isolated from other users.
- The primary workflows work on desktop and mobile-sized screens.
- No major workflow requires spreadsheet-like manual management.

---

# 36. Important Product Constraints

The MVP prioritizes **validation over completeness**.

The product should not become:

- a full logistics platform,
- accounting software,
- an OS marketplace,
- a GO administration platform.

The product should solve one core problem:

> **Help K-pop collectors keep track of what they bought, where it is, and how much money is involved.**

---

# 37. Product Decision Rules for Development

When implementing this PRD:

1. Do not invent product behavior without documenting it.
2. If a technical decision does not affect user behavior, Claude may choose the simplest reasonable implementation.
3. If a decision changes the user workflow or business logic, stop and ask for clarification.
4. Prefer the simplest implementation that satisfies the acceptance criteria.
5. Do not add features simply because they are technically easy to add.
6. Do not turn MVP features into complex systems.
7. Preserve user history wherever possible.
8. Product requirements take priority over implementation convenience.
9. **Do not create artificial batches for Direct Seller purchases.**
10. **Batch logic must only apply to Group Order sources.**
11. **Direct Seller tracking must operate at the purchase level.**

---

# 38. Source of Truth

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
Implementation
```

The PRD defines **what and why**.

The data model defines **what information must exist and how it relates**.

The UX specification defines **how users move through the product**.

The design system defines **how the product should look and behave visually**.

Implementation details should not silently redefine product requirements.

---

# 39. Current Product Structure

The final MVP domain model is:

```text
USER
 │
 ├── SOURCES
 │    │
 │    ├── GROUP ORDER
 │    │      │
 │    │      └── COUNTRY
 │    │             │
 │    │             └── BATCH
 │    │                    │
 │    │                    └── PURCHASES
 │    │
 │    └── DIRECT SELLER
 │           │
 │           └── COUNTRY
 │                  │
 │                  └── PURCHASES
 │
 └── ADDITIONAL COSTS
```

OS is a property/lifecycle of a purchase rather than a separate marketplace or ownership system.

---

# 40. Next Specification

After this PRD is approved, the next document is:

```text
docs/DATA_MODEL.md
```

It should define:

- database tables,
- relationships,
- required/optional fields,
- enums,
- payment calculations,
- OS fields and rules,
- Group Order batch rules,
- Direct Seller purchase rules,
- tracking status rules,
- additional cost rules,
- indexes,
- constraints,
- Row Level Security requirements.

The data model must implement the product behavior defined in this PRD without adding unnecessary entities or features.

---