# PHASE 9.5 - FIX HOVER COLOR (React State)

## PROBLEM
CSS hover not working on tiles because UI5 Card uses Shadow DOM which blocks external CSS.

## SOLUTION
Use React state to handle hover, apply background color directly in inline style.

---

## UPDATED TileCard COMPONENT

Replace the TileCard function in `frontend/src/pages/LaunchpadPage.tsx`:

```tsx
import { useState } from 'react';

// Tile Card Component
interface TileCardProps {
  tile: Tile;
  onClick: () => void;
}

function TileCard({ tile, onClick }: TileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onClick={onClick}
      className="tile-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '176px',
        height: '176px',
        cursor: 'pointer',
        borderRadius: '16px',
        border: 'none',
        boxShadow: isHovered 
          ? '0 4px 12px rgba(0,0,0,0.12)' 
          : '0 0 0 1px rgba(0,0,0,0.06)',
        background: isHovered ? '#f5f6f7' : '#ffffff',  /* HOVER COLOR CHANGE */
        overflow: 'hidden',
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* ===== CONTENT AREA (Top) ===== */}
      <div
        style={{
          padding: '16px 16px 8px 16px',
          height: 'calc(100% - 48px)',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left'
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
            WebkitBoxOrient: 'vertical'
          } as React.CSSProperties}
        >
          {tile.name}
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
            WebkitBoxOrient: 'vertical'
          } as React.CSSProperties}
        >
          {tile.description || 'Application'}
        </div>
      </div>

      {/* ===== ICON AREA (Bottom/Footer) ===== */}
      <div
        style={{
          padding: '0 16px 16px 16px',
          height: '48px',
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <Icon
          name={tile.icon || 'document'}
          style={{
            fontSize: '32px',
            color: '#6a6d70'
          }}
        />
      </div>
    </Card>
  );
}
```

---

## KEY CHANGES

1. Add `useState` for hover state:
   ```tsx
   const [isHovered, setIsHovered] = useState(false);
   ```

2. Add mouse event handlers to Card:
   ```tsx
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
   ```

3. Use conditional styles based on hover:
   ```tsx
   background: isHovered ? '#f5f6f7' : '#ffffff',
   boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.12)' : '0 0 0 1px rgba(0,0,0,0.06)',
   ```

---

## TEST

http://localhost:3000/launchpad

- [ ] Hover on tile → background changes to light gray (#f5f6f7)
- [ ] Hover on tile → shadow appears
- [ ] Mouse leave → returns to white background
