import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Button,
  BusyIndicator,
  MessageStrip,
  Table,
  TableColumn,
  TableRow,
  TableCell,
  Label
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/nav-back.js";
import { formsApi } from '../services/api';

function SubmissionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadSubmissions();
  }, [slug]);

  const loadSubmissions = async () => {
    try {
      const data = await formsApi.getSubmissions(slug!);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError('Failed to load submissions');
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

  if (error) {
    return <MessageStrip design="Negative">{error}</MessageStrip>;
  }

  const columns = submissions.length > 0
    ? Object.keys(submissions[0].data || {})
    : [];

  return (
    <FlexBox direction="Column" style={{ gap: '1rem', padding: '1rem' }}>
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate(`/forms/${slug}`)} />
          <Title level="H2">Submissions</Title>
        </FlexBox>
        <Label>{submissions.length} submissions</Label>
      </FlexBox>

      {submissions.length === 0 ? (
        <MessageStrip design="Information">No submissions yet</MessageStrip>
      ) : (
        <Table>
          <TableColumn slot="columns"><Label>ID</Label></TableColumn>
          {columns.map((col) => (
            <TableColumn key={col} slot="columns"><Label>{col}</Label></TableColumn>
          ))}
          <TableColumn slot="columns"><Label>Submitted</Label></TableColumn>

          {submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell><Label>{sub.id.slice(0, 8)}...</Label></TableCell>
              {columns.map((col) => (
                <TableCell key={col}>
                  <Label>{String(sub.data[col] || '-')}</Label>
                </TableCell>
              ))}
              <TableCell>
                <Label>{new Date(sub.submittedAt).toLocaleString()}</Label>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </FlexBox>
  );
}

export default SubmissionsPage;
