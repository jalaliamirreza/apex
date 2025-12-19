import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShellBar,
  FlexBox,
  TabContainer,
  Tab,
  Title,
  BusyIndicator,
  Card,
  Icon,
  Text,
  Popover,
  List
} from '@ui5/webcomponents-react';
import { launchpadApi } from '../services/api';
import { Space, Page, Section, Tile } from '../types/launchpad';
import '@ui5/webcomponents-icons/dist/AllIcons';

function LaunchpadPage() {
  const navigate = useNavigate();
  const { spaceId, pageId } = useParams();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [activePage, setActivePage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const pageButtonRef = useRef<HTMLDivElement>(null);

  // Load spaces on mount
  useEffect(() => {
    loadSpaces();
  }, []);

  // When spaceId changes, update active space
  useEffect(() => {
    if (spaces.length > 0 && spaceId) {
      const space = spaces.find(s => s.id === spaceId);
      if (space) {
        setActiveSpace(space);
        // Load default page if no pageId
        if (!pageId && space.pages.length > 0) {
          const defaultPage = space.pages.find(p => p.isDefault) || space.pages[0];
          navigate(`/launchpad/${spaceId}/${defaultPage.id}`, { replace: true });
        }
      }
    }
  }, [spaces, spaceId, pageId, navigate]);

  // When pageId changes, load page content
  useEffect(() => {
    if (pageId) {
      loadPageContent(pageId);
    }
  }, [pageId]);

  const loadSpaces = async () => {
    try {
      const data = await launchpadApi.getSpaces();
      setSpaces(data.spaces);

      // Navigate to first space if none selected
      if (!spaceId && data.spaces.length > 0) {
        const firstSpace = data.spaces[0];
        const defaultPage = firstSpace.pages.find((p: Page) => p.isDefault) || firstSpace.pages[0];
        navigate(`/launchpad/${firstSpace.id}/${defaultPage.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPageContent = async (id: string) => {
    try {
      const page = await launchpadApi.getPageContent(id);
      setActivePage(page);
    } catch (error) {
      console.error('Failed to load page:', error);
    }
  };

  const handleSpaceChange = (space: Space) => {
    const defaultPage = space.pages.find(p => p.isDefault) || space.pages[0];
    if (defaultPage) {
      navigate(`/launchpad/${space.id}/${defaultPage.id}`);
    }
  };

  const handlePageChange = (pageId: string) => {
    if (activeSpace) {
      navigate(`/launchpad/${activeSpace.id}/${pageId}`);
    }
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.type === 'form') {
      navigate(`/forms/${tile.slug}`);
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
    <FlexBox direction="Column" style={{ height: '100vh', fontFamily: 'Vazirmatn, sans-serif' }}>
      {/* Shell Bar */}
      <ShellBar
        primaryTitle="APEX Enterprise"
        secondaryTitle="Business Process Platform"
        showNotifications
        notificationsCount="3"
        onLogoClick={() => navigate('/launchpad')}
      />

      {/* Space Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        padding: '0 1rem'
      }}>
        <TabContainer
          collapsed={false}
          onTabSelect={(e) => {
            const selectedSpaceId = (e.detail.tab as any).dataset.spaceId;
            const space = spaces.find(s => s.id === selectedSpaceId);
            if (space) handleSpaceChange(space);
          }}
        >
          {spaces.map(space => (
            <Tab
              key={space.id}
              text={space.name}
              icon={space.icon}
              selected={activeSpace?.id === space.id}
              data-space-id={space.id}
            />
          ))}
        </TabContainer>
      </div>

      {/* Page Selector (if multiple pages) */}
      {activeSpace && activeSpace.pages.length > 1 && (
        <div style={{
          background: '#f7f7f7',
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div
            ref={pageButtonRef}
            onClick={() => setPopoverOpen(!popoverOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              color: '#0a6ed1',
              fontWeight: 600,
              fontSize: '1.25rem'
            }}>
              {activePage?.name || activeSpace.pages.find(p => p.id === pageId)?.name}
            </span>
            <span style={{ color: '#6a6d70', fontSize: '1.25rem' }}>|</span>
            <Icon name="navigation-down-arrow" style={{ color: '#0a6ed1', fontSize: '1rem' }} />
          </div>

          <Popover
            opener={pageButtonRef.current || undefined}
            open={popoverOpen}
          >
            <div style={{
              minWidth: '200px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {activeSpace.pages.map(page => (
                <div
                  key={page.id}
                  data-page-id={page.id}
                  onClick={() => {
                    handlePageChange(page.id);
                    setPopoverOpen(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    background: page.id === pageId ? '#e5f1fa' : 'transparent',
                    borderBottom: '1px solid #e5e5e5',
                    fontWeight: page.id === pageId ? 600 : 400,
                    color: page.id === pageId ? '#0a6ed1' : '#32363a',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (page.id !== pageId) {
                      e.currentTarget.style.background = '#f7f7f7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page.id !== pageId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {page.name}
                </div>
              ))}
            </div>
          </Popover>
        </div>
      )}

      {/* Page Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1.5rem',
        background: '#f7f7f7'
      }}>
        {activePage?.sections?.map(section => (
          <div key={section.id} style={{ marginBottom: '2rem' }}>
            {/* Section Title */}
            <Title level="H4" style={{
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #0a6ed1'
            }}>
              {section.name}
            </Title>

            {/* Tiles Grid */}
            <FlexBox wrap="Wrap" style={{ gap: '1rem' }}>
              {section.tiles.map(tile => (
                <TileCard
                  key={tile.id}
                  tile={tile}
                  onClick={() => handleTileClick(tile)}
                />
              ))}
            </FlexBox>
          </div>
        ))}
      </div>
    </FlexBox>
  );
}

// Tile Card Component
interface TileCardProps {
  tile: Tile;
  onClick: () => void;
}

function TileCard({ tile, onClick }: TileCardProps) {
  return (
    <Card
      onClick={onClick}
      style={{
        width: '160px',
        height: '160px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #e5e5e5'
      }}
      className="tile-card"
    >
      <FlexBox
        direction="Column"
        alignItems="Center"
        justifyContent="Center"
        style={{
          height: '100%',
          padding: '1rem',
          textAlign: 'center',
          direction: tile.direction || 'rtl'
        }}
      >
        <Icon
          name={tile.icon || 'document'}
          style={{
            fontSize: '2.5rem',
            color: tile.color || '#0a6ed1',
            marginBottom: '0.75rem'
          }}
        />
        <Text style={{
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: '1.3'
        }}>
          {tile.name}
        </Text>
        {tile.description && (
          <Text style={{
            fontSize: '12px',
            color: '#6a6d70',
            marginTop: '0.25rem'
          }}>
            {tile.description.substring(0, 40)}...
          </Text>
        )}
      </FlexBox>
    </Card>
  );
}

export default LaunchpadPage;
