# PHASE 13B: SurveyJS Theme & Schema Layout

## Overview

Use SurveyJS official theming system + schema-level layout control instead of custom CSS hacks.

---

## Strategy

| Layer | Approach |
|-------|----------|
| **Colors/Fonts** | SurveyJS CSS variables |
| **Multi-column** | Schema: `startWithNewLine: false` |
| **Section cards** | Schema: `type: "panel"` with titles |
| **Custom gaps** | Minimal CSS overrides |

---

## Part 1: Update SurveyFormRenderer with Theme

### File: `frontend/src/components/SurveyFormRenderer.tsx`

```tsx
import { useCallback } from 'react';
import { Model, surveyLocalization } from 'survey-core';
import { Survey } from 'survey-react-ui';

// Import SurveyJS default CSS (required base)
import 'survey-core/defaultV2.min.css';

// Import our minimal overrides
import '../styles/surveyjs-custom.css';

// Persian translations
surveyLocalization.locales['fa'] = {
  pagePrevText: 'قبلی',
  pageNextText: 'بعدی',
  completeText: 'ثبت فرم',
  requiredError: 'این فیلد الزامی است',
  loadingFile: 'در حال بارگذاری...',
  chooseFileCaption: 'انتخاب فایل',
  removeFileCaption: 'حذف',
  emptyMessage: 'داده‌ای موجود نیست',
  selectToRankEmptyRankedAreaText: 'انتخاب کنید',
  selectToRankEmptyUnrankedAreaText: 'کشیدن و رها کردن',
};

// Fiori-inspired theme using SurveyJS CSS variables
const fioriTheme = {
  cssVariables: {
    // Primary colors
    "--sjs-primary-backcolor": "#0a6ed1",
    "--sjs-primary-backcolor-light": "rgba(10, 110, 209, 0.1)",
    "--sjs-primary-backcolor-dark": "#085cad",
    "--sjs-primary-forecolor": "#ffffff",
    "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
    
    // Secondary/base colors  
    "--sjs-secondary-backcolor": "#f5f6f7",
    "--sjs-secondary-backcolor-light": "#ffffff",
    "--sjs-secondary-backcolor-semi-light": "#fafbfc",
    "--sjs-secondary-forecolor": "#32363a",
    "--sjs-secondary-forecolor-light": "#6a6d70",
    
    // Semantic colors
    "--sjs-error-color": "#bb0000",
    "--sjs-error-background-color": "#fff0f0",
    "--sjs-success-color": "#107e3e",
    "--sjs-success-background-color": "#f0fff4",
    "--sjs-warning-color": "#e9730c",
    "--sjs-warning-background-color": "#fff8e6",
    
    // Border
    "--sjs-border-default": "#e5e5e5",
    "--sjs-border-light": "#ededed",
    
    // Shadow
    "--sjs-shadow-small": "0 1px 2px rgba(0,0,0,0.05)",
    "--sjs-shadow-medium": "0 2px 6px rgba(0,0,0,0.08)",
    "--sjs-shadow-large": "0 4px 12px rgba(0,0,0,0.12)",
    
    // Corner radius
    "--sjs-corner-radius": "8px",
    "--sjs-base-unit": "8px",
    
    // Font
    "--sjs-font-family": "'Vazirmatn', 'Segoe UI', Roboto, sans-serif",
    "--sjs-font-size": "14px",
    
    // Editor/Input
    "--sjs-editor-background": "#ffffff",
    "--sjs-editorpanel-backcolor": "#ffffff",
    "--sjs-editorpanel-hovercolor": "#f5f6f7",
    "--sjs-editor-border": "#e5e5e5",
    "--sjs-editor-border-hover": "#0a6ed1",
    "--sjs-editor-border-focus": "#0a6ed1",
    
    // Question
    "--sjs-question-background": "#ffffff",
    
    // Article/Panel
    "--sjs-article-font-xx-large-fontSize": "18px",
    "--sjs-article-font-xx-large-fontWeight": "600",
  },
  themeName: "fiori",
  colorPalette: "light",
  isPanelless: false,
};

interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
  direction?: 'ltr' | 'rtl';
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  initialData,
  direction = 'ltr',
}: SurveyFormRendererProps) {
  const survey = new Model(schema);

  // Apply theme
  survey.applyTheme(fioriTheme);
  
  // Set locale based on direction
  survey.locale = direction === 'rtl' ? 'fa' : 'en';
  
  // Configure layout
  survey.questionTitleLocation = 'top';
  survey.questionDescriptionLocation = 'underTitle';
  survey.showQuestionNumbers = 'off';
  survey.questionErrorLocation = 'bottom';
  survey.focusFirstQuestionAutomatic = false;
  
  // Apply initial data
  if (initialData) {
    survey.data = initialData;
  }

  // Read-only mode
  if (readOnly) {
    survey.mode = 'display';
  }

  const handleComplete = useCallback(
    (sender: any) => {
      onSubmit(sender.data);
    },
    [onSubmit]
  );

  survey.onComplete.add(handleComplete);

  return (
    <div
      dir={direction}
      className="survey-container"
      style={{
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'opacity 0.2s'
      }}
    >
      <Survey model={survey} />
    </div>
  );
}
```

