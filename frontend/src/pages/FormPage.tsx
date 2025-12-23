import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ShellBar,
  FlexBox,
  Card,
  CardHeader,
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  BusyIndicator,
  MessageStrip,
  Icon,
  Title,
  Text
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/document.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/home.js";
import { SurveyFormRenderer } from '../components/SurveyFormRenderer';
import { FormSuccessScreen } from '../components/FormSuccessScreen';
import { FormLoadingSkeleton } from '../components/FormLoadingSkeleton';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get return path from location state or default to launchpad
  const returnPath = location.state?.returnPath || '/launchpad';
  const spaceName = location.state?.spaceName || 'Home';
  const pageName = location.state?.pageName || '';

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

  const handleBack = () => {
    navigate(returnPath);
  };

  // Loading state
  if (loading) {
    return <FormLoadingSkeleton />;
  }

  // Error state
  if (error || !form) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
        <ShellBar
          logo={<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px' }} />}
          primaryTitle="SYNCRO"
        />
        <FlexBox
          direction="Column"
          alignItems="Center"
          justifyContent="Center"
          style={{ padding: '3rem', gap: '1rem' }}
        >
          <MessageStrip design="Negative" hideCloseButton>
            {error || 'Form not found'}
          </MessageStrip>
          <Button icon="nav-back" onClick={handleBack}>
            Back
          </Button>
        </FlexBox>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
        <ShellBar
          logo={<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px' }} />}
          primaryTitle="SYNCRO"
          secondaryTitle={form.name_fa || form.name}
        />
        <FormSuccessScreen
          formName={form.name_fa || form.name}
          onBackToLaunchpad={handleBack}
          onSubmitAnother={() => setSubmitted(false)}
          direction={form.direction || 'ltr'}
        />
      </div>
    );
  }

  // Form state
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7' }}>
      {/* Shell Bar */}
      <ShellBar
        logo={<img src="/logo.svg" alt="SYNCRO" style={{ height: '32px' }} />}
        primaryTitle="SYNCRO"
        secondaryTitle={form.name_fa || form.name}
        startButton={
          <Button icon="nav-back" design="Transparent" onClick={handleBack} />
        }
      />

      {/* Breadcrumb Bar */}
      <div style={{
        padding: '0.75rem 1.5rem',
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        direction: form.direction || 'ltr'
      }}>
        <Breadcrumbs>
          <BreadcrumbsItem onClick={() => navigate('/launchpad')}>
            {form.direction === 'rtl' ? 'خانه' : 'Home'}
          </BreadcrumbsItem>
          {spaceName && (
            <BreadcrumbsItem onClick={handleBack}>
              {spaceName}
            </BreadcrumbsItem>
          )}
          <BreadcrumbsItem>
            {form.name_fa || form.name}
          </BreadcrumbsItem>
        </Breadcrumbs>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        direction: form.direction || 'ltr'
      }}>
        <Card style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <CardHeader
            titleText={form.name_fa || form.name}
            subtitleText={form.description || ''}
            avatar={<Icon name={form.icon || 'document'} />}
            style={{
              borderBottom: '1px solid #e5e5e5',
              background: '#fafbfc'
            }}
          />

          {/* Form Content */}
          <div style={{ padding: '1.5rem' }}>
            <SurveyFormRenderer
              schema={form.schema}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              loading={submitting}
              direction={form.direction || 'ltr'}
              navigationType={form.navigation_type}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default FormPage;
