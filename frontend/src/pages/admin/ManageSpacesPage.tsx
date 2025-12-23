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
  CheckBox
} from '@ui5/webcomponents-react';
import AdminLayout from '../../components/AdminLayout';
import { spacesApi, Space, CreateSpaceDto, UpdateSpaceDto } from '../../services/adminApi';
import '@ui5/webcomponents-icons/dist/AllIcons';

const ICONS = ['folder', 'money-bills', 'employee', 'it-host', 'outbox', 'settings', 'home', 'factory', 'customer'];
const COLORS = ['#0a6ed1', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

function ManageSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [deletingSpace, setDeletingSpace] = useState<Space | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateSpaceDto>>({
    name: '',
    name_fa: '',
    slug: '',
    icon: 'folder',
    color: '#0a6ed1',
    order_index: 0,
    direction: 'ltr',
    is_active: true
  });

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const data = await spacesApi.getAll();
      setSpaces(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (space?: Space) => {
    if (space) {
      setEditingSpace(space);
      setFormData({
        name: space.name,
        name_fa: space.name_fa,
        slug: space.slug,
        icon: space.icon,
        color: space.color,
        order_index: space.order_index,
        direction: space.direction,
        is_active: space.is_active
      });
    } else {
      setEditingSpace(null);
      const maxOrder = spaces.length > 0 ? Math.max(...spaces.map(s => s.order_index)) : 0;
      setFormData({
        name: '',
        name_fa: '',
        slug: '',
        icon: 'folder',
        color: '#0a6ed1',
        order_index: maxOrder + 1,
        direction: 'ltr',
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSpace(null);
    setFormData({
      name: '',
      name_fa: '',
      slug: '',
      icon: 'folder',
      color: '#0a6ed1',
      order_index: 0,
      direction: 'ltr',
      is_active: true
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name || '') ? generateSlug(value) : prev.slug
    }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (editingSpace) {
        await spacesApi.update(editingSpace.id, formData as UpdateSpaceDto);
        setSuccess('Space updated successfully');
      } else {
        await spacesApi.create(formData as CreateSpaceDto);
        setSuccess('Space created successfully');
      }
      handleCloseDialog();
      loadSpaces();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save space');
    }
  };

  const handleDelete = async () => {
    if (!deletingSpace) return;
    try {
      setError(null);
      await spacesApi.delete(deletingSpace.id);
      setSuccess('Space deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingSpace(null);
      loadSpaces();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete space');
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (space: Space) => {
    setDeletingSpace(space);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <AdminLayout
      icon="folder"
      title="Manage Spaces"
      titleFa="مدیریت فضاها"
      actions={
        <Button icon="add" design="Emphasized" onClick={() => handleOpenDialog()}>
          Add Space
        </Button>
      }
    >
      {/* Messages */}
      {error && (
        <MessageStrip
          design="Negative"
          style={{ marginBottom: '1rem' }}
          onClose={() => setError(null)}
        >
          {error}
        </MessageStrip>
      )}
      {success && (
        <MessageStrip
          design="Positive"
          style={{ marginBottom: '1rem' }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </MessageStrip>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '80px' }}>Order</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '60px' }}>Icon</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name (EN)</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name (FA)</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Slug</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '100px' }}>Color</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '100px' }}>Direction</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '80px' }}>Active</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spaces.map(space => (
              <tr key={space.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '1rem' }}>{space.order_index}</td>
                <td style={{ padding: '1rem' }}>
                  <Icon name={space.icon} style={{ color: space.color, fontSize: '1.25rem' }} />
                </td>
                <td style={{ padding: '1rem' }}>{space.name}</td>
                <td style={{ padding: '1rem' }}>{space.name_fa}</td>
                <td style={{ padding: '1rem' }}>
                  <code style={{ fontSize: '0.875rem', color: '#6a6d70' }}>{space.slug}</code>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: space.color,
                        border: '1px solid #e5e5e5'
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#6a6d70' }}>{space.color}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{space.direction.toUpperCase()}</td>
                <td style={{ padding: '1rem' }}>
                  {space.is_active ? (
                    <span style={{ color: '#10b981', fontWeight: 500 }}>✓</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>✗</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <FlexBox style={{ gap: '0.25rem' }}>
                    <Button
                      icon="edit"
                      design="Transparent"
                      onClick={() => handleOpenDialog(space)}
                    />
                    <Button
                      icon="delete"
                      design="Transparent"
                      onClick={() => openDeleteDialog(space)}
                    />
                  </FlexBox>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        headerText={editingSpace ? 'Edit Space' : 'Create Space'}
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button design="Emphasized" onClick={handleSave}>
                  {editingSpace ? 'Update' : 'Create'}
                </Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', minWidth: '500px' }}>
          <FlexBox direction="Column" style={{ gap: '1rem' }}>
            <div>
              <Label required>Name (English)</Label>
              <Input
                value={formData.name || ''}
                onInput={(e: any) => handleNameChange(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <Label required>Name (Persian)</Label>
              <Input
                value={formData.name_fa || ''}
                onInput={(e: any) => setFormData({ ...formData, name_fa: e.target.value })}
                style={{ width: '100%', direction: 'rtl' }}
              />
            </div>

            <div>
              <Label required>Slug</Label>
              <Input
                value={formData.slug || ''}
                onInput={(e: any) => setFormData({ ...formData, slug: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
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

            <div>
              <Label>Color</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, color: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                {COLORS.map(color => (
                  <Option key={color} value={color} selected={formData.color === color}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          background: color,
                          border: '1px solid #e5e5e5'
                        }}
                      />
                      {color}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Order Index</Label>
              <Input
                type="Number"
                value={String(formData.order_index || 0)}
                onInput={(e: any) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <Label>Direction</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, direction: e.detail.selectedOption.value as 'ltr' | 'rtl' })}
                style={{ width: '100%' }}
              >
                <Option value="ltr" selected={formData.direction === 'ltr'}>LTR</Option>
                <Option value="rtl" selected={formData.direction === 'rtl'}>RTL</Option>
              </Select>
            </div>

            <div>
              <CheckBox
                checked={formData.is_active || false}
                onChange={(e: any) => setFormData({ ...formData, is_active: e.target.checked })}
                text="Active"
              />
            </div>
          </FlexBox>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        headerText="Delete Space"
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button design="Negative" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem' }}>
          Are you sure you want to delete the space "{deletingSpace?.name}"? This action cannot be undone.
        </div>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageSpacesPage;
