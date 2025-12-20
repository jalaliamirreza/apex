import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShellBar,
  ShellBarItem,
  FlexBox,
  Title,
  BusyIndicator,
  Card,
  Icon,
  Text,
  Popover,
  IllustratedMessage
} from '@ui5/webcomponents-react';
import { launchpadApi } from '../services/api';
import { Space, Page, Section, Tile } from '../types/launchpad';
import '@ui5/webcomponents-icons/dist/AllIcons';
import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js";

function LaunchpadPage() {
  const navigate = useNavigate();
  const { spaceSlug, pageSlug } = useParams();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [activePage, setActivePage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSpaceDropdown, setOpenSpaceDropdown] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const spaceDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const profileButtonRef = useRef<HTMLDivElement | null>(null);
  const notificationsButtonRef = useRef<HTMLDivElement | null>(null);

  // Load spaces on mount
  useEffect(() => {
    loadSpaces();
  }, []);

  // When spaceSlug changes, update active space
  useEffect(() => {
    if (spaces.length > 0 && spaceSlug) {
      const space = spaces.find(s => s.slug === spaceSlug);
      if (space) {
        setActiveSpace(space);
        // Load default page if no pageSlug
        if (!pageSlug && space.pages.length > 0) {
          const defaultPage = space.pages.find(p => p.isDefault) || space.pages[0];
          navigate(`/launchpad/${space.slug}/${defaultPage.slug}`, { replace: true });
        }
      }
    }
  }, [spaces, spaceSlug, pageSlug, navigate]);

  // When pageSlug changes, load page content
  useEffect(() => {
    if (spaceSlug && pageSlug) {
      loadPageContent(spaceSlug, pageSlug);
    }
  }, [spaceSlug, pageSlug]);

  const loadSpaces = async () => {
    try {
      const data = await launchpadApi.getSpaces();
      setSpaces(data.spaces);

      // Navigate to first space if none selected
      if (!spaceSlug && data.spaces.length > 0) {
        const firstSpace = data.spaces[0];
        const defaultPage = firstSpace.pages.find((p: Page) => p.isDefault) || firstSpace.pages[0];
        navigate(`/launchpad/${firstSpace.slug}/${defaultPage.slug}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPageContent = async (spaceSlug: string, pageSlug: string) => {
    try {
      const page = await launchpadApi.getPageContentBySlug(spaceSlug, pageSlug);
      setActivePage(page);
    } catch (error) {
      console.error('Failed to load page:', error);
    }
  };

  const handleSpaceNameClick = (space: Space, e: React.MouseEvent) => {
    e.stopPropagation();

    // Navigate to default page of the space
    const defaultPage = space.pages.find(p => p.isDefault) || space.pages[0];
    navigate(`/launchpad/${space.slug}/${defaultPage.slug}`);
  };

  const handleArrowClick = (space: Space, e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle dropdown
    if (openSpaceDropdown === space.slug) {
      setOpenSpaceDropdown(null);
    } else {
      setOpenSpaceDropdown(space.slug);
    }
  };

  const handlePageChange = (page: Page) => {
    if (activeSpace) {
      navigate(`/launchpad/${activeSpace.slug}/${page.slug}`);
    }
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.type === 'form') {
      navigate(`/forms/${tile.slug}`);
    } else if (tile.type === 'app') {
      // Use route from config if available, otherwise fallback to /app/:slug
      const route = tile.config?.route || `/app/${tile.slug}`;
      navigate(route);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <FlexBox direction="Column" style={{ height: '100vh', fontFamily: 'Vazirmatn, sans-serif' }}>
        {/* SYNCRO Shell Bar */}
      <div style={{
        background: 'white',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
             onClick={() => navigate('/launchpad')}>
          <img src="/logo.svg" alt="SYNCRO" style={{ height: '56px' }} />
          <div>
            <div style={{ color: '#32363a', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              SYNCRO
            </div>
            <div style={{ color: '#6a6d70', fontSize: '0.75rem' }}>
              Business Process Platform
            </div>
          </div>
        </div>

        {/* Right Side: Search, Help, Notifications and Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Search */}
          <div
            style={{
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="search" style={{ color: '#32363a', fontSize: '1.25rem' }} />
          </div>

          {/* Help */}
          <div
            style={{
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="sys-help" style={{ color: '#32363a', fontSize: '1.25rem' }} />
          </div>

          {/* Notifications */}
          <div
            ref={notificationsButtonRef}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="bell" style={{ color: '#32363a', fontSize: '1.25rem' }} />
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#EF4444',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '0.625rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600
            }}>3</div>
          </div>

          {/* Profile */}
          <div
            ref={profileButtonRef}
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
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
            <span style={{ color: '#32363a', fontWeight: 500, fontSize: '0.875rem' }}>Ali Ahmadi</span>
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
        </div>
      </div>

      {/* Notifications Popover */}
      <Popover
        opener={notificationsButtonRef.current || undefined}
        open={notificationsOpen}
        placement="Bottom"
      >
        <div style={{ width: '320px', maxHeight: '400px', overflow: 'auto' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e5e5' }}>
            <Text style={{ fontWeight: 600, fontSize: '1rem' }}>Notifications</Text>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {[
              { icon: 'document', title: 'Leave Request Approved', message: 'Your leave request for Dec 25-27 has been approved', time: '5 min ago', unread: true },
              { icon: 'accept', title: 'Performance Review Completed', message: 'Your Q4 performance review is now available', time: '2 hours ago', unread: true },
              { icon: 'message-information', title: 'New Company Policy', message: 'Updated remote work policy has been published', time: '1 day ago', unread: true },
              { icon: 'calendar', title: 'Upcoming Event', message: 'Team building event on Friday', time: '2 days ago', unread: false }
            ].map((notif, idx) => (
              <div
                key={idx}
                onClick={() => setNotificationsOpen(false)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  background: notif.unread ? '#f0f9ff' : 'transparent',
                  borderRadius: '8px',
                  marginBottom: '0.25rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!notif.unread) e.currentTarget.style.background = '#f7f7f7';
                }}
                onMouseLeave={(e) => {
                  if (!notif.unread) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon name={notif.icon} style={{ color: '#0284c7', fontSize: '1rem' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6a6d70', marginBottom: '0.25rem' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#9ca3af' }}>
                      {notif.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popover>

      {/* Profile Menu Popover */}
      <Popover
        opener={profileButtonRef.current || undefined}
        open={profileMenuOpen}
        placement="Bottom"
      >
        <div style={{ width: '200px' }}>
          {[
            { icon: 'person-placeholder', label: 'Profile' },
            { icon: 'action-settings', label: 'Settings' },
            { icon: 'hint', label: 'About' },
            { icon: 'log', label: 'Sign Out', color: '#EF4444' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setProfileMenuOpen(false);
                if (item.label === 'Sign Out') {
                  navigate('/login');
                }
              }}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'background 0.2s',
                borderBottom: idx < 3 ? '1px solid #e5e5e5' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f7'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name={item.icon} style={{ color: item.color || '#6a6d70', fontSize: '1rem' }} />
              <span style={{ color: item.color || '#32363a', fontSize: '0.875rem' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Popover>

      {/* Space Tabs with integrated Page Dropdowns */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        padding: '0',
        display: 'flex',
        alignItems: 'stretch'
      }}>
        {spaces.map(space => (
          <div key={space.slug} style={{ position: 'relative', display: 'flex' }}>
            <div
              ref={el => spaceDropdownRefs.current[space.slug] = el}
              className={activeSpace?.slug === space.slug ? 'space-tab active' : 'space-tab'}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: activeSpace?.slug === space.slug ? '3px solid #0070f2' : '3px solid transparent',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.2s',
                fontWeight: activeSpace?.slug === space.slug ? 600 : 400,
                color: activeSpace?.slug === space.slug ? '#0070f2' : '#32363a',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '48px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0070f2';
              }}
              onMouseLeave={(e) => {
                if (activeSpace?.slug !== space.slug) {
                  e.currentTarget.style.color = '#32363a';
                }
              }}
            >
              {/* Space Name - Click to navigate to default page */}
              <div
                onClick={(e) => handleSpaceNameClick(space, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <Icon name={space.icon} style={{ fontSize: '1rem' }} />
                <span>{space.nameFa || space.name}</span>
              </div>

              {/* Arrow Dropdown - Click to open page list */}
              {space.pages.length > 1 && (
                <div
                  onClick={(e) => handleArrowClick(space, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <span style={{ color: '#6a6d70' }}>|</span>
                  <Icon name="navigation-down-arrow" style={{ fontSize: '0.875rem', color: 'var(--primary)' }} />
                </div>
              )}
            </div>

            {/* Popover for pages */}
            {space.pages.length > 1 && (
              <Popover
                opener={spaceDropdownRefs.current[space.slug] || undefined}
                open={openSpaceDropdown === space.slug}
                placement="Bottom"
                horizontalAlign="Start"
              >
                <div style={{
                  minWidth: '200px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {space.pages.map(page => (
                    <div
                      key={page.slug}
                      onClick={() => {
                        navigate(`/launchpad/${space.slug}/${page.slug}`);
                        setOpenSpaceDropdown(null);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        background: page.slug === pageSlug && activeSpace?.slug === space.slug ? '#e5f1fa' : 'transparent',
                        borderBottom: '1px solid #e5e5e5',
                        fontWeight: page.slug === pageSlug && activeSpace?.slug === space.slug ? 600 : 400,
                        color: page.slug === pageSlug && activeSpace?.slug === space.slug ? 'var(--primary)' : '#32363a',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!(page.slug === pageSlug && activeSpace?.slug === space.slug)) {
                          e.currentTarget.style.background = '#f7f7f7';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(page.slug === pageSlug && activeSpace?.slug === space.slug)) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {page.nameFa || page.name}
                    </div>
                  ))}
                </div>
              </Popover>
            )}
          </div>
        ))}
      </div>

      {/* Page Content */}
      <div
        key={pageSlug}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem',
          background: '#f7f7f7',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {activePage?.sections && activePage.sections.length > 0 ? (
          activePage.sections.map(section => (
            <div key={section.id} style={{ marginBottom: '2rem' }}>
              {/* Section Title */}
              <Title level="H4" className="section-title" style={{
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                {section.nameFa || section.name}
              </Title>

              {/* Tiles Grid or Empty State */}
              {section.tiles.length === 0 ? (
                <IllustratedMessage
                  name="NoData"
                  titleText="No apps available"
                  subtitleText="No applications in this section"
                />
              ) : (
                <FlexBox wrap="Wrap" style={{ gap: '1rem' }}>
                  {section.tiles.map(tile => (
                    <TileCard
                      key={tile.id}
                      tile={tile}
                      onClick={() => handleTileClick(tile)}
                    />
                  ))}
                </FlexBox>
              )}
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <IllustratedMessage
              name="NoData"
              titleText="No apps available"
              subtitleText="No applications on this page"
            />
          </div>
        )}
      </div>
    </FlexBox>
    </>
  );
}

// Tile Card Component
interface TileCardProps {
  tile: Tile;
  onClick: () => void;
}

function TileCard({ tile, onClick }: TileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '176px',
        height: '176px',
        minWidth: '176px',
        minHeight: '176px',
        maxWidth: '176px',
        maxHeight: '176px',
        flexShrink: 0,
        cursor: 'pointer',
        borderRadius: '16px',
        boxShadow: isHovered
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        background: isHovered ? '#f0f0f0' : '#ffffff',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* ===== CONTENT AREA (Top) ===== */}
      <div
        style={{
          padding: '16px',
          paddingBottom: '56px'
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 600,
            fontSize: '14px',
            color: '#1d2d3e',
            marginBottom: '6px',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          } as React.CSSProperties}
        >
          {tile.nameFa || tile.name}
        </div>

        {/* Subtitle - GRAY */}
        <div
          style={{
            color: '#6a6d70',
            fontSize: '12px',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          } as React.CSSProperties}
        >
          {tile.description || ''}
        </div>
      </div>

      {/* ===== ICON (Absolute positioned at bottom-left) ===== */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px'
        }}
      >
        <Icon
          name={`SAP-icons-v5/${tile.icon || 'document'}`}
          className="tile-icon"
          style={{
            color: '#6a6d70'
          }}
        />
      </div>
    </div>
  );
}

export default LaunchpadPage;
