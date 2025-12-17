import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  FlexBox,
  Title,
  Text,
  Icon
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/search.js";

function HomePage() {
  const navigate = useNavigate();

  const tiles = [
    { title: 'View Forms', subtitle: 'Browse all available forms', icon: 'list', path: '/forms' },
    { title: 'Search', subtitle: 'Search submissions', icon: 'search', path: '/search' },
  ];

  return (
    <FlexBox direction="Column" style={{ gap: '2rem', padding: '1rem' }}>
      <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
        <Title level="H1">Welcome to APEX</Title>
        <Text>AI-Native Business Process Platform</Text>
      </FlexBox>

      <FlexBox wrap="Wrap" style={{ gap: '1rem' }}>
        {tiles.map((tile) => (
          <Card
            key={tile.path}
            style={{ width: '300px', cursor: 'pointer' }}
            onClick={() => navigate(tile.path)}
          >
            <CardHeader
              titleText={tile.title}
              subtitleText={tile.subtitle}
              avatar={<Icon name={tile.icon} />}
            />
          </Card>
        ))}
      </FlexBox>
    </FlexBox>
  );
}

export default HomePage;
