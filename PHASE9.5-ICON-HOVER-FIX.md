# PHASE 9.5 - ICON & HOVER FIXES

## CURRENT STATUS
✅ Tiles are square (176x176)
✅ Two separate areas (content + icon)
✅ Icon is alone at bottom

## FIXES NEEDED

### 1. ICON COLOR: Change from BLUE to GRAY
```
Current: color: '#0064d9' (blue)
Fix: color: '#6a6d70' (gray)
```

### 2. ICON SIZE: Make BIGGER
```
Current: fontSize: '24px'
Fix: fontSize: '32px' or '2rem'
```

### 3. ICON POSITION: Top-left of icon section (not bottom)
```
Current: alignItems: 'flex-end'
Fix: alignItems: 'flex-start'
```

### 4. HOVER: Add background color change
```css
.tile-card:hover {
  background-color: #f5f6f7 !important;  /* Light gray background */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
```

---

## UPDATED ICON AREA CODE

```tsx
{/* ===== ICON AREA (Bottom) ===== */}
<div
  style={{
    padding: '0 16px 16px 16px',
    height: '48px',
    display: 'flex',
    alignItems: 'flex-start',  /* TOP of icon area */
  }}
>
  <Icon 
    name={tile.icon || 'document'} 
    style={{ 
      fontSize: '32px',      /* BIGGER */
      color: '#6a6d70'       /* GRAY */
    }} 
  />
</div>
```

---

## UPDATED CSS (frontend/src/index.css)

```css
/* SAP Fiori Tile Styling */
.tile-card {
  background: #ffffff !important;
  transition: background-color 0.15s ease, box-shadow 0.15s ease !important;
  user-select: none !important;
}

.tile-card:hover {
  background-color: #f5f6f7 !important;  /* Gray background on hover */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

/* Disable text selection */
.launchpad-container,
.tile-card,
.section-title {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  user-select: none !important;
}
```

---

## SUMMARY OF CHANGES

| Property | Before | After |
|----------|--------|-------|
| Icon color | Blue (#0064d9) | **Gray (#6a6d70)** |
| Icon size | 24px | **32px** |
| Icon position | Bottom of area | **Top of area** |
| Hover background | None? | **#f5f6f7 (light gray)** |
| Hover shadow | ✅ Already good | Keep same |

---

## TEST

http://localhost:3000/launchpad

- [ ] Icon is GRAY (not blue)
- [ ] Icon is BIGGER (32px)
- [ ] Icon at TOP-LEFT of icon section
- [ ] Hover changes background to light gray + shadow
