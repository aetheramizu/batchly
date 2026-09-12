# DESIGN SYSTEM
## K-pop Purchase & Shipment Tracker

**Status:** Draft v1.0  
**Related documents:** `docs/PRD.md`, `docs/DATA_MODEL.md`, `docs/UX_SPEC.md`

---

# 1. Purpose

This document defines the visual language and reusable UI patterns for the MVP.

The design should feel like a polished personal productivity/SaaS product with subtle K-pop personality.

It should NOT look like:

- a generic admin dashboard
- a spreadsheet
- a marketplace
- an overly decorative fan website
- an AI-generated template full of gradients and unnecessary effects

The visual system should prioritize clarity, speed, hierarchy, and trust.

---

# 2. Design Principles

## 2.1 Clean First

The interface should be easy to scan.

Every visual element should have a purpose.

Avoid decorative elements that compete with:

- purchase information
- tracking status
- payment information
- actions

---

## 2.2 Personal, Not Corporate

The product is a personal tracker, so it can have personality.

Use subtle personality through:

- accent color
- friendly microcopy
- rounded components
- purchase imagery
- small visual details

Do not turn the entire interface into K-pop merchandise aesthetics.

---

## 2.3 Information Hierarchy

Important information should be visually obvious:

1. Item
2. Current status
3. Payment state
4. Source / batch
5. Price
6. Secondary metadata

---

## 2.4 Fast Interaction

Common actions should require minimal interaction.

Especially:

```text
Add Purchase
Update Tracking
Add Cost
Give OS
```

---

## 2.5 Consistency

The same concept should always look the same.

Examples:

- tracking statuses use the same badge system
- payment statuses use the same payment indicator
- primary actions use the same button style
- cards share consistent spacing and radius

---

# 3. Visual Direction

Recommended visual direction:

```text
Modern
Minimal
Soft
Polished
Slightly playful
K-pop inspired
```

Think:

> A modern personal finance/productivity app that happens to understand K-pop collecting.

Avoid:

```text
Excessive neon
Heavy glassmorphism
Huge gradients
Anime/fan-art UI
Overuse of pink/purple
Excessive shadows
Too many floating elements
```

---

# 4. Color System

Use a restrained neutral foundation with one primary accent and semantic status colors.

Example token structure:

```text
Background
Surface
Surface Secondary
Border
Text Primary
Text Secondary
Text Muted

Primary
Primary Hover
Primary Soft

Success
Success Soft

Warning
Warning Soft

Danger
Danger Soft

Info
Info Soft
```

The exact color values may be adjusted during visual exploration in Stitch.

The implementation should use design tokens rather than hard-coded colors throughout components.

---

# 5. Recommended Color Philosophy

## Neutral Colors

Most of the interface should use neutral colors.

Use neutral tones for:

- page background
- cards
- inputs
- dividers
- secondary text

---

## Primary Accent

Use one recognizable accent for:

- primary CTA
- active navigation
- selected states
- important links
- focus states

The accent should provide personality without dominating the entire interface.

---

## Semantic Colors

Semantic colors should communicate state.

### Success

Used for:

```text
Paid
Delivered
Completed
```

### Warning

Used for:

```text
Partial
Needs Update
Stale
Pending
```

### Danger

Used for:

```text
Unpaid
Validation errors
Destructive actions
```

### Info

Used for:

```text
In Transit
Indonesia
Informational states
```

Do not rely on color alone. Pair color with text or an icon.

---

# 6. Typography

Use a clean modern sans-serif.

Recommended hierarchy:

```text
Display / Page Title
Section Heading
Card Heading
Body
Secondary
Caption
```

Example scale:

```text
Page Title      28–32px
Section Title   20–24px
Card Title      16–18px
Body            14–16px
Secondary       13–14px
Caption         12px
```

Exact values may be refined during implementation.

---

# 7. Typography Rules

Use strong weight contrast rather than excessive font size.

Example:

```text
Juun PC
90k

GO A · China · Batch 42
```

The item name should be more visually prominent than metadata.

Currency values can use medium or semibold weight.

Do not make every number visually huge.

---

# 8. Spacing

Use a consistent spacing scale.

