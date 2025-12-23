# PHASE 13: Form UI Polish

## Overview

Upgrade user-facing forms from basic stacked layout to professional enterprise-grade UI.

---

## Scope

| # | Feature | Description |
|---|---------|-------------|
| 1 | Shell Bar | Consistent header matching launchpad |
| 2 | Breadcrumb | Navigation: Home → Space → Form |
| 3 | Card Layout | Form in elevated card with shadow |
| 4 | Success Screen | Icon, animation, clear actions |
| 5 | UI5 Buttons | Cancel/Submit with proper styling |
| 6 | Back Navigation | Return to correct launchpad page |
| 7 | Loading Skeleton | Better loading state |
| 8 | Multi-column Layout | 3 cols desktop → 1 col mobile |
| 9 | Section Cards | Group related fields with headers |
| 10 | Smart Field Sizing | Short=narrow, TextArea=full width |
| 11 | Enhanced Inputs | Borders, focus glow, transitions |

---

## Part 1: Update FormPage.tsx

### File: `frontend/src/pages/FormPage.tsx`

**Complete rewrite:**

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ShellBar,
  FlexBox,
  Card,
  CardHeader,
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  BusyIndicator,
  MessageStrip,
  Icon,
  Title,
  Text
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/document.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/home.js";
import { SurveyFormRenderer } from '../components/SurveyFormRenderer';
import { FormSuccessScreen } from '../components/FormSuccessScreen';
import { FormLoadingSkeleton } from '../components/FormLoadingSkeleton';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get return path from location state or default to launchpad
  const returnPath = location.state?.returnPath || '/launchpad';
  const spaceName = location.state?.spaceName || 'Home';
  const pageName = location.state?.pageName || '';

  useEffect(() => {
    if (slug) loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      const data = await formsApi.get(slug!);
      setForm(data);
    } catch (err) {
      setError('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitting(true);
    try {
      await formsApi.submit(slug!, data);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(returnPath);
  };

  // Loading state
  if (loading) {
    return <FormLoadingSkeleton />;
  }

  // Error state
  if (error || !form) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
        <ShellBar
          logo={<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px' }} />}
          primaryTitle="SYNCRO"
        />
        <FlexBox 
          direction="Column" 
          alignItems="Center" 
          justifyContent="Center"
          style={{ padding: '3rem', gap: '1rem' }}
        >
          <MessageStrip design="Negative" hideCloseButton>
            {error || 'Form not found'}
          </MessageStrip>
          <Button icon="nav-back" onClick={handleBack}>
            Back
          </Button>
        </FlexBox>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
        <ShellBar
          logo={<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px' }} />}
          primaryTitle="SYNCRO"
          secondaryTitle={form.name_fa || form.name}
        />
        <FormSuccessScreen
          formName={form.name_fa || form.name}
          onBackToLaunchpad={handleBack}
          onSubmitAnother={() => setSubmitted(false)}
          direction={form.direction || 'ltr'}
        />
      </div>
    );
  }

  // Form state
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
      {/* Shell Bar */}
      <ShellBar
        logo={<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px' }} />}
        primaryTitle="SYNCRO"
        secondaryTitle={form.name_fa || form.name}
        startButton={
          <Button icon="nav-back" design="Transparent" onClick={handleBack} />
        }
      />

      {/* Breadcrumb Bar */}
      <div style={{ 
        padding: '0.75rem 1.5rem', 
        background: '#fff', 
        borderBottom: '1px solid #e5e5e5',
        direction: form.direction || 'ltr'
      }}>
        <Breadcrumbs>
          <BreadcrumbsItem onClick={() => navigate('/launchpad')}>
            {form.direction === 'rtl' ? 'خانه' : 'Home'}
          </BreadcrumbsItem>
          {spaceName && (
            <BreadcrumbsItem onClick={handleBack}>
              {spaceName}
            </BreadcrumbsItem>
          )}
          <BreadcrumbsItem>
            {form.name_fa || form.name}
          </BreadcrumbsItem>
        </Breadcrumbs>
      </div>

      {/* Main Content */}
      <div style={{ 
        padding: '1.5rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        direction: form.direction || 'ltr'
      }}>
        <Card style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <CardHeader
            titleText={form.name_fa || form.name}
            subtitleText={form.description || ''}
            avatar={<Icon name={form.icon || 'document'} />}
            style={{
              borderBottom: '1px solid #e5e5e5',
              background: '#fafbfc'
            }}
          />
          
          {/* Form Content */}
          <div style={{ padding: '1.5rem' }}>
            <SurveyFormRenderer
              schema={form.schema}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              loading={submitting}
              direction={form.direction || 'ltr'}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default FormPage;
```

---

## Part 2: Create FormSuccessScreen.tsx

### File: `frontend/src/components/FormSuccessScreen.tsx`

```tsx
import { FlexBox, Card, Title, Text, Button, Icon } from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/home.js";

interface FormSuccessScreenProps {
  formName: string;
  onBackToLaunchpad: () => void;
  onSubmitAnother: () => void;
  direction?: 'ltr' | 'rtl';
}

export function FormSuccessScreen({
  formName,
  onBackToLaunchpad,
  onSubmitAnother,
  direction = 'ltr'
}: FormSuccessScreenProps) {
  const isRtl = direction === 'rtl';
  
  return (
    <div style={{ 
      padding: '3rem 1.5rem',
      display: 'flex',
      justifyContent: 'center',
      direction
    }}>
      <Card style={{ 
        maxWidth: '480px', 
        width: '100%',
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <FlexBox 
          direction="Column" 
          alignItems="Center" 
          style={{ padding: '3rem 2rem', gap: '1.5rem' }}
        >
          {/* Success Icon */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            animation: 'scaleIn 0.4s ease-out'
          }}>
            <Icon name="accept" style={{ 
              color: 'white', 
              width: '40px', 
              height: '40px' 
            }} />
          </div>

          {/* Title */}
          <Title level="H2" style={{ color: '#107e3e' }}>
            {isRtl ? 'ثبت موفق!' : 'Successfully Submitted!'}
          </Title>

          {/* Message */}
          <Text style={{ color: '#6a6d70', lineHeight: 1.6 }}>
            {isRtl 
              ? `فرم "${formName}" با موفقیت ثبت شد.`
              : `The form "${formName}" has been submitted successfully.`
            }
          </Text>

          {/* Actions */}
          <FlexBox style={{ gap: '1rem', marginTop: '1rem' }}>
            <Button 
              design="Emphasized" 
              icon="home"
              onClick={onBackToLaunchpad}
              style={{ minWidth: '140px' }}
            >
              {isRtl ? 'بازگشت' : 'Back to Home'}
            </Button>
            <Button 
              design="Transparent" 
              icon="refresh"
              onClick={onSubmitAnother}
            >
              {isRtl ? 'ثبت مجدد' : 'Submit Another'}
            </Button>
          </FlexBox>
        </FlexBox>
      </Card>

      {/* Animation keyframes */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
```

---

## Part 3: Create FormLoadingSkeleton.tsx

### File: `frontend/src/components/FormLoadingSkeleton.tsx`

```tsx
export function FormLoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
      {/* Shell Bar Skeleton */}
      <div style={{ height: '44px', background: '#354a5f' }} />
      
      {/* Breadcrumb Skeleton */}
      <div style={{ 
        padding: '0.75rem 1.5rem', 
        background: '#fff', 
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <SkeletonBox width="50px" height="14px" />
        <span style={{ color: '#ccc' }}>/</span>
        <SkeletonBox width="80px" height="14px" />
        <span style={{ color: '#ccc' }}>/</span>
        <SkeletonBox width="120px" height="14px" />
      </div>

      {/* Content Skeleton */}
      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Header Skeleton */}
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid #e5e5e5',
            background: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <SkeletonBox width="40px" height="40px" borderRadius="8px" />
            <div>
              <SkeletonBox width="200px" height="20px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox width="300px" height="14px" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div style={{ padding: '1.5rem' }}>
            {/* Section 1 */}
            <div style={{ marginBottom: '2rem' }}>
              <SkeletonBox width="150px" height="18px" style={{ marginBottom: '1rem' }} />
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1.5rem' 
              }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i}>
                    <SkeletonBox width="80px" height="14px" style={{ marginBottom: '0.5rem' }} />
                    <SkeletonBox width="100%" height="40px" borderRadius="4px" />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <SkeletonBox width="120px" height="18px" style={{ marginBottom: '1rem' }} />
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1.5rem' 
              }}>
                {[1, 2].map(i => (
                  <div key={i}>
                    <SkeletonBox width="80px" height="14px" style={{ marginBottom: '0.5rem' }} />
                    <SkeletonBox width="100%" height="40px" borderRadius="4px" />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <SkeletonBox width="80px" height="14px" style={{ marginBottom: '0.5rem' }} />
                <SkeletonBox width="100%" height="100px" borderRadius="4px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function SkeletonBox({ 
  width, 
  height, 
  borderRadius = '4px',
  style = {}
}: { 
  width: string; 
  height: string; 
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e5e5e5 25%, #f0f0f0 50%, #e5e5e5 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  );
}
```

---

## Part 4: Enhanced SurveyJS CSS

### File: `frontend/src/styles/surveyjs-fiori-theme.css`

**Replace entire file with professional theme:**

```css
/* ============================================
   SurveyJS SAP Fiori Professional Theme
   ============================================ */

:root {
  --survey-primary: #0a6ed1;
  --survey-primary-hover: #085cad;
  --survey-primary-light: rgba(10, 110, 209, 0.08);
  --survey-primary-lighter: rgba(10, 110, 209, 0.04);
  --survey-bg: #ffffff;
  --survey-bg-dim: #f5f6f7;
  --survey-text: #32363a;
  --survey-text-light: #6a6d70;
  --survey-border: #e5e5e5;
  --survey-border-light: #ededed;
  --survey-error: #bb0000;
  --survey-error-light: #fff0f0;
  --survey-success: #107e3e;
  --survey-radius: 8px;
  --survey-radius-sm: 4px;
  --survey-font: 'Vazirmatn', 'Segoe UI', Roboto, sans-serif;
}

/* ============================================
   Root & Body
   ============================================ */

.sd-root-modern {
  --primary: var(--survey-primary);
  --background: var(--survey-bg);
  --foreground: var(--survey-text);
  font-family: var(--survey-font);
}

.sd-body {
  background: transparent !important;
  padding: 0 !important;
}

.sd-page {
  padding: 0 !important;
}

/* ============================================
   Panels - Section Cards
   ============================================ */

.sd-panel {
  background: var(--survey-bg);
  border: 1px solid var(--survey-border);
  border-radius: var(--survey-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.sd-panel__header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--survey-primary-light);
}

.sd-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--survey-primary);
  margin: 0;
}

.sd-panel__description {
  font-size: 13px;
  color: var(--survey-text-light);
  margin-top: 0.25rem;
}

/* ============================================
   Multi-Column Grid
   ============================================ */

.sd-row {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 0 !important;
}

@media (max-width: 1024px) {
  .sd-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .sd-row {
    grid-template-columns: 1fr;
  }
  
  .sd-panel {
    padding: 1rem;
  }
}

.sd-question {
  margin-bottom: 0 !important;
  padding: 0 !important;
}

/* Full-width elements */
.sd-question--comment,
.sd-question--html,
.sd-question--file,
.sd-question--signaturepad,
.sd-question--matrix,
.sd-question--matrixdynamic,
.sd-question--paneldynamic {
  grid-column: 1 / -1;
}

/* ============================================
   Labels
   ============================================ */

.sd-question__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--survey-text);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sd-question__required-text {
  color: var(--survey-error);
  font-weight: 400;
}

.sd-question__description {
  font-size: 12px;
  color: var(--survey-text-light);
  margin-bottom: 0.5rem;
}

/* ============================================
   Inputs
   ============================================ */

.sd-input {
  width: 100%;
  border: 1.5px solid var(--survey-border);
  border-radius: var(--survey-radius-sm);
  padding: 0.625rem 0.75rem;
  font-size: 14px;
  font-family: var(--survey-font);
  background: var(--survey-bg);
  color: var(--survey-text);
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.sd-input::placeholder {
  color: var(--survey-text-light);
  opacity: 0.6;
}

.sd-input:hover {
  border-color: var(--survey-primary);
}

.sd-input:focus {
  border-color: var(--survey-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--survey-primary-light);
}

/* ============================================
   Dropdown
   ============================================ */

.sd-dropdown {
  width: 100%;
  border: 1.5px solid var(--survey-border);
  border-radius: var(--survey-radius-sm);
  padding: 0.625rem 2.25rem 0.625rem 0.75rem;
  background: var(--survey-bg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236a6d70' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  font-family: var(--survey-font);
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

[dir="rtl"] .sd-dropdown {
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  background-position: left 0.75rem center;
}

.sd-dropdown:hover {
  border-color: var(--survey-primary);
}

.sd-dropdown:focus {
  border-color: var(--survey-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--survey-primary-light);
}

/* Dropdown popup */
.sv-popup__container {
  border-radius: var(--survey-radius);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border: 1px solid var(--survey-border);
}

.sv-list__item {
  padding: 0.625rem 0.75rem;
  font-family: var(--survey-font);
  transition: background 0.1s;
}

.sv-list__item:hover {
  background: var(--survey-primary-lighter);
}

.sv-list__item--selected {
  background: var(--survey-primary-light);
  color: var(--survey-primary);
  font-weight: 500;
}

/* ============================================
   Checkbox & Radio
   ============================================ */

.sd-selectbase {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sd-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--survey-radius-sm);
  cursor: pointer;
  transition: background 0.1s;
}

.sd-item:hover {
  background: var(--survey-primary-lighter);
}

.sd-item__decorator {
  width: 18px;
  height: 18px;
  border: 2px solid var(--survey-border);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
  background: var(--survey-bg);
}

.sd-item--checked .sd-item__decorator {
  background: var(--survey-primary);
  border-color: var(--survey-primary);
}

.sd-item--checked .sd-item__decorator::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.sd-item--radio .sd-item__decorator {
  border-radius: 50%;
}

.sd-item--radio.sd-item--checked .sd-item__decorator::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.sd-item__control-label {
  font-size: 14px;
  color: var(--survey-text);
}

/* ============================================
   TextArea
   ============================================ */

.sd-comment {
  width: 100%;
  min-height: 100px;
  border: 1.5px solid var(--survey-border);
  border-radius: var(--survey-radius-sm);
  padding: 0.625rem 0.75rem;
  font-size: 14px;
  font-family: var(--survey-font);
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.sd-comment:hover {
  border-color: var(--survey-primary);
}

.sd-comment:focus {
  border-color: var(--survey-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--survey-primary-light);
}

/* ============================================
   File Upload
   ============================================ */

.sd-file {
  border: 2px dashed var(--survey-border);
  border-radius: var(--survey-radius);
  padding: 2rem;
  text-align: center;
  transition: all 0.15s;
  cursor: pointer;
}

.sd-file:hover {
  border-color: var(--survey-primary);
  background: var(--survey-primary-lighter);
}

.sd-file__choose-btn {
  background: var(--survey-primary);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: var(--survey-radius-sm);
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
}

/* ============================================
   Error State
   ============================================ */

.sd-question--error .sd-input,
.sd-question--error .sd-dropdown,
.sd-question--error .sd-comment {
  border-color: var(--survey-error);
  background: var(--survey-error-light);
}

.sd-question__erbox {
  color: var(--survey-error);
  font-size: 12px;
  margin-top: 0.375rem;
}

/* ============================================
   Buttons
   ============================================ */

.sd-btn {
  padding: 0.625rem 1.25rem;
  border-radius: var(--survey-radius-sm);
  font-weight: 600;
  font-size: 14px;
  font-family: var(--survey-font);
  cursor: pointer;
  transition: all 0.15s;
}

.sd-btn--action,
.sd-navigation__complete-btn {
  background: linear-gradient(135deg, var(--survey-primary) 0%, var(--survey-primary-hover) 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(10, 110, 209, 0.25);
}

.sd-btn--action:hover,
.sd-navigation__complete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 110, 209, 0.35);
}

.sd-navigation__prev-btn {
  background: transparent;
  border: 1.5px solid var(--survey-border);
  color: var(--survey-text);
}

.sd-navigation__prev-btn:hover {
  border-color: var(--survey-primary);
  color: var(--survey-primary);
}

.sd-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--survey-border);
}

/* ============================================
   Progress Bar
   ============================================ */

.sd-progress {
  background: var(--survey-bg-dim);
  border-radius: 10px;
  height: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.sd-progress__bar {
  background: linear-gradient(90deg, var(--survey-primary), #3b82f6);
  border-radius: 10px;
  height: 100%;
  transition: width 0.3s ease;
}

/* ============================================
   RTL Support
   ============================================ */

[dir="rtl"] .sd-question__title {
  text-align: right;
}

[dir="rtl"] .sd-input,
[dir="rtl"] .sd-dropdown,
[dir="rtl"] .sd-comment {
  text-align: right;
}

[dir="rtl"] .sd-footer {
  flex-direction: row-reverse;
}

[dir="rtl"] .sd-item {
  flex-direction: row-reverse;
}

/* ============================================
   LTR Support
   ============================================ */

[dir="ltr"] .sd-question__title {
  text-align: left;
}

[dir="ltr"] .sd-input,
[dir="ltr"] .sd-dropdown,
[dir="ltr"] .sd-comment {
  text-align: left;
}

/* ============================================
   Animations
   ============================================ */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.sd-panel {
  animation: fadeIn 0.25s ease-out;
}
```

---

## Part 5: Update SurveyFormRenderer

### File: `frontend/src/components/SurveyFormRenderer.tsx`

Update to remove custom cancel button (let SurveyJS handle navigation):

```tsx
import { useCallback } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';
import '../styles/surveyjs-fiori-theme.css';
import { surveyLocalization } from 'survey-core';

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

  // Set locale
  survey.locale = direction === 'rtl' ? 'fa' : 'en';
  
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
        fontFamily: 'var(--survey-font)',
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

## Part 6: Update Tile Click to Pass Navigation Context

### File: `frontend/src/pages/LaunchpadPage.tsx`

When clicking a form tile, pass return path info:

```tsx
// Find where tiles are rendered and form click is handled
// Update navigation to include state:

const handleTileClick = (tile: Tile) => {
  if (tile.type === 'form') {
    navigate(`/forms/${tile.slug}`, {
      state: {
        returnPath: `/launchpad/${currentSpace?.slug}/${currentPage?.slug}`,
        spaceName: currentSpace?.name_fa || currentSpace?.name,
        pageName: currentPage?.name_fa || currentPage?.name
      }
    });
  } else if (tile.type === 'app' && tile.config?.route) {
    navigate(tile.config.route);
  } else if (tile.type === 'link' && tile.config?.url) {
    window.open(tile.config.url, '_blank');
  }
};
```

---

## Implementation Order

1. Create `frontend/src/components/FormSuccessScreen.tsx`
2. Create `frontend/src/components/FormLoadingSkeleton.tsx`
3. Replace `frontend/src/styles/surveyjs-fiori-theme.css` entirely
4. Update `frontend/src/components/SurveyFormRenderer.tsx`
5. Rewrite `frontend/src/pages/FormPage.tsx`
6. Update `frontend/src/pages/LaunchpadPage.tsx` - tile click handler

---

## Testing Checklist

- [ ] Form page shows shell bar with logo
- [ ] Breadcrumb shows correct path (Home → Space → Form)
- [ ] Form renders in card with header
- [ ] Fields display in 3-column grid on desktop
- [ ] Fields display in 1-column on mobile
- [ ] Panels/sections show as cards with headers
- [ ] Input focus shows blue glow
- [ ] Submit button has gradient styling
- [ ] Loading shows skeleton animation
- [ ] Success shows green checkmark with animation
- [ ] Back button returns to correct launchpad page
- [ ] RTL forms align correctly
- [ ] Persian labels show correctly
