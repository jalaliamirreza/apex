import { Icon } from '@ui5/webcomponents-react';

interface FioriTileProps {
  title: string;
  subtitle?: string;
  icon: string;
  onClick: () => void;
}

function FioriTile({ title, subtitle, icon, onClick }: FioriTileProps) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '160px',
        height: '160px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '1rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = '#0a6ed1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e5e5e5';
      }}
    >
      {/* Title and Subtitle at top */}
      <div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#32363a',
            marginBottom: '0.25rem',
            lineHeight: '1.2',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: '12px',
              color: '#6a6d70',
              lineHeight: '1.2',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Icon at bottom */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Icon
          name={icon}
          style={{
            width: '48px',
            height: '48px',
            color: '#0a6ed1',
          }}
        />
      </div>
    </div>
  );
}

export default FioriTile;
