# PHASE 9.5 - COMPLETE TILE FIX

## PROBLEMS
1. Hover not working (UI5 Card blocks events)
2. Icon position inconsistent between tiles
3. Icon too small

## SOLUTION
Wrap the Card in a div and handle hover on the wrapper.
Use absolute positioning for icon to ensure consistent placement.

---

## REPLACE ENTIRE TileCard COMPONENT

In `frontend/src/pages/LaunchpadPage.tsx`, replace the TileCard function with:

```tsx
// Tile Card Component
interface TileCardProps {
  tile: Tile;
  onClick: () => void;
}

function TileCard({ tile, onClick }: TileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '176px',
        height: '176px',
        cursor: 'pointer',
        borderRadius: '16px',
        boxShadow: isHovered
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        background: isHovered ? '#f0f0f0' : '#ffffff',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* ===== CONTENT AREA (Top) ===== */}
      <div
        style={{
          padding: '16px',
          paddingBottom: '56px', /* Leave space for icon */
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 600,
            fontSize: '14px',
            color: '#1d2d3e',
            marginBottom: '6px',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}
        >
          {tile.name}
        </div>

        {/* Subtitle - GRAY */}
        <div
          style={{
            color: '#6a6d70',
            fontSize: '12px',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}
        >
          {tile.description || ''}
        </div>
      </div>

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
          style={{
            fontSize: '2rem',
            color: '#6a6d70',
          }}
        />
      </div>
    </div>
  );
}
```

---

## KEY CHANGES

1. **Use div wrapper instead of Card** - This ensures hover events work
2. **Absolute position for icon** - Icon always at bottom-left, consistent across all tiles
3. **Bigger icon** - Using `2rem` (32px)
4. **Better hover effect** - Background changes to `#f0f0f0` (more visible)
5. **paddingBottom on content** - Leaves space for absolutely positioned icon

---

## MAKE SURE useState IS IMPORTED

At the top of the file, ensure:
```tsx
import { useState, useEffect, useRef } from 'react';
```

---

## TEST

http://localhost:3000/launchpad

- [ ] Hover changes background to gray (#f0f0f0)
- [ ] Hover adds shadow
- [ ] Icon is at SAME position (bottom-left) on ALL tiles
- [ ] Icon is bigger (32px / 2rem)
