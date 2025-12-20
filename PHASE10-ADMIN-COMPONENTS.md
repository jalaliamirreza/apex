# Phase 10 - Generic Admin App Components

## Concept

All admin apps use the **same reusable components** with different configurations.
No separate pages for each entity - just config-driven rendering.

---

## Components to Create

| Component | Purpose |
|-----------|---------|
| `AdminApp` | Main wrapper - loads config, renders table or form |
| `AdminTable` | Generic table with search, sort, pagination, CRUD buttons |
| `AdminForm` | Generic form with dynamic fields based on config |
| `AdminDialog` | Popup wrapper for add/edit forms |

---

## Tile Config Schema

Each admin tile stores its config in the database:

```typescript
interface AdminAppConfig {
  entity: string;           // Entity name for display
  endpoint: string;         // API endpoint
  columns: ColumnConfig[];  // Table columns
  fields: FieldConfig[];    // Form fields
  actions?: {               // Optional action overrides
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  };
}

interface ColumnConfig {
  key: string;              // Field key from data
  label: string;            // Display label
  type?: 'text' | 'icon' | 'boolean' | 'date';  // Render type
  width?: string;           // Column width
}

interface FieldConfig {
  key: string;              // Field key
  label: string;            // Display label
  type: 'text' | 'number' | 'select' | 'switch' | 'icon-picker' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];  // For select type
  placeholder?: string;
}
```

---

## Example Configs

### Manage Spaces
```json
{
  "entity": "Spaces",
  "endpoint": "/api/launchpad/spaces",
  "columns": [
    { "key": "order", "label": "#", "width": "60px" },
    { "key": "name", "label": "Name" },
    { "key": "icon", "label": "Icon", "type": "icon" },
    { "key": "isActive", "label": "Active", "type": "boolean" }
  ],
  "fields": [
    { "key": "name", "label": "Name", "type": "text", "required": true },
    { "key": "icon", "label": "Icon", "type": "text", "placeholder": "e.g. folder-blank" },
    { "key": "isActive", "label": "Active", "type": "switch" }
  ]
}
```

### Manage Pages
```json
{
  "entity": "Pages",
  "endpoint": "/api/launchpad/pages",
  "columns": [
    { "key": "name", "label": "Name" },
    { "key": "spaceName", "label": "Space" },
    { "key": "isDefault", "label": "Default", "type": "boolean" }
  ],
  "fields": [
    { "key": "name", "label": "Name", "type": "text", "required": true },
    { "key": "spaceId", "label": "Space", "type": "select", "required": true },
    { "key": "isDefault", "label": "Default Page", "type": "switch" }
  ]
}
```

### Manage Users
```json
{
  "entity": "Users",
  "endpoint": "/api/users",
  "columns": [
    { "key": "name", "label": "Name" },
    { "key": "email", "label": "Email" },
    { "key": "role", "label": "Role" },
    { "key": "isActive", "label": "Active", "type": "boolean" }
  ],
  "fields": [
    { "key": "name", "label": "Name", "type": "text", "required": true },
    { "key": "email", "label": "Email", "type": "text", "required": true },
    { "key": "role", "label": "Role", "type": "select" },
    { "key": "isActive", "label": "Active", "type": "switch" }
  ]
}
```

---

## File Structure

```
frontend/src/components/admin/
├── AdminApp.tsx        # Main wrapper
├── AdminTable.tsx      # Generic table
├── AdminForm.tsx       # Generic form
├── AdminDialog.tsx     # Dialog wrapper
└── types.ts            # TypeScript interfaces
```

---

## 1. Create Types

**File:** `frontend/src/components/admin/types.ts`

```typescript
export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'icon' | 'boolean' | 'date';
  width?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface AdminAppConfig {
  entity: string;
  endpoint: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  actions?: {
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  };
}
```

---

## 2. Create AdminTable

**File:** `frontend/src/components/admin/AdminTable.tsx`

