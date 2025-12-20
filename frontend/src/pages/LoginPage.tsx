import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Input,
  Button
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement authentication logic
    console.log('Login attempt:', { username, password });
    // For now, just navigate to launchpad
    // navigate('/launchpad');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f6f7',
      display: 'flex',
      fontFamily: 'Vazirmatn, Roboto, sans-serif'
    }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animated-text {
          animation: fadeInUp 1.5s ease-out, pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Left Section - Branding */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative'
      }}>
        {/* Large Logo */}
        <img
          src="/text-logo.svg"
          alt="SYNCRO Logo"
          style={{
            width: '80%',
            maxWidth: '500px',
            height: 'auto',
            marginBottom: '40px'
          }}
        />

        {/* Animated Subtitle */}
        <div
          className="animated-text"
          style={{
            fontSize: '28px',
            fontWeight: '300',
            color: '#4169E1',
            letterSpacing: '1px',
            textAlign: 'center'
          }}
        >
          Business Process Platform
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div style={{
        flex: 1,
        backgroundColor: '#f5f6f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px'
      }}>
        {/* Login Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '420px'
        }}>
          <FlexBox
            direction="Column"
            style={{ gap: '24px' }}
          >
            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '400',
              color: '#333',
              margin: '0 0 8px 0',
              textAlign: 'center'
            }}>
              Sign In
            </h2>

            {/* Subtitle */}
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Enter your credentials to access SYNCRO
            </p>

            {/* Login Form */}
            <FlexBox
              direction="Column"
              style={{ width: '100%', gap: '20px' }}
            >
              {/* Username Input */}
              <div style={{ width: '100%' }}>
                <Input
                  placeholder="Username"
                  value={username}
                  onInput={(e: any) => setUsername(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Password Input */}
              <div style={{ width: '100%' }}>
                <Input
                  type="Password"
                  placeholder="Password"
                  value={password}
                  onInput={(e: any) => setPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Login Button */}
              <Button
                design="Emphasized"
                onClick={handleLogin}
                style={{
                  width: '100%',
                  marginTop: '8px'
                }}
              >
                Login
              </Button>
            </FlexBox>
          </FlexBox>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
