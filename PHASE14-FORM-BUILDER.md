# PHASE 14: Basic Form Builder

## Overview

Simple form builder with field list, page management, and field configuration panel.

---

## Part 1: Create FormBuilderPage Layout

### File: `frontend/src/pages/admin/FormBuilderPage.tsx`

Basic page structure with three sections:

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShellBar, FlexBox, Button, Title, Input, Label, Select, Option,
  Dialog, Bar, MessageStrip, BusyIndicator
} from '@ui5/webcomponents-react';

// Layout:
// - Shell bar with Save/Cancel
// - Form metadata row (name, name_fa, slug, navigation, direction)
// - Three columns: FieldTypes (left) | FieldList (center) | FieldConfig (right)

function FormBuilderPage() {
  const { id } = useParams(); // undefined = new form
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  // State
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formMeta, setFormMeta] = useState({
    name: '',
    name_fa: '',
    slug: '',
    navigation_type: 'default',
    direction: 'ltr' as 'ltr' | 'rtl',
    status: 'draft'
  });
  const [pages, setPages] = useState<PageDef[]>([
    { name: 'page1', title: 'Page 1', elements: [] }
  ]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedField, setSelectedField] = useState<FieldPath | null>(null);
  
  // Load existing form if editing
  useEffect(() => {
    if (!isNew) {
      loadForm(id);
    }
  }, [id]);
  
  // ... rest of component
}
```

### Types to define:

```tsx
interface PageDef {
  name: string;
  title: string;
  elements: (PanelDef | FieldDef)[];
}

interface PanelDef {
  type: 'panel';
  name: string;
  title: string;
  elements: FieldDef[];
}

interface FieldDef {
  type: string;
  name: string;
  title: string;
  isRequired?: boolean;
  placeholder?: string;
  inputType?: string;
  choices?: { value: string; text: string }[];
  rateCount?: number;
  acceptedTypes?: string;
}

interface FieldPath {
  pageIndex: number;
  panelIndex?: number;
  fieldIndex: number;
}
```

---

## Part 2: Create FieldTypeList Component

### File: `frontend/src/components/form-builder/FieldTypeList.tsx`

Left sidebar with clickable field type buttons:

```tsx
interface FieldTypeListProps {
  onAddField: (type: string) => void;
  onAddPanel: () => void;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: 'edit' },
  { type: 'comment', label: 'Textarea', icon: 'document-text' },
  { type: 'number', label: 'Number', icon: 'number-sign' },
  { type: 'email', label: 'Email', icon: 'email' },
  { type: 'phone', label: 'Phone', icon: 'iphone' },
  { type: 'dropdown', label: 'Dropdown', icon: 'dropdown' },
  { type: 'radiogroup', label: 'Radio', icon: 'circle-task-2' },
  { type: 'checkbox', label: 'Checkbox', icon: 'complete' },
  { type: 'tagbox', label: 'Multi-select', icon: 'multi-select' },
  { type: 'date', label: 'Date', icon: 'calendar' },
  { type: 'file', label: 'File Upload', icon: 'attachment' },
  { type: 'rating', label: 'Rating', icon: 'favorite' },
  { type: 'signaturepad', label: 'Signature', icon: 'signature' },
];

