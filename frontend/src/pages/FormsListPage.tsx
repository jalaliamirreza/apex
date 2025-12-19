import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  BusyIndicator,
  MessageStrip,
  Text
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/document.js";
import FioriTile from '../components/FioriTile';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await formsApi.list();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '200px' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f7f7f7', minHeight: '100%' }}>
      {/* Section Title */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#32363a',
          marginBottom: '1rem',
        }}
      >
        Available Forms
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <MessageStrip design="Information">
          No forms yet. Ask Claude to create one!
        </MessageStrip>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {forms.map((form) => (
            <FioriTile
              key={form.id}
              title={form.name}
              subtitle={form.description || 'No description'}
              icon="document"
              direction={form.direction || 'ltr'}
              onClick={() => navigate(`/forms/${form.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FormsListPage;
