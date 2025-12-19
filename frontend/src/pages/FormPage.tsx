import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Text,
  Label,
  Tag,
  Button,
  BusyIndicator,
  MessageStrip
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/response.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
import { SurveyFormRenderer } from '../components/SurveyFormRenderer';
import { convertFormioToSurveyJS } from '../utils/schemaConverter';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitting(true);
    try {
      await formsApi.submit(slug!, data);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form');
    } finally {
      setSubmitting(false);
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
      <FlexBox direction="Column" style={{ padding: '1rem', gap: '1rem' }}>
        <MessageStrip design="Negative">{error || 'Form not found'}</MessageStrip>
        <Button icon="nav-back" onClick={() => navigate('/forms')}>Back to Forms</Button>
      </FlexBox>
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
        <MessageStrip design="Positive" hideCloseButton>
          Form submitted successfully!
        </MessageStrip>
        <FlexBox style={{ gap: '0.5rem' }}>
          <Button design="Emphasized" onClick={() => navigate('/forms')}>
            Back to Forms
          </Button>
          <Button design="Transparent" onClick={() => setSubmitted(false)}>
            Submit Another
          </Button>
        </FlexBox>
      </FlexBox>
    );
  }

  // Convert Formio schema to SurveyJS
  const surveySchema = convertFormioToSurveyJS(form.schema);
  surveySchema.title = form.name;
  surveySchema.description = form.description;

  return (
    <FlexBox direction="Column" style={{ gap: '1rem', padding: '1rem' }}>
      {/* Header - Always LTR */}
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/forms')} />
          <FlexBox direction="Column">
            <Title level="H2">{form.name}</Title>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <Text>{form.description || ''}</Text>
              <Tag colorScheme={form.direction === 'rtl' ? '6' : '8'}>
                {form.direction === 'rtl' ? 'فارسی' : 'English'}
              </Tag>
              <Label>{form.status}</Label>
            </FlexBox>
          </FlexBox>
        </FlexBox>
        <Button
          icon="response"
          design="Transparent"
          onClick={() => navigate(`/forms/${slug}/submissions`)}
        >
          View Submissions
        </Button>
      </FlexBox>

      {/* Form Content - Respects form direction */}
      <SurveyFormRenderer
        schema={surveySchema}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/forms')}
        loading={submitting}
        direction={form.direction || 'ltr'}
      />
    </FlexBox>
  );
}

export default FormPage;
