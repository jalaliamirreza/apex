# APEX Frontend Polish - SAP Fiori Launchpad Style

## Reference Design
See screenshots from real SAP Fiori Launchpad (S/4HANA).

## Current Issues to Fix

### 1. Click Events Not Working
- Card tiles on HomePage and FormsListPage don't respond to clicks
- Navigation via onClick handlers is broken
- **Action:** Debug and fix all click handlers

### 2. TypeScript/Syntax Errors
- Previous errors with Badge, TableColumn, etc.
- **Action:** Run `npm run build` and `npx tsc --noEmit` to catch ALL errors before deployment
- Fix all type errors and missing exports

## Design Specification (Match SAP Fiori Launchpad)

### Shell Bar (Top Navigation)
```
[SAP Logo] [Home ▼] ............................ [🔍] [❓] [🔔] [BD]
```
- SAP logo on left (use APEX logo or text)
- "Home" dropdown menu
- Right side: Search, Help, Notifications, User Avatar with initials
- Background: White
- Height: ~48px

### Secondary Navigation Bar
```
[☰] [My Home] [Fiori Launchpad] [Recipe Development Administration] [More ▼]
```
- Hamburger menu icon on left
- Horizontal tabs for different sections/spaces
- Active tab: Blue text with blue underline
- "More" dropdown for overflow
- Background: White with subtle bottom border

### Tile Groups (Main Content)
```
Section Title (e.g., "Recipes")
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │ │             │
│ Tile Title  │ │ Tile Title  │ │ Tile Title  │ │ Tile Title  │
│ Subtitle    │ │             │ │             │ │ Subtitle    │
│             │ │             │ │             │ │             │
│    [Icon]   │ │    [Icon]   │ │    [Icon]   │ │    [Icon]   │
│             │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Tile Styling
- **Size:** ~160px x 160px (square-ish)
- **Background:** White
- **Border:** 1px solid #e5e5e5, border-radius: 8px
- **Shadow:** Subtle box-shadow on hover
- **Selected/Focus:** Blue border (#0a6ed1)
- **Layout:**
  - Title at TOP (bold, dark text)
  - Subtitle below title (gray, smaller)
  - Icon at BOTTOM (large, ~48px, gray/blue)
- **Hover:** Slight shadow elevation
- **Click:** Entire tile is clickable

### Colors
- Primary Blue: #0a6ed1
- Background: #f7f7f7
- Tile Background: #ffffff
- Text Dark: #32363a
- Text Gray: #6a6d70
- Border: #e5e5e5
- Selected Border: #0a6ed1

### Typography
- Section Title: 16px, semi-bold, dark
- Tile Title: 14px, semi-bold, dark
- Tile Subtitle: 12px, regular, gray
- Font Family: "72" or system sans-serif

## Pages to Update

### 1. HomePage.tsx
- Match Fiori Launchpad layout exactly
- Group tiles by section (e.g., "Forms", "Administration")
- Tiles: View Forms, Search Submissions, (future: Create Form, Settings)
- Icon at bottom of tile, not in header

### 2. FormsListPage.tsx
- Section title: "Available Forms" 
- Each form as a square tile
- Form name as title, description as subtitle
- Document icon at bottom
- Clickable entire tile → navigates to form

### 3. App.tsx (Shell)
- ShellBar with proper icons (search, help, notifications, avatar)
- Consider adding secondary navigation bar for future sections

### 4. All Pages
- Consistent styling
- Proper loading states
- Error handling

## Implementation Instructions for Claude Code

1. **First:** Run type checking
   ```bash
   cd frontend
   npm run build
   ```
   Fix ALL TypeScript errors before proceeding.

2. **Then:** Update components to match Fiori Launchpad design

3. **Test:** Verify all click handlers work

4. **Build:** Rebuild Docker container
   ```bash
   docker compose up -d --build frontend
   ```

## File Structure
```
frontend/src/
├── App.tsx              # Shell with navigation
├── pages/
│   ├── HomePage.tsx     # Launchpad-style home
│   ├── FormsListPage.tsx # Form tiles
│   ├── FormPage.tsx     # Form detail/submission
│   ├── SubmissionsPage.tsx
│   └── SearchPage.tsx
└── components/
    └── FioriTile.tsx    # Reusable tile component (NEW)
```

## Priority
1. Fix click handlers (critical)
2. Fix all TypeScript errors (critical)  
3. Polish design to match Fiori Launchpad (important)