```typescript
import { useState } from 'react';
import {
  Table,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Icon,
  Input,
  FlexBox,
  Toolbar,
  ToolbarSpacer,
  Title,
} from '@ui5/webcomponents-react';
import { ColumnConfig } from './types';

interface AdminTableProps {
  title: string;
  columns: ColumnConfig[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function AdminTable({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  canAdd = true,
  canEdit = true,
  canDelete = true,
}: AdminTableProps) {
  const [search, setSearch] = useState('');

  const filteredData = data.filter((item) =>
    columns.some((col) =>
      String(item[col.key] || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const renderCell = (item: any, column: ColumnConfig) => {
    const value = item[column.key];

    switch (column.type) {
      case 'icon':
        return <Icon name={`SAP-icons-v5/${value}`} />;
      case 'boolean':
        return (
          <Icon
            name={value ? 'SAP-icons-v5/accept' : 'SAP-icons-v5/decline'}
            style={{ color: value ? '#107e3e' : '#bb0000' }}
          />
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString('fa-IR') : '-';
      default:
        return value ?? '-';
    }
  };

  return (
    <FlexBox direction="Column" style={{ height: '100%' }}>
      <Toolbar style={{ padding: '0.5rem 1rem', background: 'white' }}>
        <Title level="H5">{title}</Title>
        <ToolbarSpacer />
        <Input
          placeholder="Search..."
          value={search}
          onInput={(e: any) => setSearch(e.target.value)}
          icon={<Icon name="SAP-icons-v5/search" />}
          style={{ width: '250px' }}
        />
        {canAdd && (
          <Button icon="add" design="Emphasized" onClick={onAdd}>
            Add
          </Button>
        )}
      </Toolbar>

      <div style={{ flex: 1, overflow: 'auto', background: 'white' }}>
        <Table>
          {columns.map((col) => (
            <TableColumn key={col.key} slot="columns" style={{ width: col.width }}>
              {col.label}
            </TableColumn>
          ))}
          <TableColumn slot="columns" style={{ width: '100px' }}>
            Actions
          </TableColumn>

          {filteredData.map((item, index) => (
            <TableRow key={item.id || index}>
              {columns.map((col) => (
                <TableCell key={col.key}>{renderCell(item, col)}</TableCell>
              ))}
              <TableCell>
                <FlexBox style={{ gap: '0.25rem' }}>
                  {canEdit && (
                    <Button
                      icon="edit"
                      design="Transparent"
                      onClick={() => onEdit?.(item)}
                    />
                  )}
                  {canDelete && (
                    <Button
                      icon="delete"
                      design="Transparent"
                      onClick={() => onDelete?.(item)}
                    />
                  )}
                </FlexBox>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </FlexBox>
  );
}
```

---

## 3. Create AdminForm

**File:** `frontend/src/components/admin/AdminForm.tsx`

```typescript
import {
  Form,
  FormItem,
  Input,
  Switch,
  Select,
  Option,
  TextArea,
} from '@ui5/webcomponents-react';
import { FieldConfig } from './types';

interface AdminFormProps {
  fields: FieldConfig[];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function AdminForm({ fields, data, onChange }: AdminFormProps) {
  const renderField = (field: FieldConfig) => {
    const value = data[field.key] ?? '';

    switch (field.type) {
      case 'switch':
        return (
          <Switch
            checked={!!value}
            onChange={(e: any) => onChange(field.key, e.target.checked)}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onChange={(e: any) => onChange(field.key, e.detail.selectedOption.value)}
            style={{ width: '100%' }}
          >
            <Option value="">-- Select --</Option>
            {field.options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );

      case 'textarea':
        return (
          <TextArea
            value={value}
            onInput={(e: any) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="Number"
            value={value}
            onInput={(e: any) => onChange(field.key, Number(e.target.value))}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
          />
        );

      default:
        return (
          <Input
            value={value}
            onInput={(e: any) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
          />
        );
    }
  };

  return (
    <Form style={{ padding: '1rem' }}>
      {fields.map((field) => (
        <FormItem key={field.key} label={`${field.label}${field.required ? ' *' : ''}`}>
          {renderField(field)}
        </FormItem>
      ))}
    </Form>
  );
}
```

---

## 4. Create AdminDialog

**File:** `frontend/src/components/admin/AdminDialog.tsx`

```typescript
import { Dialog, Bar, Button, FlexBox } from '@ui5/webcomponents-react';
import { AdminForm } from './AdminForm';
import { FieldConfig } from './types';

interface AdminDialogProps {
  open: boolean;
  title: string;
  fields: FieldConfig[];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AdminDialog({
  open,
  title,
  fields,
  data,
  onChange,
  onSave,
  onCancel,
}: AdminDialogProps) {
  return (
    <Dialog
      open={open}
      onAfterClose={onCancel}
      headerText={title}
      footer={
        <Bar
          endContent={
            <FlexBox style={{ gap: '0.5rem' }}>
              <Button design="Transparent" onClick={onCancel}>
                Cancel
              </Button>
              <Button design="Emphasized" onClick={onSave}>
                Save
              </Button>
            </FlexBox>
          }
        />
      }
    >
      <div style={{ minWidth: '400px' }}>
        <AdminForm fields={fields} data={data} onChange={onChange} />
      </div>
    </Dialog>
  );
}
```

---

## 5. Create AdminApp (Main Wrapper)

