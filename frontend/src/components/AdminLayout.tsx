import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlexBox, Title, Button, Icon } from '@ui5/webcomponents-react';

interface AdminLayoutProps {
  icon: string;
  title: string;
  titleFa: string;
  actions?: ReactNode;
  children: ReactNode;
}

function AdminLayout({ icon, title, titleFa, actions, children }: AdminLayoutProps) {
  const navigate = useNavigate();

  return (
    <FlexBox direction="Column" style={{ height: '100vh', background: '#f7f7f7' }}>
      {/* Header */}
      <FlexBox
        alignItems="Center"
        justifyContent="SpaceBetween"
        style={{
          background: 'white',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          minHeight: '64px'
        }}
      >
        {/* Left: Back + Icon + Title */}
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button
            icon="nav-back"
            design="Transparent"
            onClick={() => navigate('/launchpad/admin/system')}
            tooltip="Back to System Admin"
          />
          <Icon name={icon} style={{ fontSize: '1.5rem', color: '#0070f2' }} />
          <FlexBox direction="Column">
            <Title level="H3" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              {title}
            </Title>
            <div style={{ fontSize: '0.875rem', color: '#6a6d70', marginTop: '0.25rem' }}>
              {titleFa}
            </div>
          </FlexBox>
        </FlexBox>

        {/* Right: Actions */}
        {actions && (
          <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
            {actions}
          </FlexBox>
        )}
      </FlexBox>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        {children}
      </div>
    </FlexBox>
  );
}

export default AdminLayout;
