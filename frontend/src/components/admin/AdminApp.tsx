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
