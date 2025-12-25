import { useParams, useNavigate } from 'react-router-dom';
import { FlexBox, Title, Button, Icon, Card } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';

function AdminAppPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const getAppTitle = (slug?: string) => {
    switch (slug) {
      case 'manage-spaces':
        return 'Manage Spaces';
      case 'manage-pages':
        return 'Manage Pages';
      case 'manage-sections':
        return 'Manage Sections';
      case 'manage-tiles':
        return 'Manage Tiles';
      default:
        return 'Admin Application';
    }
  };

  const getAppIcon = (slug?: string) => {
    switch (slug) {
      case 'manage-spaces':
        return 'org-chart';
      case 'manage-pages':
        return 'copy';
      case 'manage-sections':
        return 'grid';
      case 'manage-tiles':
        return 'product';
      default:
        return 'settings';
    }
  };

  return (
    <FlexBox direction="Column" style={{ height: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            icon="nav-back"
            design="Transparent"
            onClick={() => navigate('/launchpad')}
          />
          <Icon name={getAppIcon(slug)} style={{ fontSize: '2rem', color: '#6366f1' }} />
          <Title level="H3" style={{ margin: 0 }}>{getAppTitle(slug)}</Title>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '2rem',
        background: '#f7f7f7'
      }}>
        <Card style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <FlexBox direction="Column" alignItems="Center" style={{ gap: '1.5rem' }}>
            <Icon name={getAppIcon(slug)} style={{ fontSize: '4rem', color: '#6366f1' }} />
            <Title level="H2">{getAppTitle(slug)}</Title>
            <div style={{ textAlign: 'center', color: '#6a6d70' }}>
              <p>This admin application is currently under development.</p>
              <p style={{ marginTop: '0.5rem' }}>
                Application slug: <strong>{slug}</strong>
              </p>
            </div>
            <Button
              design="Emphasized"
              icon="nav-back"
              onClick={() => navigate('/launchpad')}
              style={{ marginTop: '1rem' }}
            >
              Back to Launchpad
            </Button>
          </FlexBox>
        </Card>
      </div>
    </FlexBox>
  );
}

export default AdminAppPage;
