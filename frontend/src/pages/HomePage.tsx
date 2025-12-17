import { useNavigate } from 'react-router-dom';
import FioriTile from '../components/FioriTile';
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/search.js";

function HomePage() {
  const navigate = useNavigate();

  const tiles = [
    { title: 'View Forms', subtitle: 'Browse all forms', icon: 'list', path: '/forms' },
    { title: 'Search', subtitle: 'Search submissions', icon: 'search', path: '/search' },
  ];

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
        Forms
      </div>

      {/* Tile Grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {tiles.map((tile) => (
          <FioriTile
            key={tile.path}
            title={tile.title}
            subtitle={tile.subtitle}
            icon={tile.icon}
            onClick={() => navigate(tile.path)}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
