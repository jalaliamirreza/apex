# SYNCRO Shell Bar - Use SVG Logo

## Current
```tsx
<img src="/logo-original.png" alt="SYNCRO" style={{ height: '32px' }} />
```

## Change To
```tsx
<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px', width: '32px' }} />
```

## File to Update
`frontend/src/pages/LaunchpadPage.tsx`

Find the shell bar section and change the logo src from `/logo-original.png` to `/logo.svg`

## That's it
SVG already exists at `frontend/public/logo.svg`
