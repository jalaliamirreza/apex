# Phase 9.5: Visual Polish - Enterprise Look

## Objective
Transform APEX to SYNCRO with professional enterprise branding, Royal Blue + Cyan theme.

---

## 1. Color Palette

### CSS Variables (add to frontend/src/index.css)

```css
:root {
  /* Brand Colors */
  --color-royal-blue: #4169E1;
  --color-cyan: #06B6D4;
  --color-gradient: linear-gradient(135deg, #4169E1 0%, #06B6D4 100%);
  
  /* Text Colors */
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  
  /* Background Colors */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F3F4F6;
  --color-bg-tertiary: #E5E7EB;
  
  /* Status Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* UI5 Overrides */
  --sapBrandColor: #4169E1;
  --sapHighlightColor: #4169E1;
  --sapActiveColor: #06B6D4;
  --sapLinkColor: #4169E1;
}
```

---

## 2. Logo SVG

### Create folder and files:

```
frontend/
├── public/           ← CREATE this folder
│   ├── logo.svg      ← Logo icon only
│   └── logo-full.svg ← Logo with text
```

OR use src/assets:

```
frontend/src/
├── assets/           ← CREATE this folder
│   ├── logo.svg
│   └── logo-full.svg
```

### Create file: frontend/public/logo.svg (or frontend/src/assets/logo.svg)

```svg
<svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4169E1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Globe/Network shape similar to SYNCRO logo -->
  <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logoGradient)" stroke-width="2"/>
  <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="url(#logoGradient)" stroke-width="2"/>
  <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke="url(#logoGradient)" stroke-width="2" transform="rotate(45 50 50)"/>
  <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke="url(#logoGradient)" stroke-width="2" transform="rotate(-45 50 50)"/>
  <!-- Center dot -->
  <circle cx="50" cy="50" r="5" fill="url(#logoGradient)"/>
</svg>
```

### Also create: frontend/public/logo-full.svg (with text)

```svg
<svg width="160" height="40" viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4169E1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Globe icon -->
  <g transform="translate(5, 5) scale(0.3)">
    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logoGradient)" stroke-width="3"/>
    <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="url(#logoGradient)" stroke-width="3"/>
    <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke="url(#logoGradient)" stroke-width="3" transform="rotate(45 50 50)"/>
    <circle cx="50" cy="50" r="5" fill="url(#logoGradient)"/>
  </g>
  <!-- SYNCRO text -->
  <text x="45" y="28" font-family="Vazirmatn, sans-serif" font-size="22" font-weight="600" fill="#1F2937">
    SYNCRO
  </text>
</svg>
```

---

## 3. Shell Bar Updates

### Update frontend/src/pages/LaunchpadPage.tsx

Replace ShellBar component:

```tsx
<ShellBar
  logo={
    <img 
      src="/logo.svg" 
      alt="SYNCRO" 
      style={{ height: '36px', cursor: 'pointer' }} 
    />
  }
  primaryTitle="SYNCRO"
  secondaryTitle=""
  showNotifications
  notificationsCount="3"
  onNotificationsClick={handleNotificationsClick}
  profile={
    <Avatar 
      size="S" 
      initials="ع‌ا"
      colorScheme="Accent6"
      style={{ cursor: 'pointer' }}
    />
  }
  onProfileClick={handleProfileClick}
  onLogoClick={() => navigate('/launchpad')}
>
  {/* User name next to avatar */}
  <ShellBarItem 
    icon="person-placeholder" 
    text="علی احمدی"
    onClick={handleProfileClick}
  />
</ShellBar>
```

---

## 4. Profile Dropdown

### Add state and handler:

```tsx
const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
const profileRef = useRef<HTMLDivElement>(null);

const handleProfileClick = () => {
  setProfilePopoverOpen(!profilePopoverOpen);
};

const handleMenuItemClick = (action: string) => {
  setProfilePopoverOpen(false);
  switch(action) {
    case 'profile':
      // TODO: Navigate to profile page
      console.log('Profile clicked');
      break;
    case 'settings':
      // TODO: Navigate to settings page
      console.log('Settings clicked');
      break;
    case 'about':
      // TODO: Show about dialog
      console.log('About clicked');
      break;
    case 'signout':
      // TODO: Implement sign out
      console.log('Sign out clicked');
      break;
  }
};
```

### Add Popover component:

```tsx
<Popover
  open={profilePopoverOpen}
  opener={profileRef.current!}
  onClose={() => setProfilePopoverOpen(false)}
  placementType="Bottom"
  horizontalAlign="End"
>
  <List onItemClick={(e) => {
    const action = (e.detail.item as any).dataset.action;
    handleMenuItemClick(action);
  }}>
    <StandardListItem 
      icon="person-placeholder" 
      data-action="profile"
    >
      Profile
    </StandardListItem>
    <StandardListItem 
      icon="action-settings" 
      data-action="settings"
    >
      Settings
    </StandardListItem>
    <StandardListItem 
      icon="hint" 
      data-action="about"
    >
      About
    </StandardListItem>
    <StandardListItem 
      icon="log" 
      data-action="signout"
      style={{ color: 'var(--color-error)' }}
    >
      Sign Out
    </StandardListItem>
  </List>
</Popover>
```

