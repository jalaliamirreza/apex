import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Text,
  Label,
  Button,
  BusyIndicator,
  MessageStrip
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/response.js";
import { Form as FormioForm } from '@formio/react';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      const data = await formsApi.get(slug!);
      setForm(data);
    } catch (err) {
      setError('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (submission: any) => {
    try {
      await formsApi.submit(slug!, submission.data);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form');
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '300px' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  if (error || !form) {
    return (
      <MessageStrip design="Negative" style={{ margin: '1rem' }}>
        {error || 'Form not found'}
      </MessageStrip>
    );
  }

  if (submitted) {
    return (
      <FlexBox
        direction="Column"
        alignItems="Center"
        justifyContent="Center"
        style={{ height: '300px', gap: '1rem' }}
      >
        <MessageStrip design="Positive">Form submitted successfully!</MessageStrip>
        <Button onClick={() => navigate('/forms')}>Back to Forms</Button>
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ gap: '1.5rem', padding: '1rem' }}>
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
          <Title level="H2">{form.name}</Title>
          <Text>{form.description || 'No description'}</Text>
          <Label>{form.status}</Label>
        </FlexBox>
        <Button
          icon="response"
          design="Emphasized"
          onClick={() => navigate(`/forms/${slug}/submissions`)}
        >
          View Submissions
        </Button>
      </FlexBox>

      <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px' }}>
        <FormioForm form={form.schema} onSubmit={handleSubmit} />
      </div>
    </FlexBox>
  );
}

export default FormPage;
