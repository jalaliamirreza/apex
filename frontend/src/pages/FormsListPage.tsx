import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  FlexBox,
  Title,
  Badge,
  Button,
  Icon,
  Text,
  BusyIndicator
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/document.js";
import "@ui5/webcomponents-icons/dist/arrow-right.js";
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
        <BusyIndicator active size="Large" />
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ gap: '1.5rem', padding: '1rem' }}>
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <Title level="H2">Forms</Title>
        <Badge colorScheme="8">{forms.length} forms</Badge>
      </FlexBox>

      <FlexBox wrap="Wrap" style={{ gap: '1rem' }}>
        {forms.length === 0 ? (
          <Card style={{ width: '100%', padding: '2rem', textAlign: 'center' }}>
            <Text>No forms yet. Ask Claude to create one!</Text>
          </Card>
        ) : (
          forms.map((form) => (
            <Card
              key={form.id}
              style={{ width: '350px', cursor: 'pointer' }}
              onClick={() => navigate(`/forms/${form.slug}`)}
            >
              <CardHeader
                titleText={form.name}
                subtitleText={form.description || 'No description'}
                avatar={<Icon name="document" />}
                action={
                  <Button
                    icon="arrow-right"
                    design="Transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/forms/${form.slug}`);
                    }}
                  />
                }
              />
            </Card>
          ))
        )}
      </FlexBox>
    </FlexBox>
  );
}

export default FormsListPage;
