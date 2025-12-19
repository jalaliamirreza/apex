# PHASE 9.5 - FORCE ICON SIZE

## PROBLEM
UI5 Icon doesn't respect `fontSize` style - it uses internal CSS variables.

## SOLUTION
Use `width` and `height` directly, plus CSS to override UI5 internal styles.

---

## FIX 1: Update Icon in TileCard (LaunchpadPage.tsx)

Replace the Icon section with:

```tsx
{/* ===== ICON (Absolute positioned at bottom-left) ===== */}
<div
  style={{
    position: 'absolute',
    bottom: '16px',
    left: '16px',
  }}
>
  <Icon
    name={tile.icon || 'document'}
    className="tile-icon"
    style={{
      width: '32px',
      height: '32px',
      fontSize: '32px',
      color: '#6a6d70',
      display: 'block',
    }}
  />
</div>
```

---

## FIX 2: Add CSS to force icon size (index.css)

Add this to `frontend/src/index.css`:

```css
/* Force UI5 Icon size in tiles */
.tile-icon,
.tile-icon svg,
.tile-icon [ui5-icon],
[ui5-icon].tile-icon {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  font-size: 32px !important;
  --sapContent_IconHeight: 32px !important;
  --sapContent_IconWidth: 32px !important;
}

/* Target the internal SVG of UI5 Icon */
.tile-icon::part(root),
.tile-icon::part(icon) {
  width: 32px !important;
  height: 32px !important;
}
```

---

## ALTERNATIVE: Use native img with SAP icon font (if CSS doesn't work)

If the above doesn't work, use a wrapper div with fixed size:

```tsx
{/* ===== ICON ===== */}
<div
  style={{
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }}
>
  <Icon
    name={tile.icon || 'document'}
    style={{
      color: '#6a6d70',
      transform: 'scale(2)',  /* Force scale up */
    }}
  />
</div>
```

---

## ALTERNATIVE 2: Use Lucide React icons (guaranteed to work)

Install lucide-react and use native SVG icons:

```bash
cd frontend && npm install lucide-react
```

Then in LaunchpadPage.tsx:

```tsx
import { FileText, DollarSign, Users, Monitor, Table, CheckSquare, HelpCircle } from 'lucide-react';

// Icon mapping
const iconMap: { [key: string]: any } = {
  'document': FileText,
  'money-bills': DollarSign,
  'customer': Users,
  'employee': Users,
  'it-instance': Monitor,
  'table-view': Table,
  'checklist-item': CheckSquare,
  'default': HelpCircle,
};

// In TileCard:
const IconComponent = iconMap[tile.icon] || iconMap['default'];

// Render:
<div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
  <IconComponent size={32} color="#6a6d70" strokeWidth={1.5} />
</div>
```

---

## TEST

http://localhost:3000/launchpad

- [ ] Icon is 32px size (bigger than before)
- [ ] Icon is gray (#6a6d70)
- [ ] Icon at same position on all tiles