Recommended base:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
```

Prefer multiples of the base spacing system.

Avoid arbitrary spacing values unless necessary.

---

# 9. Border Radius

Use moderately rounded components.

Recommended:

```text
Small controls: 8px
Inputs:         10px
Cards:          12–16px
Large surfaces: 16–20px
Pills:          999px
```

Avoid extremely rounded cards that make the product feel childish.

---

# 10. Borders

Prefer subtle borders over heavy shadows.

Cards can use:

```text
1px subtle border
```

Use stronger borders only for:

- focused inputs
- selected elements
- important state changes

---

# 11. Shadows

Use shadows sparingly.

Recommended hierarchy:

```text
Default cards:
minimal or no shadow

Floating elements:
subtle shadow

Modal / bottom sheet:
stronger shadow
```

The interface should remain visually flat and clean.

---

# 12. Buttons

## Primary Button

Used for the main action.

Examples:

```text
Add Purchase
Save Purchase
Confirm OS
Save
```

Characteristics:

- solid primary color
- strong contrast
- medium/semibold text
- clear hover/focus state

---

## Secondary Button

Used for supporting actions.

Examples:

```text
Edit
Cancel
Add Another
```

Can use:

- neutral background
- border
- or subtle surface treatment

---

## Destructive Button

Used for:

```text
Archive
Delete
```

Do not use destructive styling for ordinary status changes.

---

## Icon Button

Use for compact actions such as:

```text
More
Close
Back
Filter
Search
```

Icon buttons must have accessible labels/tooltips where appropriate.

---

# 13. Button Layout

Primary action should generally appear on the right on desktop forms.

On mobile:

```text
[ Save Purchase ]
```

may become full width when it improves usability.

Do not place many equal-priority buttons next to each other.

---

# 14. Inputs

Inputs should be:

- clearly labeled
- easy to tap
- visually simple
- consistent in height

Recommended fields:

```text
Text
Number
Date
Select
Textarea
File/Image
```

Labels should remain visible rather than relying only on placeholders.

---

# 15. Input States

Every input should support:

```text
Default
Hover
Focus
Filled
Error
Disabled
```

Error state should include text.

Example:

```text
Paid amount
[ 100000 ]

Paid amount cannot exceed price.
```

---

# 16. Select / Combobox

Source, country, batch, and status selectors should be easy to scan.

For Source selection, show useful metadata:

```text
GO A
Group Order · WhatsApp
```

For Batch selection:

```text
Batch 42
5 purchases · In Transit
```

Do not require the user to open a detail page just to identify a batch.

---

# 17. Cards

Cards are the primary content container.

Use cards for:

- purchases
- batches
- dashboard summaries
- finance summaries
- attention items

A card should have a clear hierarchy.

Example:

```text
┌──────────────────────────────┐
│ [image]  Juun PC             │
│          TXT                  │
│                               │
│ GO A · China · Batch 42       │
│                               │
│ Rp90.000        Partial       │
│ In Transit                    │
└──────────────────────────────┘
```

---

# 18. Purchase Card

Priority:

```text
1. Item image/name
2. Status
3. Price/payment
4. Source/country/batch
5. Secondary metadata
```

If an image is unavailable, use a neutral placeholder.

Do not generate decorative placeholder artwork.

---

# 19. Batch Card

Example:

```text
GO A · China
Batch 42

5 purchases
Rp450.000 total

In Transit
Updated 6 days ago
```

The batch status should be visually prominent.

---

# 20. Dashboard Summary Cards

Summary cards should be compact.

Examples:

```text
Active Purchases
24

To Pay
Rp450.000
```

Do not create a separate card for every tiny metric.

Group related metrics where possible.

---

# 21. Status Badges

Tracking status should use compact badges.

Examples:

```text
Purchased
Warehouse
In Transit
Indonesia
Admin Received
Delivered
```

Status badge structure:

```text
[● In Transit]
```

or:

```text
[ In Transit ]
```

An icon is optional but can improve scanability.

---

# 22. Tracking Status Styling

Status should use semantic visual hierarchy.

Example philosophy:

```text
Purchased       neutral
Warehouse       neutral/info
In Transit      info
Indonesia       info
Admin Received  success/info
Delivered       success
```

Do not make every status bright and saturated.

---

# 23. Payment Status

Payment status should be visually distinct from tracking status.

Examples:

```text
Paid
Partial
Unpaid
```

Recommended semantic treatment:

```text
Paid       success
Partial    warning
Unpaid     danger
```

Always show the actual remaining amount where relevant.

---

# 24. Stale Indicator

Stale tracking should be a secondary warning.

Example:

```text
In Transit

