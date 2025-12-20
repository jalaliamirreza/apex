import { useState, useEffect } from 'react';
import {
  FlexBox,
  Button,
  Table,
  TableColumn,
  TableRow,
  TableCell,
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
import { sectionsApi, pagesApi, spacesApi, Section, Page, Space, CreateSectionDto, UpdateSectionDto } from '../../services/adminApi';
import '@ui5/webcomponents-icons/dist/AllIcons';

function ManageSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPageId, setFilterPageId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateSectionDto>>({
    page_id: '',
    name: '',
    name_fa: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSections();
  }, [filterPageId]);

  const loadData = async () => {
    try {
      const [spacesData, pagesData] = await Promise.all([
        spacesApi.getAll(),
        pagesApi.getAll()
      ]);
      setSpaces(spacesData);
      setPages(pagesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await sectionsApi.getAll(filterPageId || undefined);
      setSections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        page_id: section.page_id,
        name: section.name,
        name_fa: section.name_fa,
        order_index: section.order_index,
        is_active: section.is_active
      });
    } else {
      setEditingSection(null);
      const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order_index)) : 0;
      setFormData({
        page_id: filterPageId || (pages.length > 0 ? pages[0].id : ''),
        name: '',
        name_fa: '',
        order_index: maxOrder + 1,
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSection(null);
    setFormData({
      page_id: '',
      name: '',
      name_fa: '',
      order_index: 0,
      is_active: true
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (editingSection) {
        await sectionsApi.update(editingSection.id, formData as UpdateSectionDto);
        setSuccess('Section updated successfully');
      } else {
        await sectionsApi.create(formData as CreateSectionDto);
        setSuccess('Section created successfully');
      }
      handleCloseDialog();
      loadSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save section');
    }
  };

  const handleDelete = async () => {
    if (!deletingSection) return;
    try {
      setError(null);
      await sectionsApi.delete(deletingSection.id);
      setSuccess('Section deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingSection(null);
      loadSections();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete section');
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (section: Section) => {
    setDeletingSection(section);
    setDeleteDialogOpen(true);
  };

  const getPagePath = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return pageId;
    const space = spaces.find(s => s.id === page.space_id);
    const spaceName = space?.name_fa || space?.name || '';
    const pageName = page.name_fa || page.name;
    return `${spaceName} → ${pageName}`;
  };

  const getSpaceName = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return '';
    const space = spaces.find(s => s.id === page.space_id);
    return space?.name_fa || space?.name || '';
  };

  const getPageName = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    return page?.name_fa || page?.name || pageId;
  };

  if (loading && pages.length === 0) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <AdminLayout
      icon="list"
      title="Manage Sections"
      titleFa="مدیریت بخش‌ها"
      actions={
        <>
          <Select
            onChange={(e: any) => setFilterPageId(e.detail.selectedOption.value)}
            style={{ width: '250px' }}
          >
            <Option value="">All Pages</Option>
            {pages.map(page => (
              <Option key={page.id} value={page.id} selected={filterPageId === page.id}>
                {getPagePath(page.id)}
              </Option>
            ))}
          </Select>
          <Button icon="add" design="Emphasized" onClick={() => handleOpenDialog()}>
            Add Section
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
          <Table>
            <TableColumn style={{ width: '80px' }}>
              <Label>Order</Label>
            </TableColumn>
            <TableColumn>
              <Label>Space</Label>
            </TableColumn>
            <TableColumn>
              <Label>Page</Label>
            </TableColumn>
            <TableColumn>
              <Label>Name (EN)</Label>
            </TableColumn>
            <TableColumn>
              <Label>Name (FA)</Label>
            </TableColumn>
            <TableColumn style={{ width: '80px' }}>
              <Label>Active</Label>
            </TableColumn>
            <TableColumn style={{ width: '120px' }}>
              <Label>Actions</Label>
            </TableColumn>

            {sections.map(section => (
              <TableRow key={section.id}>
                <TableCell>{section.order_index}</TableCell>
                <TableCell>{getSpaceName(section.page_id)}</TableCell>
                <TableCell>{getPageName(section.page_id)}</TableCell>
                <TableCell>{section.name}</TableCell>
                <TableCell>{section.name_fa}</TableCell>
                <TableCell>
                  {section.is_active ? (
                    <span style={{ color: '#10b981', fontWeight: 500 }}>✓</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 500 }}>✗</span>
                  )}
                </TableCell>
                <TableCell>
                  <FlexBox style={{ gap: '0.25rem' }}>
                    <Button
                      icon="edit"
                      design="Transparent"
                      onClick={() => handleOpenDialog(section)}
                    />
                    <Button
                      icon="delete"
                      design="Transparent"
                      onClick={() => openDeleteDialog(section)}
                    />
                  </FlexBox>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        headerText={editingSection ? 'Edit Section' : 'Create Section'}
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button design="Emphasized" onClick={handleSave}>
                  {editingSection ? 'Update' : 'Create'}
                </Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', minWidth: '500px' }}>
          <FlexBox direction="Column" style={{ gap: '1rem' }}>
            <div>
              <Label required>Page</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, page_id: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                {pages.map(page => (
                  <Option key={page.id} value={page.id} selected={formData.page_id === page.id}>
                    {getPagePath(page.id)}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Label required>Name (English)</Label>
              <Input
                value={formData.name || ''}
                onInput={(e: any) => setFormData({ ...formData, name: e.target.value })}
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
        headerText="Delete Section"
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
          Are you sure you want to delete the section "{deletingSection?.name}"? This action cannot be undone.
        </div>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageSectionsPage;
