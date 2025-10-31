# Notification Panel Visual Guide

## Panel Layout

```
┌─────────────────────────────────────────────────────┐
│  🔔 Notifications                    (20)    [X]    │  ← Header
│  ────────────────────────────────────────────────   │
│  [All] [Unread] [Friends] [Expenses] [Budgets]     │  ← Filter Tabs
│  ────────────────────────────────────────────────   │
│  [Mark all as read]  [Clear all]                    │  ← Action Buttons
│  ════════════════════════════════════════════════   │
│                                                      │
│  Today                                              │  ← Time Group Header
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│  ┌────────────────────────────────────────────┐    │
│  │ 💰  Payment Method Added             [🗑]  │    │  ← Notification Item (Unread)
│  │     New payment method 'creditPaid'        │    │
│  │     has been added for expense             │    │
│  │     5m ago                                  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 💰  Payment Method Added             [🗑]  │    │  ← Notification Item (Unread)
│  │     New payment method 'creditPaid'        │    │
│  │     has been added for expense             │    │
│  │     15m ago                                 │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Yesterday                                          │  ← Time Group Header
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│  ┌────────────────────────────────────────────┐    │
│  │ 👤  Friend Request Received          [🗑]  │    │  ← Notification Item (Read)
│  │     John Doe sent you a friend request     │    │
│  │     Yesterday                               │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ ⚠️  Budget Warning                   [🗑]  │    │  ← Notification Item (Read)
│  │     You've used 80% of your monthly        │    │
│  │     food budget                             │    │
│  │     Yesterday                               │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ════════════════════════════════════════════════   │
│             [⚙️ Notification Settings]              │  ← Footer
└─────────────────────────────────────────────────────┘
```

## Visual States

### Unread Notification (Blue Background)

```
┌────────────────────────────────────────────────────┐
│ 💰  Payment Method Added                    [🗑]  │
│     New payment method 'creditPaid' has been       │
│     added for expense                         •    │ ← Blue dot indicator
│     5m ago                                         │
└────────────────────────────────────────────────────┘
     ↑
 Light blue background (#eff6ff)
```

### Read Notification (White Background)

```
┌────────────────────────────────────────────────────┐
│ 💰  Payment Method Added                    [🗑]  │
│     New payment method 'creditPaid' has been       │
│     added for expense                              │
│     Yesterday                                      │
└────────────────────────────────────────────────────┘
     ↑
 White background (no blue)
```

## Icon Types by Notification Category

### 💰 Money/Finance (Green Background)

```
┌─────────────────────┐
│  ╔═══════╗          │
│  ║   $   ║          │ Dollar sign in circle
│  ╚═══════╝          │
└─────────────────────┘

Used for:
- PAYMENT_METHOD_ADDED
- PAYMENT_METHOD_UPDATED
- EXPENSE_ADDED
- BUDGET_CREATED
- BUDGET_UPDATED
```

### 👤 Person (Blue Background)

```
┌─────────────────────┐
│     ╭───╮           │
│     │   │           │ Person silhouette
│     ╰───╯           │
│      │ │            │
└─────────────────────┘

Used for:
- FRIEND_REQUEST_RECEIVED
- FRIEND_REQUEST_ACCEPTED
- FRIEND_REQUEST_REJECTED
```

### ⚠️ Warning (Yellow/Red Background)

```
┌─────────────────────┐
│      ⚠️              │
│     ╱ ╲              │ Triangle with exclamation
│    ╱ ! ╲             │
│   ╱─────╲            │
└─────────────────────┘

Used for:
- BUDGET_WARNING
- BUDGET_EXCEEDED
- BILL_DUE_REMINDER
- BILL_OVERDUE
- UNUSUAL_SPENDING
```

### 📄 Bill/Receipt (Blue Background)

```
┌─────────────────────┐
│  ┌─────────────┐    │
│  │ ███         │    │ Credit card icon
│  │             │    │
│  │ ████  ████  │    │
│  └─────────────┘    │
└─────────────────────┘

Used for:
- BILL_DUE_REMINDER
- BILL_OVERDUE
- BILL_PAID
- BILL_CREATED
```

### ✅ Success/Check (Green Background)

```
┌─────────────────────┐
│      ╔═══╗          │
│      ║ ✓ ║          │ Checkmark in circle
│      ╚═══╝          │
└─────────────────────┘

Used for:
- Generic success messages
- Payment confirmed
- Action completed
```

### ℹ️ Info (Blue Background)

```
┌─────────────────────┐
│      ╔═══╗          │
│      ║ i ║          │ Info symbol in circle
│      ╚═══╝          │
└─────────────────────┘

Used for:
- CUSTOM_ALERT
- General information
- System messages
```

## Color Scheme

### Success (Green)

```css
Background: bg-green-100  (#dcfce7)
Text:       text-green-600 (#16a34a)
Border:     border-green-200

Example: ✅ "Payment Method Added"
```

### Error (Red)

```css
Background: bg-red-100  (#fee2e2)
Text:       text-red-600 (#dc2626)
Border:     border-red-200

Example: ⚠️ "Budget Exceeded"
```

### Warning (Yellow)

```css
Background: bg-yellow-100  (#fef3c7)
Text:       text-yellow-600 (#ca8a04)
Border:     border-yellow-200

Example: ⚠️ "Budget Warning - 80% used"
```

### Info (Blue)

```css
Background: bg-blue-100  (#dbeafe)
Text:       text-blue-600 (#2563eb)
Border:     border-blue-200

Example: ℹ️ "System Update Available"
```

## Notification Badge

### Header Notification Bell

```
    🔔                  ← Bell icon
   ┌──┐
   │20│                ← Red badge with count
   └──┘
```

### Badge States

