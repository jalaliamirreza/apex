# PHASE 9.5 - CORRECT SAP ICON FIX

## PROBLEM
Using wrong icon approach. UI5 Icon has versions:
- **SAP Icons v4** - Old filled style (sap_fiori_3 theme)
- **SAP Icons v5** - New outline style (sap_horizon theme)

## SOLUTION

### Option 1: Force SAP Icons v5 (Outline Style)
Use `SAP-icons-v5/` prefix to force Horizon-style outline icons:

```tsx
<Icon name="SAP-icons-v5/document" />
<Icon name="SAP-icons-v5/money-bills" />
```

### Option 2: Set Horizon Theme Globally
This automatically uses v5 icons:

In `frontend/src/main.tsx` or `index.tsx`:
```tsx
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
setTheme("sap_horizon");
```

---

## ROLLBACK FIRST

Before applying fix, rollback to working state:

```bash
git reset --hard 898464d
```

This goes back to "Phase 9.5 - SYNCRO UI Polish (SAP Fiori Match)" commit.

---

## THEN APPLY SIMPLE FIX

In `frontend/src/pages/LaunchpadPage.tsx`, the TileCard Icon:

```tsx
<Icon
  name="SAP-icons-v5/{tile.icon || 'document'}"
  style={{
    fontSize: '2rem',
    color: '#6a6d70'
  }}
/>
```

Or use template literal:
```tsx
<Icon
  name={`SAP-icons-v5/${tile.icon || 'document'}`}
  style={{
    fontSize: '2rem',
    color: '#6a6d70'
  }}
/>
```

---

## ICON SIZE WITH CSS

Add to `frontend/src/index.css`:

```css
/* Force icon size in tiles */
.tile-card [ui5-icon] {
  width: 2rem !important;
  height: 2rem !important;
}
```

---

## TEST

- [ ] Icons show outline style (not filled)
- [ ] Icons are correct size
- [ ] Hover works
