# PHASE 13C: Enhanced Visual Styling

## Problem
Form looks flat - everything white, no shadows, no borders, no visual depth.

## Solution
Update `surveyjs-custom.css` with stronger visual styling.

---

## File: `frontend/src/styles/surveyjs-custom.css`

**Replace entire file with:**

```css
/* ============================================
   SurveyJS Enhanced Visual Theme
   Adds depth, shadows, borders, contrast
   ============================================ */

/* ============================================
   ROOT VARIABLES
   ============================================ */
:root {
  --sjs-primary: #0a6ed1;
  --sjs-primary-dark: #085cad;
  --sjs-primary-light: rgba(10, 110, 209, 0.1);
  --sjs-primary-lighter: rgba(10, 110, 209, 0.05);
  
  --sjs-bg-page: #f0f2f5;
  --sjs-bg-content: #ffffff;
  --sjs-bg-input: #ffffff;
  --sjs-bg-hover: #f8f9fa;
  --sjs-bg-panel-header: #f8fafc;
  
  --sjs-border: #d0d5dd;
  --sjs-border-light: #e4e7ec;
  --sjs-border-input: #d0d5dd;
  
  --sjs-text: #1d2939;
  --sjs-text-light: #667085;
  --sjs-text-lighter: #98a2b3;
  
  --sjs-shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.05);
  --sjs-shadow-md: 0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06);
  --sjs-shadow-lg: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);
  --sjs-shadow-input: 0 1px 2px rgba(16, 24, 40, 0.05);
  --sjs-shadow-input-focus: 0 0 0 4px rgba(10, 110, 209, 0.15), 0 1px 2px rgba(16, 24, 40, 0.05);
  
  --sjs-radius: 12px;
  --sjs-radius-sm: 8px;
  --sjs-radius-xs: 6px;
}

/* ============================================
   PAGE & BODY - Gray Background
   ============================================ */
.sd-root-modern {
  background: var(--sjs-bg-page) !important;
}

.sd-body {
  background: transparent !important;
  padding: 0 !important;
}

.sd-container-modern {
  background: transparent !important;
}

/* Survey container padding */
.survey-container {
  padding: 1rem 0;
}

/* ============================================
   PANELS - Card Style with Shadow
   ============================================ */
.sd-panel {
  background: var(--sjs-bg-content) !important;
  border: 1px solid var(--sjs-border-light) !important;
  border-radius: var(--sjs-radius) !important;
  box-shadow: var(--sjs-shadow-md) !important;
  margin-bottom: 1.5rem !important;
  overflow: hidden;
}

.sd-panel__header {
  background: var(--sjs-bg-panel-header) !important;
  border-bottom: 1px solid var(--sjs-border-light) !important;
  padding: 1rem 1.25rem !important;
  margin: 0 !important;
}

.sd-panel__content {
  padding: 1.25rem !important;
}

.sd-panel__title {
  color: var(--sjs-primary) !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  margin: 0 !important;
}

.sd-panel__description {
  color: var(--sjs-text-light) !important;
  font-size: 13px !important;
  margin-top: 0.25rem !important;
}

/* ============================================
   INPUT FIELDS - Visible Borders & Shadows
   ============================================ */
.sd-input,
.sd-dropdown,
.sd-comment,
input[type="text"],
input[type="email"],
input[type="number"],
input[type="tel"],
input[type="url"],
input[type="date"],
input[type="datetime-local"],
textarea,
select {
  background: var(--sjs-bg-input) !important;
  border: 1.5px solid var(--sjs-border-input) !important;
  border-radius: var(--sjs-radius-xs) !important;
  padding: 0.625rem 0.875rem !important;
  font-size: 14px !important;
  color: var(--sjs-text) !important;
  box-shadow: var(--sjs-shadow-input) !important;
  transition: all 0.15s ease !important;
}

.sd-input:hover,
.sd-dropdown:hover,
.sd-comment:hover {
  border-color: var(--sjs-primary) !important;
}

.sd-input:focus,
.sd-dropdown:focus,
.sd-comment:focus {
  border-color: var(--sjs-primary) !important;
  box-shadow: var(--sjs-shadow-input-focus) !important;
  outline: none !important;
}

/* Placeholder */
.sd-input::placeholder,
.sd-comment::placeholder {
  color: var(--sjs-text-lighter) !important;
}

/* ============================================
   QUESTION TITLES - Better Contrast
   ============================================ */
.sd-question__title {
  font-weight: 600 !important;
  font-size: 14px !important;
  color: var(--sjs-text) !important;
  margin-bottom: 0.5rem !important;
}

.sd-question__description {
  color: var(--sjs-text-light) !important;
  font-size: 13px !important;
}

/* Required asterisk */
.sd-question__required-text {
  color: #dc2626 !important;
}

/* ============================================
   CHECKBOXES & RADIO BUTTONS - Styled
   ============================================ */
.sd-selectbase__item {
  padding: 0.5rem 0.75rem !important;
  border-radius: var(--sjs-radius-xs) !important;
  transition: background 0.1s !important;
}

.sd-selectbase__item:hover {
  background: var(--sjs-bg-hover) !important;
}

/* Checkbox/Radio decorator */
.sd-item__decorator {
  width: 20px !important;
  height: 20px !important;
  border: 2px solid var(--sjs-border) !important;
  border-radius: 4px !important;
  background: var(--sjs-bg-input) !important;
  box-shadow: var(--sjs-shadow-sm) !important;
  transition: all 0.15s !important;
}

.sd-item--checked .sd-item__decorator {
  background: var(--sjs-primary) !important;
  border-color: var(--sjs-primary) !important;
}

/* Radio button - circular */
.sd-item--radio .sd-item__decorator {
  border-radius: 50% !important;
}

/* ============================================
   RATING - Styled Boxes
   ============================================ */
.sd-rating__item {
  min-width: 44px !important;
  height: 44px !important;
  border: 2px solid var(--sjs-border) !important;
  border-radius: var(--sjs-radius-xs) !important;
  background: var(--sjs-bg-input) !important;
  box-shadow: var(--sjs-shadow-sm) !important;
  transition: all 0.15s !important;
  font-weight: 500 !important;
}

.sd-rating__item:hover {
  border-color: var(--sjs-primary) !important;
  background: var(--sjs-primary-lighter) !important;
}

.sd-rating__item--selected {
  background: var(--sjs-primary) !important;
  border-color: var(--sjs-primary) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(10, 110, 209, 0.3) !important;
}

/* ============================================
   BOOLEAN - Toggle Style
   ============================================ */
.sd-boolean__switch {
  background: var(--sjs-border) !important;
  border-radius: 24px !important;
  box-shadow: var(--sjs-shadow-sm) !important;
}

.sd-boolean--checked .sd-boolean__switch {
  background: var(--sjs-primary) !important;
}

.sd-boolean__thumb {
  box-shadow: var(--sjs-shadow-md) !important;
}

/* ============================================
   MATRIX - Table Styling
   ============================================ */
.sd-matrix {
  border: 1px solid var(--sjs-border-light) !important;
  border-radius: var(--sjs-radius-sm) !important;
  overflow: hidden !important;
}

.sd-matrix__cell {
  border: 1px solid var(--sjs-border-light) !important;
  padding: 0.75rem !important;
}

.sd-table__cell--header {
  background: var(--sjs-bg-panel-header) !important;
  font-weight: 600 !important;
  color: var(--sjs-text) !important;
}

.sd-matrix__cell:hover {
  background: var(--sjs-bg-hover) !important;
}

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

/* Dropdown popup */
.sv-popup__container {
  border-radius: var(--sjs-radius-sm) !important;
  box-shadow: var(--sjs-shadow-lg) !important;
  border: 1px solid var(--sjs-border-light) !important;
}

.sv-list__item {
  padding: 0.625rem 0.875rem !important;
  transition: background 0.1s !important;
}

.sv-list__item:hover {
  background: var(--sjs-bg-hover) !important;
}

.sv-list__item--selected {
  background: var(--sjs-primary-light) !important;
  color: var(--sjs-primary) !important;
  font-weight: 500 !important;
}

/* ============================================
   TEXTAREA - Comment Fields
   ============================================ */
.sd-comment {
  min-height: 100px !important;
  resize: vertical !important;
}

/* ============================================
   FILE UPLOAD - Dashed Border
   ============================================ */
.sd-file {
  border: 2px dashed var(--sjs-border) !important;
  border-radius: var(--sjs-radius) !important;
  background: var(--sjs-bg-hover) !important;
  padding: 2rem !important;
  text-align: center !important;
  transition: all 0.15s !important;
}

.sd-file:hover {
  border-color: var(--sjs-primary) !important;
  background: var(--sjs-primary-lighter) !important;
}

.sd-file__choose-btn {
  background: var(--sjs-primary) !important;
  color: white !important;
  border: none !important;
  padding: 0.5rem 1.5rem !important;
  border-radius: var(--sjs-radius-xs) !important;
  font-weight: 500 !important;
  box-shadow: var(--sjs-shadow-sm) !important;
  cursor: pointer !important;
}

/* ============================================
   SIGNATURE PAD
   ============================================ */
.sd-signaturepad {
  border: 2px solid var(--sjs-border) !important;
  border-radius: var(--sjs-radius-sm) !important;
  background: var(--sjs-bg-input) !important;
  box-shadow: var(--sjs-shadow-sm) !important;
}

/* ============================================
   BUTTONS - Gradient & Shadow
   ============================================ */
.sd-btn,
.sd-navigation__complete-btn,
.sd-navigation__next-btn,
.sd-navigation__prev-btn {
  padding: 0.75rem 1.5rem !important;
  border-radius: var(--sjs-radius-xs) !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  transition: all 0.15s !important;
  cursor: pointer !important;
}

/* Primary buttons (Next, Complete) */
.sd-btn--action,
.sd-navigation__complete-btn,
.sd-navigation__next-btn {
  background: linear-gradient(135deg, var(--sjs-primary) 0%, var(--sjs-primary-dark) 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(10, 110, 209, 0.35) !important;
}

.sd-btn--action:hover,
.sd-navigation__complete-btn:hover,
.sd-navigation__next-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(10, 110, 209, 0.45) !important;
}

.sd-btn--action:active,
.sd-navigation__complete-btn:active,
.sd-navigation__next-btn:active {
  transform: translateY(0) !important;
}

/* Secondary buttons (Previous) */
.sd-navigation__prev-btn {
  background: var(--sjs-bg-content) !important;
  color: var(--sjs-text) !important;
  border: 1.5px solid var(--sjs-border) !important;
  box-shadow: var(--sjs-shadow-sm) !important;
}

.sd-navigation__prev-btn:hover {
  border-color: var(--sjs-primary) !important;
  color: var(--sjs-primary) !important;
  background: var(--sjs-primary-lighter) !important;
}

/* Navigation footer */
.sd-footer {
  padding: 1.25rem 0 !important;
  margin-top: 1.5rem !important;
  border-top: 1px solid var(--sjs-border-light) !important;
}

/* ============================================
   PROGRESS BAR - Gradient
   ============================================ */
.sd-progress {
  background: var(--sjs-border-light) !important;
  border-radius: 10px !important;
  height: 8px !important;
  overflow: hidden !important;
  margin-bottom: 1rem !important;
}

.sd-progress__bar {
  background: linear-gradient(90deg, var(--sjs-primary), #3b82f6) !important;
  border-radius: 10px !important;
  transition: width 0.3s ease !important;
}

/* Progress text */
.sd-progress__text {
  color: var(--sjs-text-light) !important;
  font-size: 13px !important;
}

/* ============================================
   PAGE TITLE
   ============================================ */
.sd-title {
  color: var(--sjs-primary) !important;
  font-weight: 700 !important;
}

.sd-description {
  color: var(--sjs-text-light) !important;
}

/* ============================================
   ERROR STATES
   ============================================ */
.sd-question--error .sd-input,
.sd-question--error .sd-dropdown,
.sd-question--error .sd-comment {
  border-color: #dc2626 !important;
  background: #fef2f2 !important;
}

.sd-question__erbox {
  color: #dc2626 !important;
  font-size: 13px !important;
  margin-top: 0.375rem !important;
}

/* ============================================
   RTL SUPPORT
   ============================================ */
[dir="rtl"] .sd-question__title,
[dir="rtl"] .sd-input,
[dir="rtl"] .sd-dropdown,
[dir="rtl"] .sd-comment,
[dir="rtl"] .sv-string-viewer {
  text-align: right !important;
}

[dir="rtl"] .sd-footer {
  flex-direction: row-reverse !important;
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.sd-panel {
  animation: fadeIn 0.25s ease-out;
}

.sd-question {
  animation: fadeIn 0.2s ease-out;
}

/* ============================================
   TAGBOX (Multi-select)
   ============================================ */
.sd-tagbox {
  border: 1.5px solid var(--sjs-border-input) !important;
  border-radius: var(--sjs-radius-xs) !important;
  background: var(--sjs-bg-input) !important;
  box-shadow: var(--sjs-shadow-input) !important;
}

.sd-tagbox:hover {
  border-color: var(--sjs-primary) !important;
}

.sd-tagbox:focus-within {
  border-color: var(--sjs-primary) !important;
  box-shadow: var(--sjs-shadow-input-focus) !important;
}

.sd-tagbox-item {
  background: var(--sjs-primary-light) !important;
  color: var(--sjs-primary) !important;
  border-radius: 4px !important;
  padding: 0.25rem 0.5rem !important;
  font-weight: 500 !important;
}
```

---

## Implementation

Tell Claude Code:

```
Replace frontend/src/styles/surveyjs-custom.css with the enhanced version from PHASE13C-VISUAL-STYLING.md. Rebuild frontend.
```
