import { useState, useRef } from 'react';
import { Icon, Popover } from '@ui5/webcomponents-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS } from '../data/mockUsers';

export function UserSelector() {
  const { user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  // Group users by category
  const employees = MOCK_USERS.filter(u =>
    u.roles.includes('employee') &&
    !u.roles.includes('manager') &&
    !u.roles.includes('director') &&
    !u.roles.includes('admin')
  );
  const managers = MOCK_USERS.filter(u =>
    u.roles.includes('manager') &&
    !u.roles.includes('director')
  );
  const directors = MOCK_USERS.filter(u => u.roles.includes('director'));
  const admins = MOCK_USERS.filter(u => u.roles.includes('admin'));

  const handleUserSelect = (username: string) => {
    login(username);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          padding: '0.25rem 0.75rem',
          borderRadius: '24px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f7'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ color: '#32363a', fontWeight: 500, fontSize: '0.875rem' }}>
          {user ? user.displayName : 'Select User'}
        </span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon name="person-placeholder" style={{ color: '#6a6d70', fontSize: '1.125rem' }} />
        </div>
      </div>

      <Popover
        opener={buttonRef.current || undefined}
        open={isOpen}
        placement="Bottom"
      >
        <div style={{ width: '280px', maxHeight: '500px', overflow: 'auto' }}>
          {/* Employees */}
          {employees.length > 0 && (
            <>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f7f7f7',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: '#6a6d70',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Employees
              </div>
              {employees.map((mockUser) => (
                <div
                  key={mockUser.id}
                  onClick={() => handleUserSelect(mockUser.username)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'background 0.2s',
                    background: user?.username === mockUser.username ? '#e5f1fa' : 'transparent',
                    borderBottom: '1px solid #e5e5e5'
                  }}
                  onMouseEnter={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = '#f7f7f7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {mockUser.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
                      {mockUser.department}
                    </div>
                  </div>
                  {user?.username === mockUser.username && (
                    <Icon name="accept" style={{ color: '#0070f2', fontSize: '1rem' }} />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Managers */}
          {managers.length > 0 && (
            <>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f7f7f7',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: '#6a6d70',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Managers
              </div>
              {managers.map((mockUser) => (
                <div
                  key={mockUser.id}
                  onClick={() => handleUserSelect(mockUser.username)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'background 0.2s',
                    background: user?.username === mockUser.username ? '#e5f1fa' : 'transparent',
                    borderBottom: '1px solid #e5e5e5'
                  }}
                  onMouseEnter={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = '#f7f7f7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {mockUser.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
                      {mockUser.department}
                    </div>
                  </div>
                  {user?.username === mockUser.username && (
                    <Icon name="accept" style={{ color: '#0070f2', fontSize: '1rem' }} />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Directors */}
          {directors.length > 0 && (
            <>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f7f7f7',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: '#6a6d70',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Directors
              </div>
              {directors.map((mockUser) => (
                <div
                  key={mockUser.id}
                  onClick={() => handleUserSelect(mockUser.username)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'background 0.2s',
                    background: user?.username === mockUser.username ? '#e5f1fa' : 'transparent',
                    borderBottom: '1px solid #e5e5e5'
                  }}
                  onMouseEnter={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = '#f7f7f7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {mockUser.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
                      {mockUser.department}
                    </div>
                  </div>
                  {user?.username === mockUser.username && (
                    <Icon name="accept" style={{ color: '#0070f2', fontSize: '1rem' }} />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Admins */}
          {admins.length > 0 && (
            <>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f7f7f7',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: '#6a6d70',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Admin
              </div>
              {admins.map((mockUser) => (
                <div
                  key={mockUser.id}
                  onClick={() => handleUserSelect(mockUser.username)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'background 0.2s',
                    background: user?.username === mockUser.username ? '#e5f1fa' : 'transparent',
                    borderBottom: '1px solid #e5e5e5'
                  }}
                  onMouseEnter={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = '#f7f7f7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user?.username !== mockUser.username) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {mockUser.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
                      System Admin
                    </div>
                  </div>
                  {user?.username === mockUser.username && (
                    <Icon name="accept" style={{ color: '#0070f2', fontSize: '1rem' }} />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Logout */}
          {user && (
            <>
              <div style={{ height: '1px', background: '#e5e5e5', margin: '0.5rem 0' }} />
              <div
                onClick={handleLogout}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name="log" style={{ color: '#EF4444', fontSize: '1rem' }} />
                <span style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 500 }}>Logout</span>
              </div>
            </>
          )}
        </div>
      </Popover>
    </>
  );
}
