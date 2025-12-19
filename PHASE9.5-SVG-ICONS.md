# PHASE 9.5 - USE SVG ICONS

## PROBLEM
UI5 Icon component not rendering properly or sizing correctly.

## SOLUTION
Use inline SVG icons instead of UI5 Icon component.

---

## SVG ICON MAPPING

Create a helper function to map icon names to SVG:

```tsx
// SVG Icon Component
const TileIcon = ({ name, size = 32, color = '#6a6d70' }: { name: string; size?: number; color?: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    'document': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    'money-bills': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <circle cx="12" cy="12" r="3" />
        <line x1="1" y1="8" x2="4" y2="8" />
        <line x1="20" y1="8" x2="23" y2="8" />
        <line x1="1" y1="16" x2="4" y2="16" />
        <line x1="20" y1="16" x2="23" y2="16" />
      </svg>
    ),
    'form': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    'customer': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    'employee': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    'it-instance': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    'table-view': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    'checklist-item': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    'request': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    'default': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  };

  return icons[name] || icons['default'];
};
```

---

## UPDATED TileCard COMPONENT

```tsx
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
      {/* ===== CONTENT AREA ===== */}
      <div style={{ padding: '16px', paddingBottom: '56px' }}>
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

        {/* Subtitle */}
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

      {/* ===== SVG ICON (Absolute bottom-left) ===== */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
        }}
      >
        <TileIcon name={tile.icon || 'default'} size={32} color="#6a6d70" />
      </div>
    </div>
  );
}
```

---

## FULL FILE STRUCTURE

Add the TileIcon component BEFORE the TileCard component:

```tsx
// ... imports ...

// SVG Icon Component (add this before TileCard)
const TileIcon = ({ name, size = 32, color = '#6a6d70' }: { name: string; size?: number; color?: string }) => {
  // ... icon mapping code from above ...
};

// Tile Card Component
function TileCard({ tile, onClick }: TileCardProps) {
  // ... tile card code from above ...
}

// ... rest of file ...
```

---

## TEST

http://localhost:3000/launchpad

- [ ] SVG icons render correctly
- [ ] Icons are 32px size
- [ ] Icons are gray (#6a6d70)
- [ ] Icons at same position (bottom-left) on all tiles
- [ ] Hover works (background changes)
