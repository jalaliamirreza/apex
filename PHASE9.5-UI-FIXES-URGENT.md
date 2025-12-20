# PHASE 9.5 - URGENT UI FIXES

## SAP FIORI TILE STRUCTURE

SAP tiles have **TWO SEPARATE AREAS**:

```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │ CONTENT AREA        │ │  ← Title + Subtitle
│ │ Title               │ │
│ │ Subtitle            │ │
│ │                     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ICON AREA (footer)  │ │  ← Icon only, fixed height
│ │ 🔲                  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
      176px × 176px
```

---

## OFFICIAL SAP TILE SIZES

| Type | Grid | Size |
|------|------|------|
| **Standard Tile** | **2x2** | **176px × 176px** (SQUARE) |
| Flat Tile | 2x1 | 176px × 88px |
| Wide Tile | 4x2 | 352px × 176px |

---

## FILE TO FIX
frontend/src/pages/LaunchpadPage.tsx
frontend/src/index.css

---

## CORRECT TILE COMPONENT (with separated areas)

```tsx
const TileCard = ({ tile, onClick }: { tile: any; onClick: () => void }) => {
  return (
    <Card
      onClick={onClick}
      className="tile-card"
      style={{
        width: '176px',
        height: '176px',
        cursor: 'pointer',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* ===== CONTENT AREA (Top) ===== */}
      <div
        style={{
          padding: '16px 16px 8px 16px',
          height: 'calc(100% - 48px)',  /* Leave space for icon area */
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 600,
            fontSize: '14px',
            color: '#1d2d3e',
            marginBottom: '4px',
            lineHeight: '1.3',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {tile.title}
        </div>
        
        {/* Subtitle - GRAY */}
        <div
          style={{
            color: '#6a6d70',
            fontSize: '13px',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {tile.description}
        </div>
      </div>
      
      {/* ===== ICON AREA (Bottom/Footer) ===== */}
      <div
        style={{
          padding: '0 16px 16px 16px',
          height: '48px',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Icon 
          name={tile.icon || 'document'} 
          style={{ 
            fontSize: '24px', 
            color: '#0064d9' 
          }} 
        />
      </div>
    </Card>
  );
};
```

---

## CSS (frontend/src/index.css)

```css
/* SAP Fiori Tile Styling */
.tile-card {
  background: #ffffff !important;
  transition: background-color 0.15s ease, box-shadow 0.15s ease !important;
  user-select: none !important;
}

.tile-card:hover {
  background-color: #f5f6f7 !important;
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

## AREA BREAKDOWN

| Area | Height | Contains |
|------|--------|----------|
| Content Area | ~128px (176 - 48) | Title + Subtitle |
| Icon Area | 48px (fixed) | Icon only |

---

## CRITICAL REQUIREMENTS

1. ✅ **Size: 176px × 176px** (SQUARE)
2. ✅ **Two separate areas** - Content area + Icon area
3. ✅ **Content area**: Title (bold) + Subtitle (gray)
4. ✅ **Icon area**: Fixed 48px height, icon at bottom-left
5. ✅ **Icon NOT inline with text** - separate area!
6. ✅ **Hover: gray background**
7. ✅ **className="tile-card"**

---

## TEST

http://localhost:3000/launchpad

- [ ] Tiles are SQUARE (176 × 176)
- [ ] Content area at top (title + subtitle)
- [ ] Icon area at bottom (icon ALONE, separate from text)
- [ ] Hover shows gray background
