import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShellBar, FlexBox, Button, Input, Label, Select, Option,
  MessageStrip, BusyIndicator
} from '@ui5/webcomponents-react';
import { PageDef, PanelDef, FieldDef, FieldPath } from '../../types/form-builder';
import { formsApi } from '../../services/adminApi';
import { FieldTypeList } from '../../components/form-builder/FieldTypeList';
import { PageTabs } from '../../components/form-builder/PageTabs';
import { FieldList } from '../../components/form-builder/FieldList';
import { FieldConfigPanel } from '../../components/form-builder/FieldConfigPanel';
import { PreviewDialog } from '../../components/form-builder/PreviewDialog';

function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  // State
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
  const [addingFieldToPanelIndex, setAddingFieldToPanelIndex] = useState<number | null>(null);

  // Load existing form if editing
  useEffect(() => {
    if (!isNew && id) {
      loadForm(id);
    }
  }, [id, isNew]);

  // Helper Functions
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

  // Page Management
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
    if (pages.length === 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    setSelectedPageIndex(Math.min(selectedPageIndex, newPages.length - 1));
    setSelectedField(null);
  };

  const renamePage = (index: number, title: string) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], title };
    setPages(newPages);
  };

  // Field Management
  const addField = (type: string) => {
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

    // Add rating count for rating
    if (type === 'rating') {
      newField.rateCount = 5;
    }

    // Add to panel or page
    const newPages = [...pages];
    if (addingFieldToPanelIndex !== null) {
      (newPages[selectedPageIndex].elements[addingFieldToPanelIndex] as PanelDef).elements.push(newField);
      setAddingFieldToPanelIndex(null);
    } else {
      newPages[selectedPageIndex].elements.push(newField);
    }
    setPages(newPages);

    // Auto-select the new field
    const path: FieldPath = {
      pageIndex: selectedPageIndex,
      panelIndex: addingFieldToPanelIndex !== null ? addingFieldToPanelIndex : undefined,
      fieldIndex: addingFieldToPanelIndex !== null
        ? (newPages[selectedPageIndex].elements[addingFieldToPanelIndex] as PanelDef).elements.length - 1
        : newPages[selectedPageIndex].elements.length - 1
    };
    setSelectedField(path);
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

  const removePanel = (panelIndex: number) => {
    const newPages = [...pages];
    newPages[selectedPageIndex].elements.splice(panelIndex, 1);
    setPages(newPages);
    setSelectedField(null);
  };

  const moveElement = (path: FieldPath, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const pageElements = newPages[path.pageIndex].elements;

    if (path.panelIndex !== undefined) {
      // Move field within panel
      const panel = pageElements[path.panelIndex] as PanelDef;
      const elements = panel.elements;
      const newIndex = direction === 'up' ? path.fieldIndex - 1 : path.fieldIndex + 1;

      if (newIndex < 0 || newIndex >= elements.length) return;

      [elements[path.fieldIndex], elements[newIndex]] = [elements[newIndex], elements[path.fieldIndex]];
      setSelectedField({ ...path, fieldIndex: newIndex });
    } else {
      // Move element on page
      const newIndex = direction === 'up' ? path.fieldIndex - 1 : path.fieldIndex + 1;

      if (newIndex < 0 || newIndex >= pageElements.length) return;

      [pageElements[path.fieldIndex], pageElements[newIndex]] = [pageElements[newIndex], pageElements[path.fieldIndex]];
      setSelectedField({ ...path, fieldIndex: newIndex });
    }

    setPages(newPages);
  };

  const movePanel = (panelIndex: number, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const elements = newPages[selectedPageIndex].elements;
    const newIndex = direction === 'up' ? panelIndex - 1 : panelIndex + 1;

    if (newIndex < 0 || newIndex >= elements.length) return;

    [elements[panelIndex], elements[newIndex]] = [elements[newIndex], elements[panelIndex]];
    setPages(newPages);
  };

  const updateField = (updates: Partial<FieldDef>) => {
    if (!selectedField) return;

    const newPages = [...pages];
    const pageElements = newPages[selectedField.pageIndex].elements;

    if (selectedField.panelIndex !== undefined) {
      // Update field in panel
      const panel = pageElements[selectedField.panelIndex] as PanelDef;
      panel.elements[selectedField.fieldIndex] = {
        ...panel.elements[selectedField.fieldIndex],
        ...updates
      };
    } else {
      // Update field on page
      const field = pageElements[selectedField.fieldIndex] as FieldDef;
      pageElements[selectedField.fieldIndex] = { ...field, ...updates };
    }

    setPages(newPages);
  };

  const getSelectedFieldData = (): FieldDef | null => {
    if (!selectedField) return null;

    const pageElements = pages[selectedField.pageIndex].elements;

    if (selectedField.panelIndex !== undefined) {
      const panel = pageElements[selectedField.panelIndex] as PanelDef;
      return panel.elements[selectedField.fieldIndex];
    } else {
      const element = pageElements[selectedField.fieldIndex];
      if ('type' in element && element.type !== 'panel') {
        return element as FieldDef;
      }
    }

    return null;
  };

  // Convert to SurveyJS Schema
  const convertToSurveyJSSchema = (): object => {
    return {
      pages: pages.map(page => ({
        name: page.name,
        title: page.title,
        elements: page.elements.map(el => {
          if ('type' in el && el.type === 'panel') {
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

  // Load Form from API
  const loadForm = async (formId: string) => {
    setLoading(true);
    try {
      const form = await formsApi.getById(formId);

      setFormMeta({
        name: form.name,
        name_fa: form.name_fa,
        slug: form.slug,
        navigation_type: form.navigation_type || 'default',
        direction: (form.direction as 'ltr' | 'rtl') || 'ltr',
        status: form.status
      });

      // Convert SurveyJS schema to builder state
      if (form.schema && typeof form.schema === 'object' && 'pages' in form.schema) {
        const schemaPages = (form.schema as any).pages;
        if (Array.isArray(schemaPages)) {
          setPages(schemaPages.map(convertPageFromSurveyJS));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load form');
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
          } as PanelDef;
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

  // Save Form
  const handleSave = async () => {
    // Validation
    if (!formMeta.name.trim()) {
      setError('Please enter a form name');
      return;
    }
    if (!formMeta.slug.trim()) {
      setError('Please enter a form slug');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const schema = convertToSurveyJSSchema();
      const payload = {
        ...formMeta,
        schema
      };

      if (isNew) {
        await formsApi.create(payload as any);
      } else if (id) {
        await formsApi.update(id, payload as any);
      }

      navigate('/app/manage-forms');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    const slug = formMeta.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormMeta({ ...formMeta, slug });
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ minHeight: '100vh' }}>
        <BusyIndicator active />
      </FlexBox>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Shell Bar */}
      <ShellBar
        primaryTitle={isNew ? 'Create Form' : 'Edit Form'}
        logo={<img alt="Logo" src="https://sap.github.io/ui5-webcomponents/assets/images/sap-logo-svg.svg" />}
        startButton={
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/app/manage-forms')} />
        }
      >
        <Button design="Transparent" onClick={() => setShowPreview(true)}>
          Preview
        </Button>
        <Button onClick={() => navigate('/app/manage-forms')}>Cancel</Button>
        <Button design="Emphasized" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </ShellBar>

      {/* Error Message */}
      {error && (
        <MessageStrip design="Negative" onClose={() => setError(null)} style={{ margin: '0.5rem' }}>
          {error}
        </MessageStrip>
      )}

      {/* Form Metadata */}
      <div style={{ padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <FlexBox style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Label required>Name (EN)</Label>
            <Input
              value={formMeta.name}
              onInput={(e: any) => setFormMeta({ ...formMeta, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <Label required>Name (FA)</Label>
            <Input
              value={formMeta.name_fa}
              onInput={(e: any) => setFormMeta({ ...formMeta, name_fa: e.target.value })}
              style={{ width: '100%', direction: 'rtl' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <Label required>Slug</Label>
            <FlexBox style={{ gap: '0.5rem' }}>
              <Input
                value={formMeta.slug}
                onInput={(e: any) => setFormMeta({ ...formMeta, slug: e.target.value })}
                style={{ flex: 1 }}
              />
              <Button icon="generate" onClick={generateSlug} tooltip="Generate from Name">Auto</Button>
            </FlexBox>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <Label>Navigation</Label>
            <Select
              onChange={(e: any) => setFormMeta({ ...formMeta, navigation_type: e.detail.selectedOption.value })}
              style={{ width: '100%' }}
            >
              <Option value="default" selected={formMeta.navigation_type === 'default'}>Default</Option>
              <Option value="toc-left" selected={formMeta.navigation_type === 'toc-left'}>Sidebar Left</Option>
              <Option value="toc-right" selected={formMeta.navigation_type === 'toc-right'}>Sidebar Right</Option>
              <Option value="progress-buttons" selected={formMeta.navigation_type === 'progress-buttons'}>Top Tabs</Option>
            </Select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <Label>Direction</Label>
            <Select
              onChange={(e: any) => setFormMeta({ ...formMeta, direction: e.detail.selectedOption.value as 'ltr' | 'rtl' })}
              style={{ width: '100%' }}
            >
              <Option value="ltr" selected={formMeta.direction === 'ltr'}>LTR</Option>
              <Option value="rtl" selected={formMeta.direction === 'rtl'}>RTL</Option>
            </Select>
          </div>
        </FlexBox>
      </div>

      {/* Page Tabs */}
      <PageTabs
        pages={pages}
        selectedIndex={selectedPageIndex}
        onSelect={setSelectedPageIndex}
        onAdd={addPage}
        onRemove={removePage}
        onRename={renamePage}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '250px 1fr 350px', overflow: 'hidden' }}>
        {/* Left: Field Types */}
        <FieldTypeList
          onAddField={(type) => {
            setAddingFieldToPanelIndex(null);
            addField(type);
          }}
          onAddPanel={addPanel}
        />

        {/* Center: Field List */}
        <FieldList
          pageIndex={selectedPageIndex}
          elements={pages[selectedPageIndex]?.elements || []}
          selectedField={selectedField}
          onSelectField={setSelectedField}
          onMoveField={moveElement}
          onRemoveField={removeElement}
          onMovePanel={movePanel}
          onRemovePanel={removePanel}
          onAddFieldToPanel={(panelIndex) => {
            setAddingFieldToPanelIndex(panelIndex);
          }}
        />

        {/* Right: Field Config */}
        <FieldConfigPanel
          field={getSelectedFieldData()}
          onChange={updateField}
        />
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        schema={convertToSurveyJSSchema()}
        direction={formMeta.direction}
        navigationType={formMeta.navigation_type}
      />
    </div>
  );
}

export default FormBuilderPage;