// Render as vertical list of buttons
// Click calls onAddField(type)
// Special "Panel" button calls onAddPanel()
```

---

## Part 3: Create PageTabs Component

### File: `frontend/src/components/form-builder/PageTabs.tsx`

Tab bar for page management:

```tsx
interface PageTabsProps {
  pages: PageDef[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRename: (index: number, title: string) => void;
}

// Render horizontal tabs
// Each tab shows page title, click to select
// X button to remove (confirm if has fields)
// + button at end to add new page
// Double-click or edit icon to rename
```

---

## Part 4: Create FieldList and FieldItem Components

### File: `frontend/src/components/form-builder/FieldList.tsx`

Display fields in current page:

```tsx
interface FieldListProps {
  elements: (PanelDef | FieldDef)[];
  selectedField: FieldPath | null;
  onSelectField: (path: FieldPath) => void;
  onMoveField: (path: FieldPath, direction: 'up' | 'down') => void;
  onRemoveField: (path: FieldPath) => void;
}

// Map through elements
// If panel, render PanelItem with nested fields
// If field, render FieldItem
// Show [+ Add Field] button at bottom
```

### File: `frontend/src/components/form-builder/FieldItem.tsx`

Single field row:

```tsx
interface FieldItemProps {
  field: FieldDef;
  path: FieldPath;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
}

// Display: icon | title | type badge | [↑][↓][✕] buttons
// Click row to select (highlight)
// Buttons for move up/down/remove
```

### File: `frontend/src/components/form-builder/PanelItem.tsx`

Panel wrapper:

```tsx
interface PanelItemProps {
  panel: PanelDef;
  pageIndex: number;
  panelIndex: number;
  selectedField: FieldPath | null;
  onSelectField: (path: FieldPath) => void;
  onMovePanel: (direction: 'up' | 'down') => void;
  onRemovePanel: () => void;
  onMoveField: (path: FieldPath, direction: 'up' | 'down') => void;
  onRemoveField: (path: FieldPath) => void;
  onAddFieldToPanel: () => void;
}

// Collapsible card with panel title
// Contains nested FieldItem list
// Has own move/remove buttons
// [+ Add Field] button inside panel
```

---

## Part 5: Create FieldConfigPanel Component

### File: `frontend/src/components/form-builder/FieldConfigPanel.tsx`

Bottom panel for field properties:

```tsx
interface FieldConfigPanelProps {
  field: FieldDef | null;
  onChange: (updates: Partial<FieldDef>) => void;
}

// If no field selected, show "Select a field to configure"
// Otherwise show form with:
// - Label (title)
// - Name (auto-generated from label, editable)
// - Required checkbox
// - Placeholder (for text types)
// - Input type (for text: text/email/phone/number/date)
// - Choices editor (for dropdown/radio/tagbox)
// - Rating count (for rating)
// - Accepted file types (for file)
```

### Choices Editor sub-component:

```tsx
// For dropdown, radio, tagbox
// List of value/text pairs
// [+ Add Option] button
// Remove button per option
```

---

## Part 6: State Management Functions

In `FormBuilderPage.tsx`, add these functions:

```tsx
// Page management
const addPage = () => {
  const newPage: PageDef = {
    name: `page${pages.length + 1}`,
    title: `Page ${pages.length + 1}`,
    elements: []
  };
  setPages([...pages, newPage]);
  setSelectedPageIndex(pages.length);
};

const removePage = (index: number) => {
  if (pages.length === 1) return; // Keep at least one page
  const newPages = pages.filter((_, i) => i !== index);
  setPages(newPages);
  setSelectedPageIndex(Math.min(selectedPageIndex, newPages.length - 1));
};

const renamePage = (index: number, title: string) => {
  const newPages = [...pages];
  newPages[index] = { ...newPages[index], title };
  setPages(newPages);
};

// Field management
const addField = (type: string, toPanelIndex?: number) => {
  const fieldName = `${type}_${Date.now()}`;
  const newField: FieldDef = {
    type: type === 'number' || type === 'email' || type === 'phone' || type === 'date' 
      ? 'text' : type,
    name: fieldName,
    title: getDefaultTitle(type),
    inputType: getInputType(type),
    isRequired: false,
  };
  
  // Add choices for dropdown/radio/tagbox
  if (['dropdown', 'radiogroup', 'tagbox'].includes(type)) {
    newField.choices = [
      { value: 'option1', text: 'Option 1' },
      { value: 'option2', text: 'Option 2' },
    ];
  }
  
  // Add to panel or page
  const newPages = [...pages];
  if (toPanelIndex !== undefined) {
    (newPages[selectedPageIndex].elements[toPanelIndex] as PanelDef).elements.push(newField);
  } else {
    newPages[selectedPageIndex].elements.push(newField);
  }
  setPages(newPages);
};

const addPanel = () => {
  const panelName = `panel_${Date.now()}`;
  const newPanel: PanelDef = {
    type: 'panel',
    name: panelName,
    title: 'New Panel',
    elements: []
  };
  const newPages = [...pages];
  newPages[selectedPageIndex].elements.push(newPanel);
  setPages(newPages);
};

const removeElement = (path: FieldPath) => {
  const newPages = [...pages];
  const pageElements = newPages[path.pageIndex].elements;
  
  if (path.panelIndex !== undefined) {
    // Remove field from panel
    const panel = pageElements[path.panelIndex] as PanelDef;
    panel.elements.splice(path.fieldIndex, 1);
  } else {
    // Remove from page (could be field or panel)
    pageElements.splice(path.fieldIndex, 1);
  }
  
  setPages(newPages);
  setSelectedField(null);
};

const moveElement = (path: FieldPath, direction: 'up' | 'down') => {
  // Swap with adjacent element in same container
  // Implementation similar to removeElement but swap instead of splice
};

const updateField = (updates: Partial<FieldDef>) => {
  if (!selectedField) return;
  // Update field at selectedField path with updates
};
```

Helper functions:

```tsx
const getDefaultTitle = (type: string): string => {
  const titles: Record<string, string> = {
    text: 'Text Field',
    comment: 'Text Area',
    number: 'Number',
    email: 'Email',
    phone: 'Phone',
    dropdown: 'Dropdown',
    radiogroup: 'Radio Group',
    checkbox: 'Checkbox',
    tagbox: 'Multi-select',
    date: 'Date',
    file: 'File Upload',
    rating: 'Rating',
    signaturepad: 'Signature',
  };
  return titles[type] || 'Field';
};

const getInputType = (type: string): string | undefined => {
  const inputTypes: Record<string, string> = {
    number: 'number',
    email: 'email',
    phone: 'tel',
    date: 'date',
  };
  return inputTypes[type];
};
```

---

## Part 7: Save Function (Convert to SurveyJS Schema)

```tsx
const convertToSurveyJSSchema = (): object => {
  return {
    pages: pages.map(page => ({
      name: page.name,
      title: page.title,
      elements: page.elements.map(el => {
        if (el.type === 'panel') {
          const panel = el as PanelDef;
          return {
            type: 'panel',
            name: panel.name,
            title: panel.title,
            elements: panel.elements.map(convertFieldToSurveyJS)
          };
        }
        return convertFieldToSurveyJS(el as FieldDef);
      })
    }))
  };
};

const convertFieldToSurveyJS = (field: FieldDef): object => {
  const result: any = {
    type: field.type,
    name: field.name,
    title: field.title,
  };
  
  if (field.isRequired) result.isRequired = true;
  if (field.placeholder) result.placeholder = field.placeholder;
  if (field.inputType) result.inputType = field.inputType;
  if (field.choices) result.choices = field.choices;
  if (field.rateCount) result.rateCount = field.rateCount;
  if (field.acceptedTypes) result.acceptedTypes = field.acceptedTypes;
  
  return result;
};

const handleSave = async () => {
  setSaving(true);
  try {
    const schema = convertToSurveyJSSchema();
    const payload = {
      ...formMeta,
      schema
    };
    
    if (isNew) {
      await formsApi.create(payload);
    } else {
      await formsApi.update(id, payload);
    }
    
    navigate('/app/manage-forms');
  } catch (err) {
    // Show error
  } finally {
    setSaving(false);
  }
};
```

---

## Part 8: Load Existing Form (Convert from SurveyJS)

```tsx
const loadForm = async (formId: string) => {
  setLoading(true);
  try {
    const form = await formsApi.getById(formId);
    
    setFormMeta({
      name: form.name,
      name_fa: form.name_fa,
      slug: form.slug,
      navigation_type: form.navigation_type || 'default',
      direction: form.direction || 'ltr',
      status: form.status
    });
    
    // Convert SurveyJS schema to builder state
    if (form.schema?.pages) {
      setPages(form.schema.pages.map(convertPageFromSurveyJS));
    }
  } catch (err) {
    // Show error
  } finally {
    setLoading(false);
  }
};

const convertPageFromSurveyJS = (page: any): PageDef => {
  return {
    name: page.name,
    title: page.title || page.name,
    elements: (page.elements || []).map((el: any) => {
      if (el.type === 'panel') {
        return {
          type: 'panel',
          name: el.name,
          title: el.title || el.name,
          elements: (el.elements || []).map(convertFieldFromSurveyJS)
        };
      }
      return convertFieldFromSurveyJS(el);
    })
  };
};

const convertFieldFromSurveyJS = (field: any): FieldDef => {
  return {
    type: field.type,
    name: field.name,
    title: field.title || field.name,
    isRequired: field.isRequired,
    placeholder: field.placeholder,
    inputType: field.inputType,
    choices: field.choices,
    rateCount: field.rateCount,
    acceptedTypes: field.acceptedTypes,
  };
};
```

---

## Part 9: Preview Dialog

### File: `frontend/src/components/form-builder/PreviewDialog.tsx`

```tsx
interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  schema: object;
  direction: 'ltr' | 'rtl';
  navigationType: string;
}

