# PHASE 9.5 - DISABLE TEXT SELECTION GLOBALLY

## PROBLEM
Text selection is disabled on tiles but still possible on:
- Shell bar (top header)
- Menu items
- Space tabs
- Section titles
- All other UI elements

## SOLUTION
Add global CSS to disable text selection on ALL UI elements, except form inputs.

---

## ADD TO frontend/src/index.css

```css
/* ========================================
   DISABLE TEXT SELECTION GLOBALLY
   ======================================== */

/* Disable on entire app */
body,
#root,
.launchpad-container,
[ui5-shellbar],
[ui5-tabcontainer],
[ui5-tab],
[ui5-button],
[ui5-card],
[ui5-title],
[ui5-label],
[ui5-icon],
[ui5-avatar],
[ui5-badge],
[ui5-menu],
[ui5-menu-item],
[ui5-popover],
[ui5-dialog],
.tile-card,
.section-title,
.space-tabs,
nav,
header,
footer,
button,
a {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
  cursor: default;
}

/* Also target by attribute selectors for UI5 components */
[class*="ui5-"],
[class*="sapM"],
[class*="shell"],
[class*="Shell"],
[class*="tab"],
[class*="Tab"],
[class*="menu"],
[class*="Menu"],
[class*="tile"],
[class*="Tile"],
[class*="card"],
[class*="Card"] {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

/* ALLOW text selection ONLY in form inputs */
input,
textarea,
[contenteditable="true"],
input[type="text"],
input[type="email"],
input[type="password"],
input[type="search"],
input[type="number"],
[ui5-input],
[ui5-textarea],
[ui5-search-field] {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
  cursor: text;
}

/* Pointer cursor for clickable elements */
button,
a,
[ui5-button],
[ui5-tab],
[ui5-menu-item],
[ui5-shellbar-item],
.tile-card,
[role="button"],
[role="tab"],
[role="menuitem"],
[onclick] {
  cursor: pointer !important;
}
```

---

## ALTERNATIVE: Simple Global Rule

If the above is too verbose, use this simpler approach:

```css
/* Disable text selection globally */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Re-enable for inputs only */
input,
textarea,
[contenteditable="true"] {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
```

---

## TEST

http://localhost:3000/launchpad

- [ ] Cannot select text on shell bar (SYNCRO title)
- [ ] Cannot select text on space tabs
- [ ] Cannot select text on section titles
- [ ] Cannot select text on tiles
- [ ] Cannot select text on menus/dropdowns
- [ ] CAN still type in form inputs (when forms open)
