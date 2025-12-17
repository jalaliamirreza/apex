import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Input,
  Button,
  Card,
  CardHeader,
  Text,
  BusyIndicator,
  MessageStrip,
  Icon
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/document.js";
import { searchApi } from '../services/api';

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchApi.search(query);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlexBox direction="Column" style={{ gap: '1.5rem', padding: '1rem' }}>
      <Title level="H2">Search Submissions</Title>

      <FlexBox style={{ gap: '0.5rem' }}>
        <Input
          placeholder="Search..."
          value={query}
          onInput={(e: any) => setQuery(e.target.value)}
          onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <Button icon="search" design="Emphasized" onClick={handleSearch}>
          Search
        </Button>
      </FlexBox>

      {loading && (
        <FlexBox justifyContent="Center">
          <BusyIndicator active size="Medium" />
        </FlexBox>
      )}

      {!loading && searched && results.length === 0 && (
        <MessageStrip design="Information">No results found</MessageStrip>
      )}

      {!loading && results.length > 0 && (
        <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
          <Text>{results.length} results found</Text>
          {results.map((result, index) => (
            <Card
              key={index}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/forms/${result.formSlug}`)}
            >
              <CardHeader
                titleText={result.formName}
                subtitleText={`Submission: ${result.submissionId?.slice(0, 8)}...`}
                avatar={<Icon name="document" />}
              />
            </Card>
          ))}
        </FlexBox>
      )}
    </FlexBox>
  );
}

export default SearchPage;
