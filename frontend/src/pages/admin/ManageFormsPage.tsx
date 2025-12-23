import { useState, useEffect } from 'react';
import {
  FlexBox,
  Button,
  Icon,
  Dialog,
  Bar,
  Input,
  Label,
  Select,
  Option,
  MessageStrip,
  BusyIndicator,
  TextArea
} from '@ui5/webcomponents-react';
import AdminLayout from '../../components/AdminLayout';
import { formsApi, Form, CreateFormDto, UpdateFormDto } from '../../services/adminApi';
import '@ui5/webcomponents-icons/dist/AllIcons';

const ICONS = ['document', 'form', 'list', 'folder', 'edit', 'create', 'calendar', 'employee', 'customer'];
const COLORS = ['#0a6ed1', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
const STATUSES = ['active', 'draft', 'archived'];

const STATUS_BADGES = {
  active: { bg: '#dcfce7', color: '#166534' },
  draft: { bg: '#fef3c7', color: '#92400e' },
  archived: { bg: '#f3f4f6', color: '#6b7280' }
};

const getNavigationLabel = (type: string): string => {
  switch (type) {
    case 'toc-left': return 'Sidebar Left';
    case 'toc-right': return 'Sidebar Right';
    case 'progress-buttons': return 'Top Tabs';
    case 'default':
    default: return 'Default';
  }
};

const getNavigationBadgeColor = (type: string): { bg: string; text: string } => {
  switch (type) {
    case 'toc-left': return { bg: '#dbeafe', text: '#1e40af' };      // Blue
    case 'toc-right': return { bg: '#e0e7ff', text: '#3730a3' };     // Indigo
    case 'progress-buttons': return { bg: '#dcfce7', text: '#166534' }; // Green
    case 'default':
    default: return { bg: '#f3f4f6', text: '#374151' };              // Gray
  }
};

function ManageFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [deletingForm, setDeletingForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateFormDto>>({
    name: '',
    name_fa: '',
    slug: '',
    description: '',
    status: 'draft',
    icon: 'document',
    color: '#0a6ed1',
    direction: 'ltr',
    navigation_type: 'default',
    schema: {}
  });

  const [schemaText, setSchemaText] = useState('{}');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getAll();
      setForms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (form?: Form) => {
    if (form) {
      setEditingForm(form);
      setFormData({
        name: form.name,
        name_fa: form.name_fa,
        slug: form.slug,
        description: form.description || '',
        status: form.status,
        icon: form.icon,
        color: form.color,
        direction: form.direction || 'ltr',
        navigation_type: form.navigation_type || 'default',
        schema: form.schema || {}
      });
      setSchemaText(JSON.stringify(form.schema || {}, null, 2));
    } else {
      setEditingForm(null);
      setFormData({
        name: '',
        name_fa: '',
        slug: '',
        description: '',
        status: 'draft',
        icon: 'document',
        color: '#0a6ed1',
        direction: 'ltr',
        navigation_type: 'default',
        schema: {}
      });
      setSchemaText('{}');
    }
    setError(null);
    setSuccess(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Parse schema JSON
      let schema = {};
      try {
        schema = JSON.parse(schemaText);
      } catch (e) {
        setError('Invalid JSON in schema field');
        return;
      }

      const dataToSave = {
        ...formData,
        schema
      } as CreateFormDto;

      if (editingForm) {
        await formsApi.update(editingForm.id, dataToSave);
        setSuccess('Form updated successfully');
      } else {
        await formsApi.create(dataToSave);
        setSuccess('Form created successfully');
      }
      setDialogOpen(false);
      loadForms();
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Failed to save form');
      }
    }
  };

  const openDeleteDialog = (form: Form) => {
    setDeletingForm(form);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingForm) return;

    try {
      await formsApi.delete(deletingForm.id);
      setSuccess('Form deleted successfully (unlinked from tiles)');
      setDeleteDialogOpen(false);
      loadForms();
    } catch (err: any) {
      setError(err.message || 'Failed to delete form');
    }
  };

  const generateSlug = () => {
    const slug = formData.name?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, slug });
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Forms" titleFa="مدیریت فرم‌ها" icon="form">
        <FlexBox justifyContent="Center" alignItems="Center" style={{ minHeight: '50vh' }}>
          <BusyIndicator active />
        </FlexBox>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Forms"
      titleFa="مدیریت فرم‌ها"
      icon="form"
      actions={
        <Button icon="add" design="Emphasized" onClick={() => handleOpenDialog()}>
          Create Form
        </Button>
      }
    >
      {error && (
        <MessageStrip
          design="Negative"
          onClose={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        >
          {error}
        </MessageStrip>
      )}

      {success && (
        <MessageStrip
          design="Positive"
          onClose={() => setSuccess(null)}
          style={{ marginBottom: '1rem' }}
        >
          {success}
        </MessageStrip>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '50px' }}>Icon</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name (EN)</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name (FA)</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Slug</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '100px' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '120px' }}>Navigation</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '1rem' }}>
                  <Icon name={form.icon} style={{ color: form.color, fontSize: '1.25rem' }} />
                </td>
                <td style={{ padding: '1rem' }}>{form.name}</td>
                <td style={{ padding: '1rem' }}>{form.name_fa}</td>
                <td style={{ padding: '1rem' }}>
                  <code style={{ fontSize: '0.875rem', color: '#6a6d70' }}>{form.slug}</code>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: STATUS_BADGES[form.status as keyof typeof STATUS_BADGES]?.bg || '#f3f4f6',
                      color: STATUS_BADGES[form.status as keyof typeof STATUS_BADGES]?.color || '#6b7280'
                    }}
                  >
                    {form.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: getNavigationBadgeColor(form.navigation_type).bg,
                      color: getNavigationBadgeColor(form.navigation_type).text
                    }}
                  >
                    {getNavigationLabel(form.navigation_type)}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <FlexBox style={{ gap: '0.25rem' }}>
                    <Button
                      icon="edit"
                      design="Transparent"
                      onClick={() => handleOpenDialog(form)}
                    />
                    <Button
                      icon="delete"
                      design="Transparent"
                      onClick={() => openDeleteDialog(form)}
                    />
                  </FlexBox>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {forms.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            No forms found. Click "Create Form" to add one.
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog
        open={dialogOpen}
        headerText={editingForm ? 'Edit Form' : 'Create Form'}
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button design="Emphasized" onClick={handleSave}>Save</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '500px' }}>
          <FlexBox style={{ gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Label required>Name (EN)</Label>
              <Input
                value={formData.name}
                onInput={(e: any) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Label required>Name (FA)</Label>
              <Input
                value={formData.name_fa}
                onInput={(e: any) => setFormData({ ...formData, name_fa: e.target.value })}
                style={{ width: '100%', direction: 'rtl' }}
              />
            </div>
          </FlexBox>

          <div>
            <Label required>Slug</Label>
            <FlexBox style={{ gap: '0.5rem' }}>
              <Input
                value={formData.slug}
                onInput={(e: any) => setFormData({ ...formData, slug: e.target.value })}
                style={{ flex: 1 }}
              />
              <Button icon="generate" onClick={generateSlug} tooltip="Generate from Name (EN)">Auto</Button>
            </FlexBox>
          </div>

          <div>
            <Label>Description</Label>
            <TextArea
              value={formData.description || ''}
              onInput={(e: any) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              style={{ width: '100%' }}
            />
          </div>

          <FlexBox style={{ gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Label required>Status</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, status: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                {STATUSES.map(status => (
                  <Option key={status} value={status} selected={formData.status === status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ flex: 1 }}>
              <Label>Icon</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, icon: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                {ICONS.map(icon => (
                  <Option key={icon} value={icon} selected={formData.icon === icon}>
                    {icon}
                  </Option>
                ))}
              </Select>
            </div>
          </FlexBox>

          <div>
            <Label>Color</Label>
            <FlexBox style={{ gap: '0.5rem' }}>
              {COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid #000' : '1px solid #e5e7eb'
                  }}
                />
              ))}
            </FlexBox>
          </div>

          <FlexBox style={{ gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Label>Direction</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, direction: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                <Option value="ltr" selected={formData.direction === 'ltr'}>
                  Left to Right (LTR)
                </Option>
                <Option value="rtl" selected={formData.direction === 'rtl'}>
                  Right to Left (RTL)
                </Option>
              </Select>
            </div>

            <div style={{ flex: 1 }}>
              <Label>Navigation Style</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, navigation_type: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                <Option value="default" selected={formData.navigation_type === 'default'}>
                  Default (Next/Previous)
                </Option>
                <Option value="toc-left" selected={formData.navigation_type === 'toc-left'}>
                  Sidebar Left
                </Option>
                <Option value="toc-right" selected={formData.navigation_type === 'toc-right'}>
                  Sidebar Right
                </Option>
                <Option value="progress-buttons" selected={formData.navigation_type === 'progress-buttons'}>
                  Top Tabs (Progress Buttons)
                </Option>
              </Select>
            </div>
          </FlexBox>

          <div>
            <Label>Schema (JSON)</Label>
            <TextArea
              value={schemaText}
              onInput={(e: any) => setSchemaText(e.target.value)}
              rows={8}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.875rem' }}
              placeholder='{"fields": [...]}'
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Note: Full form builder is future work. For now, manually enter JSON schema.
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        headerText="Delete Form"
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button design="Negative" onClick={handleDelete}>Delete</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem' }}>
          <MessageStrip design="Information" hideCloseButton style={{ marginBottom: '1rem' }}>
            This will unlink the form from any tiles that reference it. The tiles will not be deleted.
          </MessageStrip>
          <p>
            Are you sure you want to delete the form <strong>{deletingForm?.name}</strong>?
          </p>
        </div>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageFormsPage;
