# SAP Icons v5 (Horizon Theme) - Correct Usage

## The Problem
Current icons are using old filled style (v4). Need outline style (v5) like SAP Fiori Horizon.

## Solution: Use SAP-icons-v5 Prefix

### In LaunchpadPage.tsx

Change the Icon name from:
```tsx
<Icon name={tile.icon || 'document'} />
```

To:
```tsx
<Icon name={`SAP-icons-v5/${tile.icon || 'document'}`} />
```

### Example
```tsx
// OLD (filled style)
<Icon name="document" />
<Icon name="money-bills" />
<Icon name="employee" />

// NEW (outline style - Horizon)
<Icon name="SAP-icons-v5/document" />
<Icon name="SAP-icons-v5/money-bills" />
<Icon name="SAP-icons-v5/employee" />
```

---

## Alternative: Set Horizon Theme Globally

In `frontend/src/main.tsx` add at the top:

```tsx
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
setTheme("sap_horizon");
```

This makes ALL icons automatically use v5 (outline) style without prefix.

---

## Icon Size Fix

UI5 Icon uses CSS variables. To resize, add to `frontend/src/index.css`:

```css
/* Force icon size in tiles */
.tile-icon {
  --sapContent_IconHeight: 2rem;
  --sapContent_IconWidth: 2rem;
  width: 2rem !important;
  height: 2rem !important;
}
```

And add className to Icon:
```tsx
<Icon 
  name={`SAP-icons-v5/${tile.icon || 'document'}`}
  className="tile-icon"
/>
```

---

## Available Icon Collections

| Collection | Prefix | Example |
|------------|--------|---------|
| SAP Icons v4 (filled) | `SAP-icons-v4/` | `SAP-icons-v4/document` |
| SAP Icons v5 (outline) | `SAP-icons-v5/` | `SAP-icons-v5/document` |
| TNT Icons | `tnt/` | `tnt/actor` |
| Business Suite | `business-suite/` | `business-suite/money` |

---

## Test

http://localhost:3000/launchpad

- [ ] Icons show outline style (thin lines, not filled)
- [ ] Icons are 2rem size (32px)
- [ ] Icons are gray (#6a6d70)
