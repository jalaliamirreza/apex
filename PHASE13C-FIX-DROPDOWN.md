# PHASE 13C-FIX: Dropdown Styling Bug

## Problem
- Double dropdown arrows
- Double borders (container + inner element)

## Solution

In `frontend/src/styles/surveyjs-custom.css`, find and replace the DROPDOWN section:

**REMOVE this:**
```css
/* ============================================
   DROPDOWN - Enhanced
   ============================================ */
.sd-dropdown {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667085' d='M2 4l4 4 4-4'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 0.875rem center !important;
  padding-right: 2.5rem !important;
  cursor: pointer !important;
}

[dir="rtl"] .sd-dropdown {
  background-position: left 0.875rem center !important;
  padding-right: 0.875rem !important;
  padding-left: 2.5rem !important;
}
```

**REPLACE with:**
```css
/* ============================================
   DROPDOWN - Fixed (no duplicate arrows)
   ============================================ */
.sd-dropdown {
  cursor: pointer !important;
}

/* Remove double border on dropdown container */
.sd-dropdown__value {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* Style the actual dropdown container */
.sd-selectbase {
  /* Remove any extra styling */
}

/* Hide SurveyJS default arrow if we want custom, or keep it */
/* For now, use SurveyJS built-in arrow */
```

---

## Also check for these selectors and simplify:

**Find any rules targeting these and remove/simplify:**
```css
/* These may cause double borders */
.sd-dropdown__value
.sd-dropdown__filter-string-input  
.sd-input.sd-dropdown
```

---

## Simpler Fix - Remove dropdown from input selector

**Find this line:**
```css
.sd-input,
.sd-dropdown,
.sd-comment,
```

**Change to:**
```css
.sd-input,
.sd-comment,
```

And add separate minimal dropdown styling:
```css
/* Dropdown - use SurveyJS default, just adjust borders */
.sd-dropdown {
  border: 1.5px solid var(--sjs-border-input) !important;
  border-radius: var(--sjs-radius-xs) !important;
  box-shadow: var(--sjs-shadow-input) !important;
}

.sd-dropdown:hover {
  border-color: var(--sjs-primary) !important;
}

.sd-dropdown:focus-within {
  border-color: var(--sjs-primary) !important;
  box-shadow: var(--sjs-shadow-input-focus) !important;
}

/* Remove inner element borders */
.sd-dropdown input,
.sd-dropdown__value {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
```