---

## Part 2: Minimal Custom CSS

### File: `frontend/src/styles/surveyjs-custom.css`

**Replace `surveyjs-fiori-theme.css` with this minimal file:**

```css
/* ============================================
   SurveyJS Minimal Custom Overrides
   Only for things not covered by CSS variables
   ============================================ */

/* RTL text alignment */
[dir="rtl"] .sd-question__title,
[dir="rtl"] .sd-input,
[dir="rtl"] .sd-dropdown,
[dir="rtl"] .sd-comment,
[dir="rtl"] .sv-string-viewer {
  text-align: right;
}

[dir="ltr"] .sd-question__title,
[dir="ltr"] .sd-input,
[dir="ltr"] .sd-dropdown,
[dir="ltr"] .sd-comment,
[dir="ltr"] .sv-string-viewer {
  text-align: left;
}

/* Panel section styling - card effect */
.sd-panel {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.sd-panel__header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(10, 110, 209, 0.15);
}

.sd-panel__title {
  color: #0a6ed1;
  font-weight: 600;
}

/* Submit button gradient */
.sd-btn--action,
.sd-navigation__complete-btn {
  background: linear-gradient(135deg, #0a6ed1 0%, #085cad 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(10, 110, 209, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
}

.sd-btn--action:hover,
.sd-navigation__complete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 110, 209, 0.4);
}

/* Input focus glow */
.sd-input:focus,
.sd-dropdown:focus,
.sd-comment:focus {
  box-shadow: 0 0 0 3px rgba(10, 110, 209, 0.1);
}

/* Required asterisk color */
.sd-question__required-text {
  color: #bb0000;
}

/* Footer spacing */
.sd-footer {
  padding-top: 1.25rem;
  margin-top: 1.25rem;
  border-top: 1px solid #e5e5e5;
}

/* Hide default progress bar top margin issue */
.sd-progress {
  margin-bottom: 1rem;
}

/* Dropdown popup styling */
.sv-popup__container {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

/* Smoother animations */
.sd-question {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Remove extra body background */
.sd-body {
  background: transparent !important;
}

.sd-root-modern {
  background: transparent !important;
}
```

---

## Part 3: Schema Migration - Add Layout + Panels

### File: `backend/migrations/010_add_surveyjs_layout.sql`

Convert schemas to use multi-column layout and section panels:

