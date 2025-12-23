# PHASE 13G: Navigation Type in Admin UI

## Overview

Add `navigation_type` column and edit capability to the existing Manage Forms admin page.

---

## Part 1: Add Navigation Column to Table ✅ DONE

## Part 2: Add Navigation Dropdown in Edit Dialog ✅ DONE

## Part 3: Fix Schema Wipe Bug ✅ DONE

Fetch full form via `getById` before editing to prevent empty schema overwrite.

---

## Part 4: Fix Dual Navigation Bug 🔴 TODO

**Problem:** Both TOC sidebar AND progress bar show simultaneously when navigation_type differs from schema settings.

**File:** `frontend/src/components/SurveyFormRenderer.tsx`

**Fix:** In the switch statement, explicitly disable conflicting navigation:

```typescript
switch (navigationType) {
  case 'toc-left':
    survey.showTOC = true;
    survey.tocLocation = 'left';
    survey.showProgressBar = 'off';  // ADD
    break;
  case 'toc-right':
    survey.showTOC = true;
    survey.tocLocation = 'right';
    survey.showProgressBar = 'off';  // ADD
    break;
  case 'progress-buttons':
    survey.showProgressBar = 'top';
    survey.progressBarType = 'buttons';
    survey.showTOC = false;
    break;
  case 'default':
  default:
    survey.showTOC = false;
    survey.showProgressBar = 'off';  // ADD
    break;
}
```

**Test:** http://localhost:3000/forms/nav-test-progress-buttons should show ONLY sidebar, no progress dots.

---

## Part 5: Clean Schema Navigation Settings 🔴 TODO (after Part 4)

Remove embedded navigation settings from form schemas to prevent conflicts.

**File:** `backend/migrations/017_clean_schema_navigation.sql`

```sql
UPDATE forms 
SET schema = schema - 'showTOC' - 'tocLocation' - 'showProgressBar' - 'progressBarType'
WHERE schema ? 'showTOC' OR schema ? 'showProgressBar';
```
