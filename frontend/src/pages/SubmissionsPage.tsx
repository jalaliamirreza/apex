import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Button,
  BusyIndicator,
  MessageStrip,
  Label,
  Text
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
        <BusyIndicator active size="L" />
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
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
                {columns.map((col) => (
                  <th key={col} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>{col}</th>
                ))}
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>{sub.id.slice(0, 8)}...</td>
                  {columns.map((col) => (
                    <td key={col} style={{ padding: '1rem' }}>
                      {String(sub.data[col] || '-')}
                    </td>
                  ))}
                  <td style={{ padding: '1rem' }}>
                    {new Date(sub.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FlexBox>
  );
}

export default SubmissionsPage;