```sql
-- Migration 010: Add SurveyJS layout properties to form schemas
-- Adds: startWithNewLine, colSpan, panels for grouping

-- ============================================
-- FUNCTION: Add layout properties to elements
-- ============================================

CREATE OR REPLACE FUNCTION add_surveyjs_layout(schema jsonb) RETURNS jsonb AS $$
DECLARE
    elements jsonb;
    elem jsonb;
    new_elements jsonb := '[]'::jsonb;
    elem_index int := 0;
    elem_type text;
    total_elements int;
BEGIN
    elements := schema->'elements';
    
    IF elements IS NULL THEN
        RETURN schema;
    END IF;
    
    total_elements := jsonb_array_length(elements);
    
    -- Process each element
    FOR elem IN SELECT * FROM jsonb_array_elements(elements)
    LOOP
        elem_type := elem->>'type';
        
        -- Full-width types: comment (textarea), file, html, matrix
        IF elem_type IN ('comment', 'file', 'html', 'matrix', 'matrixdynamic', 'paneldynamic', 'signaturepad') THEN
            -- Start new line, full width
            elem := elem || jsonb_build_object('startWithNewLine', true);
        ELSE
            -- For regular fields: 2-3 per row
            -- Every 3rd field starts new line (index 0, 3, 6, ...)
            IF elem_index % 3 = 0 THEN
                elem := elem || jsonb_build_object('startWithNewLine', true);
            ELSE
                elem := elem || jsonb_build_object('startWithNewLine', false);
            END IF;
        END IF;
        
        new_elements := new_elements || jsonb_build_array(elem);
        elem_index := elem_index + 1;
    END LOOP;
    
    RETURN jsonb_build_object('elements', new_elements);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Wrap elements in panel
-- ============================================

CREATE OR REPLACE FUNCTION wrap_in_panel(
    schema jsonb, 
    panel_title text,
    panel_title_fa text
) RETURNS jsonb AS $$
DECLARE
    elements jsonb;
BEGIN
    elements := schema->'elements';
    
    IF elements IS NULL THEN
        RETURN schema;
    END IF;
    
    -- Wrap elements in a panel
    RETURN jsonb_build_object(
        'elements', jsonb_build_array(
            jsonb_build_object(
                'type', 'panel',
                'name', 'main_panel',
                'title', panel_title,
                'elements', elements
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE ALL FORMS WITH LAYOUT
-- ============================================

-- IT Equipment Request (Persian)
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'it';
UPDATE forms SET schema = wrap_in_panel(schema, 'Equipment Request Details', 'اطلاعات درخواست تجهیزات') WHERE slug = 'it';

-- Vacation Request
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'vacation-request';
UPDATE forms SET schema = wrap_in_panel(schema, 'Leave Request Details', 'اطلاعات درخواست مرخصی') WHERE slug = 'vacation-request';

-- Daycare Allowance (Persian)
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'daycare-allowance-request-fa';
UPDATE forms SET schema = wrap_in_panel(schema, 'Daycare Allowance Request', 'درخواست کمک هزینه مهد کودک') WHERE slug = 'daycare-allowance-request-fa';

-- Daycare Allowance (English)
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'daycare-allowance-request';
UPDATE forms SET schema = wrap_in_panel(schema, 'Daycare Allowance Request', 'Daycare Allowance Request') WHERE slug = 'daycare-allowance-request';

-- Department Heads
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'department-heads-information';
UPDATE forms SET schema = wrap_in_panel(schema, 'Department Head Information', 'اطلاعات مدیر بخش') WHERE slug = 'department-heads-information';

-- Equipment List
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'equipment-list-in-the-room';
UPDATE forms SET schema = wrap_in_panel(schema, 'Room Equipment List', 'لیست تجهیزات اتاق') WHERE slug = 'equipment-list-in-the-room';

-- Branch Managers
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'branch-managers-list';
UPDATE forms SET schema = wrap_in_panel(schema, 'Branch Manager Information', 'اطلاعات مدیر شعبه') WHERE slug = 'branch-managers-list';

-- Comprehensive Test Form
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'comprehensive-test-form';
UPDATE forms SET schema = wrap_in_panel(schema, 'Comprehensive Form', 'فرم جامع') WHERE slug = 'comprehensive-test-form';

-- Family Members
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'family-members-information';
UPDATE forms SET schema = wrap_in_panel(schema, 'Family Member Information', 'اطلاعات اعضای خانواده') WHERE slug = 'family-members-information';

-- ============================================
-- VERIFY
-- ============================================

SELECT slug, 
       schema->'elements'->0->>'type' as root_type,
       schema->'elements'->0->>'title' as panel_title,
       jsonb_array_length(schema->'elements'->0->'elements') as field_count
FROM forms;

-- Show IT form structure
SELECT jsonb_pretty(schema) FROM forms WHERE slug = 'it';

-- Cleanup (optional)
-- DROP FUNCTION IF EXISTS add_surveyjs_layout(jsonb);
-- DROP FUNCTION IF EXISTS wrap_in_panel(jsonb, text, text);
```

---

## Part 4: Update Import in SurveyFormRenderer

Make sure the CSS import path is updated.

### File: `frontend/src/components/SurveyFormRenderer.tsx`

Change:
```tsx
// OLD
import '../styles/surveyjs-fiori-theme.css';

// NEW  
import 'survey-core/defaultV2.min.css';
import '../styles/surveyjs-custom.css';
```

---

## Part 5: Delete Old CSS File

Remove `frontend/src/styles/surveyjs-fiori-theme.css` (replaced by `surveyjs-custom.css`)

---

## Implementation Order

1. Create `frontend/src/styles/surveyjs-custom.css` (minimal overrides)
2. Update `frontend/src/components/SurveyFormRenderer.tsx` (theme + imports)
3. Create `backend/migrations/010_add_surveyjs_layout.sql`
4. Run migration
5. Delete old `surveyjs-fiori-theme.css`
6. Rebuild frontend

---

## Expected Result

**Before:**
```
┌────────────────────────────────────┐
│ نام کارمند                         │
│ [________________________]         │
│ واحد سازمانی                       │
│ [________________________]         │
│ نوع تجهیزات                        │
│ [________________________]         │
│ دلیل درخواست                       │
│ [________________________]         │
└────────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────────────────────────┐
│  ┌─ اطلاعات درخواست تجهیزات ───────────────────────┐  │
│  │                                                  │  │
│  │  نام کارمند      واحد سازمانی      نوع تجهیزات  │  │
│  │  [__________]    [__________]     [__________]  │  │
│  │                                                  │  │
│  │  دلیل درخواست                                   │  │
│  │  [________________________________________]     │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│                              [ثبت فرم]                 │
└────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Form renders with official SurveyJS theme
- [ ] Fiori blue colors applied (#0a6ed1)
- [ ] Vazirmatn font applied
- [ ] Panel shows with section header
- [ ] Fields display 3 per row
- [ ] Textarea (comment) spans full width
- [ ] Submit button has gradient
- [ ] Input focus shows blue glow
- [ ] RTL alignment correct
- [ ] Persian labels display
- [ ] Responsive on mobile (1 column)
