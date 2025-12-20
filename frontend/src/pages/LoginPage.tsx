import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Input,
  Button,
  Title
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
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Vazirmatn, Roboto, sans-serif'
    }}>
      {/* Floating geometric shapes background */}
      <div className="floating-shapes">
        {/* Circle 1 */}
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: '#06B6D4',
          opacity: 0.1,
          top: '10%',
          left: '10%',
          animation: 'float1 20s ease-in-out infinite'
        }} />

        {/* Circle 2 */}
        <div style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#4169E1',
          opacity: 0.1,
          top: '60%',
          left: '80%',
          animation: 'float2 15s ease-in-out infinite'
        }} />

        {/* Triangle 1 */}
        <div style={{
          position: 'absolute',
          width: '0',
          height: '0',
          borderLeft: '75px solid transparent',
          borderRight: '75px solid transparent',
          borderBottom: '130px solid #06B6D4',
          opacity: 0.1,
          top: '70%',
          left: '15%',
          animation: 'float3 25s ease-in-out infinite'
        }} />

        {/* Square 1 */}
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          backgroundColor: '#4169E1',
          opacity: 0.1,
          top: '20%',
          left: '75%',
          animation: 'float1 18s ease-in-out infinite',
          borderRadius: '8px'
        }} />

        {/* Circle 3 */}
        <div style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#06B6D4',
          opacity: 0.1,
          top: '40%',
          left: '5%',
          animation: 'float2 22s ease-in-out infinite'
        }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-40px, 30px) rotate(-120deg);
          }
          66% {
            transform: translate(20px, -25px) rotate(-240deg);
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(25px, -40px) rotate(180deg);
          }
        }
      `}</style>

      {/* Login Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
        padding: '48px 40px',
        width: '420px',
        maxWidth: '90%',
        position: 'relative',
        zIndex: 1
      }}>
        <FlexBox
          direction="Column"
          alignItems="Center"
          style={{ gap: '24px' }}
        >
          {/* Main Logo */}
          <img
            src="/text-logo.svg"
            alt="SYNCRO Logo"
            style={{
              width: '180px',
              height: 'auto',
              marginBottom: '8px'
            }}
          />

          {/* Animated Text Logo */}
          <img
            src="/animated-text.svg"
            alt="SYNCRO"
            style={{
              width: '220px',
              height: 'auto',
              marginBottom: '16px'
            }}
          />

          {/* Login Form */}
          <FlexBox
            direction="Column"
            style={{ width: '100%', gap: '20px' }}
          >
            {/* Username Input */}
            <div style={{ width: '100%' }}>
              <Input
                placeholder="نام کاربری / Username"
                value={username}
                onInput={(e: any) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'Vazirmatn, Roboto, sans-serif'
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ width: '100%' }}>
              <Input
                type="Password"
                placeholder="رمز عبور / Password"
                value={password}
                onInput={(e: any) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'Vazirmatn, Roboto, sans-serif'
                }}
              />
            </div>

            {/* Login Button */}
            <Button
              design="Emphasized"
              onClick={handleLogin}
              style={{
                width: '100%',
                marginTop: '8px',
                fontFamily: 'Vazirmatn, Roboto, sans-serif'
              }}
            >
              ورود / Login
            </Button>
          </FlexBox>
        </FlexBox>
      </div>
    </div>
  );
}

export default LoginPage;
