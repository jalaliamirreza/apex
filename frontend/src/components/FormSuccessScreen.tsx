import { FlexBox, Card, Title, Text, Button, Icon } from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/home.js";

interface FormSuccessScreenProps {
  formName: string;
  onBackToLaunchpad: () => void;
  onSubmitAnother: () => void;
  direction?: 'ltr' | 'rtl';
}

export function FormSuccessScreen({
  formName,
  onBackToLaunchpad,
  onSubmitAnother,
  direction = 'ltr'
}: FormSuccessScreenProps) {
  const isRtl = direction === 'rtl';

  return (
    <div style={{
      padding: '3rem 1.5rem',
      display: 'flex',
      justifyContent: 'center',
      direction
    }}>
      <Card style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <FlexBox
          direction="Column"
          alignItems="Center"
          style={{ padding: '3rem 2rem', gap: '1.5rem' }}
        >
          {/* Success Icon */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            animation: 'scaleIn 0.4s ease-out'
          }}>
            <Icon name="accept" style={{
              color: 'white',
              width: '40px',
              height: '40px'
            }} />
          </div>

          {/* Title */}
          <Title level="H2" style={{ color: '#107e3e' }}>
            {isRtl ? 'ثبت موفق!' : 'Successfully Submitted!'}
          </Title>

          {/* Message */}
          <Text style={{ color: '#6a6d70', lineHeight: 1.6 }}>
            {isRtl
              ? `فرم "${formName}" با موفقیت ثبت شد.`
              : `The form "${formName}" has been submitted successfully.`
            }
          </Text>

          {/* Actions */}
          <FlexBox style={{ gap: '1rem', marginTop: '1rem' }}>
            <Button
              design="Emphasized"
              icon="home"
              onClick={onBackToLaunchpad}
              style={{ minWidth: '140px' }}
            >
              {isRtl ? 'بازگشت' : 'Back to Home'}
            </Button>
            <Button
              design="Transparent"
              icon="refresh"
              onClick={onSubmitAnother}
            >
              {isRtl ? 'ثبت مجدد' : 'Submit Another'}
            </Button>
          </FlexBox>
        </FlexBox>
      </Card>

      {/* Animation keyframes */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