```
No unread:    🔔               (no badge)
1-9 unread:   🔔 [5]           (small badge)
10-99 unread: 🔔 [45]          (medium badge)
99+ unread:   🔔 [99+]         (max out at 99+)
```

## Filter States

### Active Filter (Blue)

```
┌───────────────────────────────────────────┐
│ [All] [Unread] [Friends] [Expenses] [Budgets] │
│  ^^^                                           │
│  └── Active (blue background, white text)     │
└───────────────────────────────────────────────┘
```

### Inactive Filter (Gray)

```
┌───────────────────────────────────────────┐
│ [All] [Unread] [Friends] [Expenses] [Budgets] │
│        ^^^^^^                                  │
│        └── Inactive (gray bg, dark text)      │
└───────────────────────────────────────────────┘
```

## Connection Status

### Connected (Green WiFi Icon)

```
🔔 Notifications  (5)  [WiFi✓]
                        ^^^^
                   Green indicator - Real-time updates active
```

### Disconnected (Red WiFi Icon)

```
🔔 Notifications  (5)  [WiFi✗]
                        ^^^^
                   Red indicator - Using polling instead
```

## Empty States

### No Notifications

```
┌─────────────────────────────────────────────┐
│                                             │
│              🔔                             │
│         (large gray bell)                   │
│                                             │
│         No notifications                    │
│         You're all caught up!               │
│                                             │
└─────────────────────────────────────────────┘
```

### No Unread Notifications (with Filter)

```
┌─────────────────────────────────────────────┐
│                                             │
│              🔔                             │
│         (large gray bell)                   │
│                                             │
│         No unread notifications             │
│         You're all caught up!               │
│                                             │
└─────────────────────────────────────────────┘
```

### No Results for Filter

```
┌─────────────────────────────────────────────┐
│                                             │
│              🔍                             │
│         (large gray search)                 │
│                                             │
│         No friend requests                  │
│         Try changing the filter             │
│                                             │
└─────────────────────────────────────────────┘
```

## Hover Effects

### Notification Hover

```
┌────────────────────────────────────────────┐
│ 💰  Payment Method Added            [🗑]  │  ← Cursor pointer
│     New payment method added              │  ← Slightly darker bg
│     5m ago                                 │
└────────────────────────────────────────────┘
        ↑
  Background changes on hover
  Cursor changes to pointer
```

### Delete Button Hover

```
┌────────────────────────────────────────────┐
│ 💰  Payment Method Added            [🗑]  │
│     New payment method added           ^   │  ← Cursor pointer
│     5m ago                             |   │  ← Icon turns red
└────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 768px)

```
Width: 384px (w-96)
Position: Absolute right-0
Max Height: calc(100vh - 100px)
```

### Tablet (768px - 1024px)

```
Width: 384px (w-96)
Position: Fixed right
Overlay: Dark backdrop
```

### Mobile (< 768px)

```
Width: 100vw (full width)
Position: Fixed
Overlay: Full screen with backdrop
Slide in from right animation
```

## Time Formatting

```
Just now      →  < 1 minute ago
5m ago        →  5 minutes ago
2h ago        →  2 hours ago
Yesterday     →  1 day ago
3d ago        →  3 days ago
2w ago        →  2 weeks ago
3mo ago       →  3 months ago
Oct 31, 2024  →  > 1 year ago (shows date)
```

## Animation States

### Panel Opening

```
Frame 1:  [    ]  opacity: 0,     transform: translateX(20px)
Frame 2:  [ →  ]  opacity: 0.5,   transform: translateX(10px)
Frame 3:  [  → ]  opacity: 0.75,  transform: translateX(5px)
Frame 4:  [   →]  opacity: 1,     transform: translateX(0)

Duration: 200ms
Easing: ease-out
```

### Notification Adding

```
New notification slides in from top
Duration: 300ms
Easing: ease-in-out
Highlight: Brief yellow flash
```

### Notification Removing

```
Frame 1:  [████]  opacity: 1,     height: 100px
Frame 2:  [▓▓▓▓]  opacity: 0.5,   height: 50px
Frame 3:  [░░░░]  opacity: 0.25,  height: 25px
Frame 4:  [    ]  opacity: 0,     height: 0

Duration: 250ms
Easing: ease-in
```

## Example: Your API Response Rendered

Based on your API response, here's what ONE notification looks like:

```
┌──────────────────────────────────────────────────────┐
│  💰  Payment Method Added                     [🗑]   │
│      New payment method 'creditPaid' has been        │
│      added for expense                          •    │
│      5m ago                                          │
└──────────────────────────────────────────────────────┘

Breakdown:
- Icon: 💰 (Money) - because type is PAYMENT_METHOD_ADDED
- Color: Green background - because category is SUCCESS
- Title: "Payment Method Added" (from API title field)
- Message: "New payment method 'creditPaid'..." (from API message)
- Unread: Blue background + dot (because isRead is false)
- Time: "5m ago" (calculated from createdAt timestamp)
- Metadata: Stored but not visible (used for navigation)
```

## Accessibility

### Screen Reader Friendly

```html
<div role="region" aria-label="Notifications panel">
  <button aria-label="Notifications, 5 unread">
    <svg aria-hidden="true">...</svg>
    <span class="sr-only">Notifications</span>
  </button>
</div>
```

### Keyboard Navigation

```
Tab       → Focus next notification
Shift+Tab → Focus previous notification
Enter     → Open/Click notification
Delete    → Delete focused notification
Escape    → Close panel
```

### Focus States

```
┌────────────────────────────────────────────┐
│ 💰  Payment Method Added            [🗑]  │
│ ║   New payment method added           ║  │ ← Focus ring (blue)
│ ║   5m ago                              ║  │
└────────────────────────────────────────────┘
```

---

This visual guide shows exactly how your notifications from the API will appear in the UI! 🎨