Updated 15 days ago
No update for 14 days
```

The stale indicator should not imply:

```text
Shipment lost
Shipment delayed
Admin stopped responding
```

It only means the app has not received a recent manual update.

---

# 25. OS Badge

OS should be easy to recognize.

Examples:

```text
[ Given OS ]
[ Taken OS ]
```

The OS badge should not visually overpower tracking status.

---

# 26. Finance Display

Money should be displayed with consistent formatting.

Examples:

```text
Rp90.000
Rp1.250.000
```

Large financial summaries may use larger typography.

Detailed lists should use normal readable sizes.

---

# 27. Finance Semantic Hierarchy

Example:

```text
Total Spent
Rp3.250.000

To Pay
Rp450.000

Additional Costs
Rp280.000
```

The UI should make clear which values are:

- already paid
- still outstanding
- additional costs
- OS difference

---

# 28. OS Difference

Use the label:

```text
OS Difference
```

Never:

```text
Profit
```

Example:

```text
Original Price    Rp90.000
OS Price          Rp80.000
OS Difference    -Rp10.000
```

Positive/negative difference may use semantic styling, but the number should remain understandable without color.

---

# 29. Navigation

## Desktop

Recommended:

```text
Sidebar
```

with:

```text
Dashboard
Purchases
Batches
Finance
```

and a prominent:

```text
+ Add Purchase
```

---

## Mobile

Recommended:

```text
Bottom Navigation
```

with four primary destinations.

The Add Purchase action can be:

- a prominent center action
- a floating action button
- or a primary action in the header

Choose the option that produces the clearest interaction during Stitch exploration.

---

# 30. Page Headers

Each page should have a clear title.

Example:

```text
Purchases
Track everything you've bought.

[Search] [Filter] [+ Add Purchase]
```

Avoid oversized hero sections.

The content should begin quickly.

---

# 31. Search

Search field should remain compact.

Example:

```text
⌕ Search purchases...
```

Search should not dominate the page.

On mobile, it may expand into a full-width input.

---

# 32. Filters

Filters should use:

- chips
- segmented controls
- dropdowns
- filter sheets on mobile

Primary filters should be visible.

Secondary filters can live inside a filter panel.

---

# 33. Tabs / Segmented Controls

Good use:

```text
All | Active | Delivered | OS
```

Avoid using tabs for every conceptual grouping.

Tabs should represent mutually useful views.

---

# 34. Modal

Use modals for short focused tasks.

Good examples:

```text
Create Source
Create Batch
Confirm Give OS
```

Do not use a modal for a long purchase form on mobile.

---

# 35. Bottom Sheet

On mobile, bottom sheets are appropriate for:

```text
Source selection
Country selection
Batch selection
Filters
Quick actions
```

They should be dismissible and easy to navigate.

---

# 36. Purchase Form Layout

Desktop:

```text
┌───────────────────────────────┐
│ Purchase Details              │
│                               │
│ Item Name                     │
│ Artist / Group                │
│ Price         Paid Amount     │
│ Purchase Date                 │
│ Image                         │
│ Notes                         │
│                               │
│              [Save Purchase]  │
└───────────────────────────────┘
```

Mobile should become a single-column layout.

---

# 37. Image Upload

Purchase images are optional.

The upload component should provide:

```text
Add Image
```

After upload:

```text
[Preview]

Replace
Remove
```

Only one purchase image is required for MVP.

The image should support a useful visual preview without making image upload mandatory.

---

# 38. Empty States

Empty states should be friendly but concise.

Example:

```text
No purchases yet.

Start tracking your collection.