---

## 5. Notification Panel

### Add state:

```tsx
const [notificationsOpen, setNotificationsOpen] = useState(false);
const notificationsRef = useRef<HTMLDivElement>(null);

// Sample notifications (hardcoded for now)
const notifications = [
  { id: 1, title: 'Loan request approved', time: '5 minutes ago', type: 'success' },
  { id: 2, title: 'Leave request pending review', time: '1 hour ago', type: 'warning' },
  { id: 3, title: 'New form added', time: '2 hours ago', type: 'info' },
];
```

### Add Popover:

```tsx
<Popover
  open={notificationsOpen}
  opener={notificationsRef.current!}
  onClose={() => setNotificationsOpen(false)}
  placementType="Bottom"
  horizontalAlign="End"
  style={{ width: '320px' }}
>
  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e5e5e5' }}>
    <Title level="H5">Notifications</Title>
  </div>
  <List>
    {notifications.map(notif => (
      <StandardListItem
        key={notif.id}
        description={notif.time}
        icon={
          notif.type === 'success' ? 'accept' :
          notif.type === 'warning' ? 'alert' : 'hint'
        }
      >
        {notif.title}
      </StandardListItem>
    ))}
  </List>
  <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #e5e5e5', textAlign: 'center' }}>
    <Link>View All</Link>
  </div>
</Popover>
```

---

## 6. Apply Theme to Components

### Update Shell Bar style:

```tsx
<ShellBar
  style={{
    background: 'linear-gradient(90deg, #4169E1 0%, #06B6D4 100%)',
  }}
  // ... other props
/>
```

### Update Tab active color (in index.css):

```css
/* Active tab indicator */
ui5-tab[selected]::part(root) {
  border-bottom-color: var(--color-royal-blue) !important;
}

ui5-tab[selected] {
  color: var(--color-royal-blue) !important;
}

/* Section title underline */
.section-title {
  border-bottom: 2px solid var(--color-royal-blue);
}
```

---

## 7. Files Summary

| File | Action |
|------|--------|
| `frontend/public/logo.svg` | CREATE |
| `frontend/public/logo-full.svg` | CREATE |
| `frontend/src/index.css` | UPDATE - Add color variables |
| `frontend/src/pages/LaunchpadPage.tsx` | UPDATE - Shell Bar, dropdowns |

---

## 8. Expected Result

```
┌─────────────────────────────────────────────────────────────────┐
│ [🌐] SYNCRO                            🔔3    علی احمدی [👤▼] │
│ ═══════════════════════════════════════════════════════════════ │
│  gradient background (Royal Blue → Cyan)                        │
├─────────────────────────────────────────────────────────────────┤
│                                           ┌─────────────────┐   │
│                                           │ 👤 پروفایل      │   │
│                                           │ ⚙️ تنظیمات      │   │
│                                           │ ℹ️ درباره       │   │
│                                           │ 🚪 خروج         │   │
│                                           └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ مالی و اعتبارات | ▼    منابع انسانی | ▼    فناوری اطلاعات       │
│                                                                 │
│  وام‌های شخصی                                                    │
│  ─────────────── (Royal Blue underline)                        │
│  [Tile] [Tile] [Tile]                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Note: Logo Image

The SYNCRO logo PNG is at: `frontend/public/logo-original.png`

Claude Code should:
1. Use the PNG directly for the shell bar logo
2. Optionally create an SVG version for better scaling

---

## SAP Icons (Already Included)

No download needed. Icons come with `@ui5/webcomponents-icons`.

### Icons to Use:

| Icon Name | Usage |
|-----------|-------|
| `home` | Home/Launchpad |
| `bell` | Notifications |
| `person-placeholder` | User/Profile |
| `action-settings` | Settings |
| `hint` | About/Info |
| `log` | Sign Out |
| `search` | Search |
| `accept` | Success |
| `alert` | Warning |
| `decline` | Error |

### Usage:
```tsx
import '@ui5/webcomponents-icons/dist/AllIcons';
import { Icon } from '@ui5/webcomponents-react';

<Icon name="bell" />
```

---

## Prompt for Claude Code

```
Read PHASE9.5-VISUAL-POLISH.md in the repo root.

Implement enterprise visual polish for SYNCRO:

1. Create logo files:
   - frontend/public/logo.svg (icon only)
   - frontend/public/logo-full.svg (icon + text)

2. Update frontend/src/index.css:
   - Add color palette CSS variables
   - Add UI5 theme overrides
   - Update tab and section styles

3. Update frontend/src/pages/LaunchpadPage.tsx:
   - Replace ShellBar with SYNCRO branding
   - Add gradient background to shell bar
   - Add user name "علی احمدی" display
   - Add profile dropdown (پروفایل، تنظیمات، درباره، خروج)
   - Add notifications panel popover

4. Test at http://localhost:3000/launchpad:
   - Logo visible
   - Gradient shell bar
   - User name shown
   - Profile dropdown works
   - Notifications panel works
   - Royal Blue + Cyan theme applied

Update SETUP.md after completing.
```
