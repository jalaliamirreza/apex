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
import { pagesApi, spacesApi, Page, Space, CreatePageDto, UpdatePageDto } from '../../services/adminApi';
import '@ui5/webcomponents-icons/dist/AllIcons';

const ICONS = ['folder', 'money-bills', 'employee', 'it-host', 'outbox', 'settings', 'home', 'factory', 'customer', 'document', 'list', 'org-chart'];

function ManagePagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpaceId, setFilterSpaceId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreatePageDto>>({
    space_id: '',
    name: '',
    name_fa: '',
    slug: '',
    icon: 'folder',
    order_index: 0,
    is_default: false,
    is_active: true
  });

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    loadPages();
  }, [filterSpaceId]);

  const loadSpaces = async () => {
    try {
      const data = await spacesApi.getAll();
      setSpaces(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load spaces');
    }
  };

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await pagesApi.getAll(filterSpaceId || undefined);
      setPages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        space_id: page.space_id,
        name: page.name,
        name_fa: page.name_fa,
        slug: page.slug,
        icon: page.icon,
        order_index: page.order_index,
        is_default: page.is_default,
        is_active: page.is_active
      });
    } else {
      setEditingPage(null);
      const maxOrder = pages.length > 0 ? Math.max(...pages.map(p => p.order_index)) : 0;
      setFormData({
        space_id: filterSpaceId || (spaces.length > 0 ? spaces[0].id : ''),
        name: '',
        name_fa: '',
        slug: '',
        icon: 'folder',
        order_index: maxOrder + 1,
        is_default: false,
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPage(null);
    setFormData({
      space_id: '',
      name: '',
      name_fa: '',
      slug: '',
      icon: 'folder',
      order_index: 0,
      is_default: false,
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
      if (editingPage) {
        await pagesApi.update(editingPage.id, formData as UpdatePageDto);
        setSuccess('Page updated successfully');
      } else {
        await pagesApi.create(formData as CreatePageDto);
        setSuccess('Page created successfully');
      }
      handleCloseDialog();
      loadPages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save page');
    }
  };

  const handleDelete = async () => {
    if (!deletingPage) return;
    try {
      setError(null);
      await pagesApi.delete(deletingPage.id);
      setSuccess('Page deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingPage(null);
      loadPages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete page');
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (page: Page) => {
    setDeletingPage(page);
    setDeleteDialogOpen(true);
  };

  const getSpaceName = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.name_fa || space?.name || spaceId;
  };

  if (loading && spaces.length === 0) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <AdminLayout
      icon="document"
      title="Manage Pages"
      titleFa="مدیریت صفحات"
      actions={
        <>
          <Select
            onChange={(e: any) => setFilterSpaceId(e.detail.selectedOption.value)}
            style={{ width: '200px' }}
          >
            <Option value="">All Spaces</Option>
            {spaces.map(space => (
              <Option key={space.id} value={space.id} selected={filterSpaceId === space.id}>
                {space.name_fa || space.name}
              </Option>
            ))}
          </Select>
          <Button icon="add" design="Emphasized" onClick={() => handleOpenDialog()}>
            Add Page
          </Button>
        </>
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
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <FlexBox justifyContent="Center" alignItems="Center" style={{ padding: '2rem' }}>
            <BusyIndicator active size="M" />
          </FlexBox>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '80px' }}>Order</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Space</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '60px' }}>Icon</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name (EN)</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name (FA)</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Slug</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '80px' }}>Default</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '80px' }}>Active</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>{page.order_index}</td>
                  <td style={{ padding: '1rem' }}>{getSpaceName(page.space_id)}</td>
                  <td style={{ padding: '1rem' }}>
                    <Icon name={page.icon} style={{ fontSize: '1.25rem', color: '#0070f2' }} />
                  </td>
                  <td style={{ padding: '1rem' }}>{page.name}</td>
                  <td style={{ padding: '1rem' }}>{page.name_fa}</td>
                  <td style={{ padding: '1rem' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6a6d70' }}>{page.slug}</code>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {page.is_default ? (
                      <span style={{ color: '#10b981', fontWeight: 500 }}>✓</span>
                    ) : (
                      <span style={{ color: '#6a6d70' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {page.is_active ? (
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
                        onClick={() => handleOpenDialog(page)}
                      />
                      <Button
                        icon="delete"
                        design="Transparent"
                        onClick={() => openDeleteDialog(page)}
                      />
                    </FlexBox>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        headerText={editingPage ? 'Edit Page' : 'Create Page'}
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button design="Emphasized" onClick={handleSave}>
                  {editingPage ? 'Update' : 'Create'}
                </Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', minWidth: '500px' }}>
          <FlexBox direction="Column" style={{ gap: '1rem' }}>
            <div>
              <Label required>Space</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, space_id: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                {spaces.map(space => (
                  <Option key={space.id} value={space.id} selected={formData.space_id === space.id}>
                    {space.name_fa || space.name}
                  </Option>
                ))}
              </Select>
            </div>

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
              <Label>Order Index</Label>
              <Input
                type="Number"
                value={String(formData.order_index || 0)}
                onInput={(e: any) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <CheckBox
                checked={formData.is_default || false}
                onChange={(e: any) => setFormData({ ...formData, is_default: e.target.checked })}
                text="Default Page"
              />
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
        headerText="Delete Page"
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
          Are you sure you want to delete the page "{deletingPage?.name}"? This action cannot be undone.
        </div>
      </Dialog>
    </AdminLayout>
  );
}

export default ManagePagesPage;