[Add Purchase]
```

Avoid large illustrations unless they materially improve the experience.

---

# 39. Loading States

Prefer skeletons that roughly match the final layout.

Examples:

- purchase card skeleton
- dashboard metric skeleton
- batch row skeleton

For button actions:

```text
Saving...
```

Keep the interface stable during loading.

---

# 40. Toasts

Use small temporary notifications for successful operations.

Examples:

```text
Purchase added
Batch updated
Cost added
OS recorded
```

Toasts should not contain important information that disappears before the user can understand it.

---

# 41. Error Messages

Error messages should be:

- short
- specific
- actionable

Bad:

```text
Error 23503
```

Good:

```text
Couldn't save this purchase.
Please check the selected batch and try again.
```

---

# 42. Confirmation Dialogs

Use confirmation only when an action changes important state.

Examples:

```text
Give OS
Archive Purchase
```

Avoid confirmation for:

```text
Update tracking status
Save normal purchase
Apply filter
```

---

# 43. Icons

Use one consistent icon library.

Icons should be:

- simple
- outline/filled consistently
- recognizable
- secondary to text

Recommended concepts:

```text
Dashboard
Shopping/Purchase
Package
Wallet
Plus
Search
Filter
Edit
Archive
Chevron
Calendar
Image
Clock
```

Avoid decorative icon overload.

---

# 44. Responsive Layout

Recommended breakpoints should be implementation-defined using the chosen framework's standard responsive conventions.

General rules:

### Mobile

- single column
- bottom navigation
- full-width primary actions
- cards instead of tables
- bottom sheets for selection/filtering

### Tablet

- one or two content columns depending on screen width

### Desktop

- sidebar
- multi-column dashboard
- wider detail layouts
- cards/list combinations

---

# 45. Touch Targets

Interactive controls should have comfortable touch targets.

Avoid tiny:

```text
icon-only buttons
```

especially on mobile.

When an icon-only control is necessary, provide an accessible label.

---

# 46. Accessibility

The visual system must support:

- readable contrast
- visible focus
- keyboard navigation
- semantic HTML
- accessible labels
- non-color-only status communication
- meaningful alt text
- appropriate heading hierarchy

---

# 47. Motion

Motion should be subtle.

Good uses:

- modal opening
- bottom sheet transition
- toast appearance
- small list updates

Avoid:

- excessive bouncing
- large page transitions
- decorative animations
- constant movement

The product should feel responsive, not animated.

---

# 48. Design Rules for K-pop Personality

K-pop personality should come primarily from:

```text
Accent
Typography choices
Purchase imagery
Microcopy
Small visual details
```

It should NOT come from:

```text
Fan art
Artist logos
Member photos
Heavy neon
Album-cover backgrounds everywhere
Excessive stickers
```

This keeps the product usable regardless of the user's favorite artist or group.

---

# 49. Visual Consistency Rules

A component should have one standard appearance across the product.

For example:

```text
Primary Button
→ same everywhere

Tracking Badge
→ same everywhere

Payment Badge
→ same everywhere

Purchase Card
→ same everywhere
```

Do not create one-off styles for individual pages unless there is a clear UX reason.

---

# 50. Stitch Guidance

Stitch should be used to explore and validate the visual direction.

Stitch is NOT the source of truth for:

- database behavior
- business logic
- data relationships
- tracking rules
- OS rules
- product scope

The implementation should reproduce the approved visual direction while following:

```text
PRD.md
DATA_MODEL.md
UX_SPEC.md
```

---

# 51. Stitch Screens to Generate

Recommended screens:

1. Dashboard
2. Purchases List
3. Purchase Detail
4. Add Purchase — New Purchase
5. Add Purchase — Take OS
6. Batch List
7. Batch Detail
8. Finance
9. Create Source
10. Create Batch
11. Give OS confirmation
12. Mobile Dashboard
13. Mobile Purchase Detail

Not every screen needs to become a separate production page.

The purpose is to validate the system and key flows.

---

# 52. Design Validation Checklist

Before implementation, verify:

- Is the product visually distinct from a generic admin dashboard?
- Can users scan a purchase quickly?
- Is tracking status obvious?
- Is payment status obvious but not confused with tracking?
- Is Add Purchase immediately visible?
- Is the Group Order vs Direct Seller difference understandable?
- Is the UI still clean with 40–60 purchases?
- Does the UI work with long item/source names?
- Does the UI work when images are missing?
- Does the UI work with partial/unpaid purchases?
- Does the UI work with OS purchases?
- Does the UI work with stale batches?
- Does the mobile layout remain usable?

---

# 53. Non-Goals

The design system should NOT introduce:

- marketplace UI
- social feeds
- chat UI
- warehouse management UI
- courier tracking UI
- complex accounting dashboards
- AI assistant UI
- community profiles
- multi-user ownership interfaces

These are outside the MVP.

---

# 54. Source of Truth

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
Stitch
   ↓
Implementation
```

If Stitch introduces behavior that conflicts with the product documents, the product documents win.

If implementation requires new product behavior, update the relevant documentation before silently introducing it.

---

# 55. Next Step

After the Design System is approved:

```text
1. Create Stitch prompts
2. Generate high-fidelity screen concepts
3. Review visual direction
4. Select/refine the strongest direction
5. Give the approved docs + visual references to Claude
6. Implement the application in vertical slices
```