// Full-screen dialog
// Render SurveyFormRenderer with current schema
// Close button
```

---

## Part 10: Update Routes and Integrate

### File: `frontend/src/App.tsx`

Add route:

```tsx
import FormBuilderPage from './pages/admin/FormBuilderPage';

// In routes:
<Route path="/app/form-builder/new" element={<FormBuilderPage />} />
<Route path="/app/form-builder/:id" element={<FormBuilderPage />} />
```

### File: `frontend/src/pages/admin/ManageFormsPage.tsx`

Update buttons:

```tsx
// Change "Create Form" button
<Button onClick={() => navigate('/app/form-builder/new')}>
  Create Form
</Button>

// Change edit button in table row
<Button 
  icon="edit" 
  onClick={() => navigate(`/app/form-builder/${form.id}`)}
/>
```

---

## Implementation Order

| Step | Task |
|------|------|
| 1 | Create types file: `frontend/src/types/form-builder.ts` |
| 2 | Create `FormBuilderPage.tsx` with basic layout |
| 3 | Create `FieldTypeList.tsx` |
| 4 | Create `PageTabs.tsx` |
| 5 | Create `FieldItem.tsx` and `FieldList.tsx` |
| 6 | Create `PanelItem.tsx` |
| 7 | Create `FieldConfigPanel.tsx` with choices editor |
| 8 | Implement state management functions in FormBuilderPage |
| 9 | Implement Save (convertToSurveyJSSchema) |
| 10 | Implement Load (convertFromSurveyJS) |
| 11 | Create `PreviewDialog.tsx` |
| 12 | Update App.tsx routes |
| 13 | Update ManageFormsPage buttons |
| 14 | Rebuild and test |

---

## Testing Checklist

- [ ] Create new form from Manage Forms
- [ ] Add page, rename page, remove page
- [ ] Add fields of each type
- [ ] Add panel with fields inside
- [ ] Move fields up/down
- [ ] Remove fields
- [ ] Configure field properties (label, required, placeholder)
- [ ] Configure dropdown/radio choices
- [ ] Preview form
- [ ] Save form
- [ ] Edit existing form
- [ ] Verify saved form works in normal form view
