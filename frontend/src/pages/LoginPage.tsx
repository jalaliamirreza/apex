import { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLogin = () => {
    // TODO: Implement authentication logic
    console.log('Login attempt:', { username, password });
    // For now, just navigate to launchpad
    // navigate('/launchpad');
  };

  // Matrix effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const matrix = '01';
    const draw = () => {
      ctx.fillStyle = 'rgba(245, 246, 247, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#4169E1';
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f6f7',
      display: 'flex',
      fontFamily: 'Vazirmatn, Roboto, sans-serif'
    }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink-caret {
          0%, 49% {
            border-color: #4169E1;
          }
          50%, 100% {
            border-color: transparent;
          }
        }

        @keyframes hide-caret {
          0%, 99% {
            border-color: inherit;
          }
          100% {
            border-color: transparent;
          }
        }

        .typing-text {
          overflow: hidden;
          border-right: 3px solid #4169E1;
          white-space: nowrap;
          margin: 0 auto;
          letter-spacing: 1px;
          animation:
            typing 3s steps(30, end) forwards,
            blink-caret 0.75s step-end 0s 4,
            hide-caret 3s forwards;
        }

        .dotted-background {
          background-image: radial-gradient(circle, #e0e0e0 1px, transparent 1px);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }
      `}</style>

      {/* Left Section - Branding */}
      <div className="dotted-background" style={{
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

        {/* Typing Animation Subtitle */}
        <div
          className="typing-text"
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#4169E1',
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
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Matrix Background Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.15
          }}
        />

        {/* Login Form */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1
        }}>
          <FlexBox
            direction="Column"
            style={{ gap: '24px' }}
          >
            {/* Title */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '400',
              color: '#333',
              margin: '0 0 8px 0',
              textAlign: 'center'
            }}>
              Sign In
            </h2>

            {/* Subtitle */}
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 32px 0',
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