**File:** `frontend/src/components/admin/AdminApp.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Bar,
  Button,
  BusyIndicator,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { AdminTable } from './AdminTable';
import { AdminDialog } from './AdminDialog';
import { AdminAppConfig } from './types';

interface AdminAppProps {
  config: AdminAppConfig;
  onBack?: () => void;
}

export function AdminApp({ config, onBack }: AdminAppProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { entity, endpoint, columns, fields, actions } = config;

  useEffect(() => {
    loadData();
  }, [endpoint]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001${endpoint}`);
      const result = await response.json();
      // Handle both array and object with data property
      setData(Array.isArray(result) ? result : result.data || result[Object.keys(result)[0]] || []);
    } catch (err) {
      setError(`Failed to load ${entity}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    // Initialize form with default values
    const defaults: Record<string, any> = {};
    fields.forEach((f) => {
      defaults[f.key] = f.type === 'switch' ? true : '';
    });
    setFormData(defaults);
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete this ${entity.slice(0, -1)}?`)) return;

    try {
      await fetch(`http://localhost:3001${endpoint}/${item.id}`, {
        method: 'DELETE',
      });
      loadData();
    } catch (err) {
      setError(`Failed to delete ${entity}`);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `http://localhost:3001${endpoint}/${editingItem.id}`
        : `http://localhost:3001${endpoint}`;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(`Failed to save ${entity}`);
    }
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100%' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ height: '100%', background: '#f7f7f7' }}>
      {/* Back button header */}
      <Bar
        startContent={
          <Button icon="nav-back" design="Transparent" onClick={handleBack}>
            Back
          </Button>
        }
      />

      {/* Error message */}
      {error && (
        <MessageStrip
          design="Negative"
          onClose={() => setError(null)}
          style={{ margin: '0.5rem 1rem' }}
        >
          {error}
        </MessageStrip>
      )}

      {/* Table */}
      <div style={{ flex: 1, padding: '0 1rem 1rem', overflow: 'hidden' }}>
        <AdminTable
          title={entity}
          columns={columns}
          data={data}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canAdd={actions?.canAdd ?? true}
          canEdit={actions?.canEdit ?? true}
          canDelete={actions?.canDelete ?? true}
        />
      </div>

      {/* Dialog */}
      <AdminDialog
        open={dialogOpen}
        title={editingItem ? `Edit ${entity.slice(0, -1)}` : `Add ${entity.slice(0, -1)}`}
        fields={fields}
        data={formData}
        onChange={handleFormChange}
        onSave={handleSave}
        onCancel={() => setDialogOpen(false)}
      />
    </FlexBox>
  );
}
```

---

## 6. Export Components

**File:** `frontend/src/components/admin/index.ts`

```typescript
export { AdminApp } from './AdminApp';
export { AdminTable } from './AdminTable';
export { AdminForm } from './AdminForm';
export { AdminDialog } from './AdminDialog';
export * from './types';
```

---

## 7. Update Tile Handling

In `LaunchpadPage.tsx`, when tile type is `app`:

```typescript
const handleTileClick = (tile: Tile) => {
  if (tile.type === 'form') {
    navigate(`/forms/${tile.slug}`);
  } else if (tile.type === 'app') {
    // Open admin app with config
    setActiveApp({
      config: JSON.parse(tile.config || '{}'),
      title: tile.name,
    });
  }
};
```

Or create a route that accepts config:
```typescript
navigate(`/app/${tile.slug}`, { state: { config: tile.config } });
```

---

## 8. Database: Add config column to tiles

```sql
ALTER TABLE tiles ADD COLUMN config JSONB;

-- Example: Update a tile with admin config
UPDATE tiles SET 
  type = 'app',
  config = '{
    "entity": "Spaces",
    "endpoint": "/api/launchpad/spaces",
    "columns": [
      {"key": "order", "label": "#", "width": "60px"},
      {"key": "name", "label": "Name"},
      {"key": "icon", "label": "Icon", "type": "icon"},
      {"key": "isActive", "label": "Active", "type": "boolean"}
    ],
    "fields": [
      {"key": "name", "label": "Name", "type": "text", "required": true},
      {"key": "icon", "label": "Icon", "type": "text"},
      {"key": "isActive", "label": "Active", "type": "switch"}
    ]
  }'::jsonb
WHERE slug = 'manage-spaces';
```

---

## Summary

| Component | Reusable | Config-driven |
|-----------|----------|---------------|
| AdminApp | ✅ | Reads config, renders table + dialog |
| AdminTable | ✅ | Any columns, any data |
| AdminForm | ✅ | Any fields |
| AdminDialog | ✅ | Wraps form in popup |

**One set of components → Unlimited admin apps!**

---

## Test

1. Create admin components
2. Add config column to tiles table
3. Create a test tile with type='app' and config JSON
4. Click tile → should open AdminApp with table
5. Test Add, Edit, Delete

