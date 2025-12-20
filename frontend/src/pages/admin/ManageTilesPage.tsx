import { useState, useEffect } from 'react';
import {
  FlexBox,
  Button,
  Icon,
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
  CheckBox,
  TextArea
} from '@ui5/webcomponents-react';
import AdminLayout from '../../components/AdminLayout';
import { tilesApi, sectionsApi, pagesApi, spacesApi, Tile, Section, Page, Space, CreateTileDto, UpdateTileDto } from '../../services/adminApi';
import '@ui5/webcomponents-icons/dist/AllIcons';

const ICONS = ['folder', 'money-bills', 'employee', 'it-host', 'outbox', 'settings', 'home', 'factory', 'customer', 'document', 'list', 'form', 'chart-axis', 'create'];
const COLORS = ['#0a6ed1', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const TYPE_BADGES = {
  app: { bg: '#dbeafe', color: '#1e40af' },
  form: { bg: '#dcfce7', color: '#166534' },
  link: { bg: '#fef3c7', color: '#92400e' },
  kpi: { bg: '#f3e8ff', color: '#7c3aed' }
};

function ManageTilesPage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSectionId, setFilterSectionId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTile, setEditingTile] = useState<Tile | null>(null);
  const [deletingTile, setDeletingTile] = useState<Tile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateTileDto>>({
    section_id: '',
    name: '',
    name_fa: '',
    slug: '',
    description: '',
    icon: 'document',
    color: '#0a6ed1',
    type: 'app',
    order_index: 0,
    direction: 'ltr',
    config: undefined,
    is_active: true
  });

  const [configText, setConfigText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTiles();
  }, [filterSectionId]);

  const loadData = async () => {
    try {
      const [spacesData, pagesData, sectionsData] = await Promise.all([
        spacesApi.getAll(),
        pagesApi.getAll(),
        sectionsApi.getAll()
      ]);
      setSpaces(spacesData);
      setPages(pagesData);
      setSections(sectionsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const loadTiles = async () => {
    try {
      setLoading(true);
      const data = await tilesApi.getAll(filterSectionId || undefined);
      setTiles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tiles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tile?: Tile) => {
    if (tile) {
      setEditingTile(tile);
      setFormData({
        section_id: tile.section_id,
        name: tile.name,
        name_fa: tile.name_fa,
        slug: tile.slug,
        description: tile.description,
        icon: tile.icon,
        color: tile.color,
        type: tile.type,
        order_index: tile.order_index,
        direction: tile.direction,
        config: tile.config,
        is_active: tile.is_active
      });
      setConfigText(tile.config ? JSON.stringify(tile.config, null, 2) : '');
    } else {
      setEditingTile(null);
      const maxOrder = tiles.length > 0 ? Math.max(...tiles.map(t => t.order_index)) : 0;
      setFormData({
        section_id: filterSectionId || (sections.length > 0 ? sections[0].id : ''),
        name: '',
        name_fa: '',
        slug: '',
        description: '',
        icon: 'document',
        color: '#0a6ed1',
        type: 'app',
        order_index: maxOrder + 1,
        direction: 'ltr',
        config: undefined,
        is_active: true
      });
      setConfigText('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTile(null);
    setFormData({
      section_id: '',
      name: '',
      name_fa: '',
      slug: '',
      description: '',
      icon: 'document',
      color: '#0a6ed1',
      type: 'app',
      order_index: 0,
      direction: 'ltr',
      config: undefined,
      is_active: true
    });
    setConfigText('');
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

      // Parse config JSON if provided
      let config: Record<string, any> | undefined = undefined;
      if (configText.trim()) {
        try {
          config = JSON.parse(configText);
        } catch (e) {
          setError('Invalid JSON in config field');
          return;
        }
      }

      const dataToSave = { ...formData, config };

      if (editingTile) {
        await tilesApi.update(editingTile.id, dataToSave as UpdateTileDto);
        setSuccess('Tile updated successfully');
      } else {
        await tilesApi.create(dataToSave as CreateTileDto);
        setSuccess('Tile created successfully');
      }
      handleCloseDialog();
      loadTiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save tile');
    }
  };

  const handleDelete = async () => {
    if (!deletingTile) return;
    try {
      setError(null);
      await tilesApi.delete(deletingTile.id);
      setSuccess('Tile deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingTile(null);
      loadTiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete tile');
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (tile: Tile) => {
    setDeletingTile(tile);
    setDeleteDialogOpen(true);
  };

  const getSectionPath = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return sectionId;
    const page = pages.find(p => p.id === section.page_id);
    if (!page) return section.name_fa || section.name;
    const space = spaces.find(s => s.id === page.space_id);
    const spaceName = space?.name_fa || space?.name || '';
    const pageName = page.name_fa || page.name;
    const sectionName = section.name_fa || section.name;
    return `${spaceName} → ${pageName} → ${sectionName}`;
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.name_fa || section?.name || sectionId;
  };

  if (loading && sections.length === 0) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <AdminLayout
      icon="grid"
      title="Manage Tiles"
      titleFa="مدیریت کاشی‌ها"
      actions={
        <>
          <Select
            onChange={(e: any) => setFilterSectionId(e.detail.selectedOption.value)}
            style={{ width: '300px' }}
          >
            <Option value="">All Sections</Option>
            {sections.map(section => (
              <Option key={section.id} value={section.id} selected={filterSectionId === section.id}>
                {getSectionPath(section.id)}
              </Option>
            ))}
          </Select>
          <Button icon="add" design="Emphasized" onClick={() => handleOpenDialog()}>
            Add Tile
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
            <TableColumn style={{ width: '60px' }}>
              <Label>Order</Label>
            </TableColumn>
            <TableColumn style={{ width: '50px' }}>
              <Label>Icon</Label>
            </TableColumn>
            <TableColumn>
              <Label>Name (EN)</Label>
            </TableColumn>
            <TableColumn>
              <Label>Name (FA)</Label>
            </TableColumn>
            <TableColumn>
              <Label>Slug</Label>
            </TableColumn>
            <TableColumn style={{ width: '80px' }}>
              <Label>Type</Label>
            </TableColumn>
            <TableColumn>
              <Label>Section</Label>
            </TableColumn>
            <TableColumn style={{ width: '70px' }}>
              <Label>Active</Label>
            </TableColumn>
            <TableColumn style={{ width: '120px' }}>
              <Label>Actions</Label>
            </TableColumn>

            {tiles.map(tile => (
              <TableRow key={tile.id}>
                <TableCell>{tile.order_index}</TableCell>
                <TableCell>
                  <Icon name={tile.icon} style={{ color: tile.color, fontSize: '1.25rem' }} />
                </TableCell>
                <TableCell>{tile.name}</TableCell>
                <TableCell>{tile.name_fa}</TableCell>
                <TableCell>
                  <code style={{ fontSize: '0.875rem', color: '#6a6d70' }}>{tile.slug}</code>
                </TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: TYPE_BADGES[tile.type].bg,
                      color: TYPE_BADGES[tile.type].color
                    }}
                  >
                    {tile.type}
                  </span>
                </TableCell>
                <TableCell>{getSectionName(tile.section_id)}</TableCell>
                <TableCell>
                  {tile.is_active ? (
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
                      onClick={() => handleOpenDialog(tile)}
                    />
                    <Button
                      icon="delete"
                      design="Transparent"
                      onClick={() => openDeleteDialog(tile)}
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
        headerText={editingTile ? 'Edit Tile' : 'Create Tile'}
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button design="Emphasized" onClick={handleSave}>
                  {editingTile ? 'Update' : 'Create'}
                </Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', minWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
          <FlexBox direction="Column" style={{ gap: '1rem' }}>
            <div>
              <Label required>Section</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, section_id: e.detail.selectedOption.value })}
                style={{ width: '100%' }}
              >
                {sections.map(section => (
                  <Option key={section.id} value={section.id} selected={formData.section_id === section.id}>
                    {getSectionPath(section.id)}
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
              <Label>Description</Label>
              <Input
                value={formData.description || ''}
                onInput={(e: any) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <FlexBox style={{ gap: '1rem' }}>
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

              <div style={{ flex: 1 }}>
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
            </FlexBox>

            <FlexBox style={{ gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Label required>Type</Label>
                <Select
                  onChange={(e: any) => setFormData({ ...formData, type: e.detail.selectedOption.value as any })}
                  style={{ width: '100%' }}
                >
                  <Option value="app" selected={formData.type === 'app'}>App</Option>
                  <Option value="form" selected={formData.type === 'form'}>Form</Option>
                  <Option value="link" selected={formData.type === 'link'}>Link</Option>
                  <Option value="kpi" selected={formData.type === 'kpi'}>KPI</Option>
                </Select>
              </div>

              <div style={{ flex: 1 }}>
                <Label>Direction</Label>
                <Select
                  onChange={(e: any) => setFormData({ ...formData, direction: e.detail.selectedOption.value as 'ltr' | 'rtl' })}
                  style={{ width: '100%' }}
                >
                  <Option value="ltr" selected={formData.direction === 'ltr'}>LTR</Option>
                  <Option value="rtl" selected={formData.direction === 'rtl'}>RTL</Option>
                </Select>
              </div>
            </FlexBox>

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
              <Label>Config (JSON)</Label>
              <TextArea
                value={configText}
                onInput={(e: any) => setConfigText(e.target.value)}
                rows={5}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.875rem' }}
                placeholder='{"route": "/app/my-app"}'
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
        headerText="Delete Tile"
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
          Are you sure you want to delete the tile "{deletingTile?.name}"? This action cannot be undone.
        </div>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageTilesPage;
