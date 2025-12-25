import React, { useState, useEffect } from 'react';
import {
  FlexBox,
  Title,
  Switch,
  Input,
  Button,
  MessageStrip,
  BusyIndicator,
  Icon,
} from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface FormWorkflow {
  id: string;
  slug: string;
  name: string;
  name_fa: string;
  status: string;
  workflow_enabled: boolean;
  workflow_process_id: string | null;
}

const ManageFormsWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [zeebeStatus, setZeebeStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Check Zeebe health
      const healthRes = await api.get('/workflow/health');
      setZeebeStatus(healthRes.data.status);

      // Load forms
      const formsRes = await api.get('/workflow/forms');
      setForms(formsRes.data.forms);
    } catch (err) {
      setError('Failed to load data');
      setZeebeStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (form: FormWorkflow) => {
    if (!form.workflow_process_id && !form.workflow_enabled) {
      setError('Please set Process ID first');
      return;
    }

    try {
      setSaving(form.id);
      await api.put(`/workflow/forms/${form.id}`, {
        workflow_enabled: !form.workflow_enabled,
        workflow_process_id: form.workflow_process_id,
      });
      setForms(forms.map(f =>
        f.id === form.id
          ? { ...f, workflow_enabled: !f.workflow_enabled }
          : f
      ));
      setSuccess(`Workflow ${!form.workflow_enabled ? 'enabled' : 'disabled'} for ${form.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update workflow');
    } finally {
      setSaving(null);
    }
  };

  const handleProcessIdChange = async (form: FormWorkflow, processId: string) => {
    try {
      setSaving(form.id);
      await api.put(`/workflow/forms/${form.id}`, {
        workflow_enabled: form.workflow_enabled,
        workflow_process_id: processId || null,
      });
      setForms(forms.map(f =>
        f.id === form.id
          ? { ...f, workflow_process_id: processId || null }
          : f
      ));
    } catch (err) {
      setError('Failed to update process ID');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ padding: '1rem', gap: '1rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/launchpad/admin')} />
          <Icon name="process" style={{ fontSize: '1.5rem', color: '#6366f1' }} />
          <div>
            <Title level="H3">Form Workflow Configuration</Title>
            <Title level="H5" style={{ color: '#666', direction: 'rtl' }}>پیکربندی گردش کار فرم‌ها</Title>
          </div>
        </FlexBox>

        {/* Zeebe Status */}
        <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: zeebeStatus === 'connected' ? '#10b981' : '#ef4444'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Zeebe: {zeebeStatus}
          </span>
        </FlexBox>
      </FlexBox>

      {/* Messages */}
      {error && (
        <MessageStrip design="Negative" onClose={() => setError(null)}>
          {error}
        </MessageStrip>
      )}
      {success && (
        <MessageStrip design="Positive" onClose={() => setSuccess(null)}>
          {success}
        </MessageStrip>
      )}

      {/* Info */}
      <MessageStrip design="Information" hideCloseButton>
        Enable workflow to automatically start a Camunda process when form is submitted.
        Process ID must match a deployed BPMN process (e.g., "leave-request-process").
      </MessageStrip>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Form Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', direction: 'rtl' }}>نام فرم</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Slug</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Workflow Enabled</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Process ID</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>{form.name}</td>
                <td style={{ padding: '0.75rem', direction: 'rtl', textAlign: 'right' }}>{form.name_fa}</td>
                <td style={{ padding: '0.75rem' }}>
                  <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{form.slug}</code>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <Switch
                    checked={form.workflow_enabled}
                    onChange={() => handleToggleWorkflow(form)}
                    disabled={saving === form.id || zeebeStatus !== 'connected'}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <Input
                    value={form.workflow_process_id || ''}
                    placeholder="e.g., leave-request-process"
                    onBlur={(e) => handleProcessIdChange(form, (e.target as HTMLInputElement).value)}
                    disabled={saving === form.id}
                    style={{ width: '250px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FlexBox>
  );
};

export default ManageFormsWorkflowPage;
