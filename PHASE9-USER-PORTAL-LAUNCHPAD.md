# Phase 9: User Portal - Fiori Launchpad with Spaces & Pages

## Objective
Build SAP Fiori 3 style Launchpad with Spaces, Pages, Sections, and Tiles for the User Portal.

---

## 1. Database Schema

### 1.1 Create Tables

```sql
-- Spaces (Top level navigation tabs)
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,           -- "مالی و اعتبارات"
  name_en VARCHAR(255),                 -- "Finance & Credit"
  icon VARCHAR(50) DEFAULT 'folder',    -- SAP UI5 icon name
  color VARCHAR(20) DEFAULT '#0a6ed1',  -- Theme color
  order_index INT DEFAULT 0,
  direction VARCHAR(3) DEFAULT 'rtl',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pages (Under each space, shown in dropdown)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "وام‌ها"
  name_en VARCHAR(255),                 -- "Loans"
  icon VARCHAR(50) DEFAULT 'document',
  order_index INT DEFAULT 0,
  is_default BOOLEAN DEFAULT false,     -- First page to show
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sections (Groups of tiles on a page)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "وام‌های شخصی"
  name_en VARCHAR(255),                 -- "Personal Loans"
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update forms table to link to sections
ALTER TABLE forms ADD COLUMN section_id UUID REFERENCES sections(id);
ALTER TABLE forms ADD COLUMN icon VARCHAR(50) DEFAULT 'document';
ALTER TABLE forms ADD COLUMN color VARCHAR(20) DEFAULT '#0a6ed1';
ALTER TABLE forms ADD COLUMN order_index INT DEFAULT 0;

-- Create indexes
CREATE INDEX idx_pages_space_id ON pages(space_id);
CREATE INDEX idx_sections_page_id ON sections(page_id);
CREATE INDEX idx_forms_section_id ON forms(section_id);
```

### 1.2 Sample Data

```sql
-- Insert Spaces
INSERT INTO spaces (id, name, name_en, icon, order_index, direction) VALUES
  ('11111111-1111-1111-1111-111111111111', 'مالی و اعتبارات', 'Finance & Credit', 'money-bills', 1, 'rtl'),
  ('22222222-2222-2222-2222-222222222222', 'منابع انسانی', 'Human Resources', 'employee', 2, 'rtl'),
  ('33333333-3333-3333-3333-333333333333', 'فناوری اطلاعات', 'Information Technology', 'it-host', 3, 'rtl'),
  ('44444444-4444-4444-4444-444444444444', 'درخواست‌های من', 'My Requests', 'outbox', 4, 'rtl');

-- Insert Pages for "مالی و اعتبارات"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'وام‌ها', 'Loans', 'loan', 1, true),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'اعتبارات', 'Credits', 'credit-card', 2, false);

-- Insert Pages for "منابع انسانی"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'مرخصی‌ها', 'Leaves', 'calendar', 1, true),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'اطلاعات پرسنلی', 'Personnel Info', 'person-placeholder', 2, false);

-- Insert Pages for "فناوری اطلاعات"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'درخواست‌های IT', 'IT Requests', 'technical-object', 1, true);

-- Insert Pages for "درخواست‌های من"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('dddd1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'همه درخواست‌ها', 'All Requests', 'list', 1, true),
  ('dddd2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'در انتظار تایید', 'Pending', 'pending', 2, false),
  ('dddd3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'تایید شده', 'Approved', 'accept', 3, false);

-- Insert Sections for "وام‌ها" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec11111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'وام‌های شخصی', 'Personal Loans', 1),
  ('sec22222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', 'وام‌های سازمانی', 'Organizational Loans', 2);

-- Insert Sections for "مرخصی‌ها" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec33333-3333-3333-3333-333333333333', 'bbbb1111-1111-1111-1111-111111111111', 'انواع مرخصی', 'Leave Types', 1);

-- Insert Sections for "اطلاعات پرسنلی" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec44444-4444-4444-4444-444444444444', 'bbbb2222-2222-2222-2222-222222222222', 'فرم‌های اطلاعاتی', 'Information Forms', 1);

-- Insert Sections for "درخواست‌های IT" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec55555-5555-5555-5555-555555555555', 'cccc1111-1111-1111-1111-111111111111', 'درخواست تجهیزات', 'Equipment Requests', 1);
```

---

## 2. Backend API

### 2.1 Models

Create `backend/src/models/launchpad.model.ts`:

```typescript
export interface Space {
  id: string;
  name: string;
  nameEn?: string;
  icon: string;
  color: string;
  orderIndex: number;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  pages?: Page[];
}

export interface Page {
  id: string;
  spaceId: string;
  name: string;
  nameEn?: string;
  icon: string;
  orderIndex: number;
  isDefault: boolean;
  isActive: boolean;
  sections?: Section[];
}

export interface Section {
  id: string;
  pageId: string;
  name: string;
  nameEn?: string;
  orderIndex: number;
  isActive: boolean;
  tiles?: Tile[];
}

export interface Tile {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi';
  orderIndex: number;
}
```

### 2.2 Services

Create `backend/src/services/launchpad.service.ts`:

```typescript
import { pool } from '../config/database';
import { Space, Page, Section, Tile } from '../models/launchpad.model';

// Get all spaces with pages (for navigation)
export async function getSpaces(): Promise<Space[]> {
  const result = await pool.query(`
    SELECT s.*, 
      COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'nameEn', p.name_en,
          'icon', p.icon,
          'orderIndex', p.order_index,
          'isDefault', p.is_default
        ) ORDER BY p.order_index
      ) FILTER (WHERE p.id IS NOT NULL), '[]') as pages
    FROM spaces s
    LEFT JOIN pages p ON p.space_id = s.id AND p.is_active = true
    WHERE s.is_active = true
    GROUP BY s.id
    ORDER BY s.order_index
  `);
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    icon: row.icon,
    color: row.color,
    orderIndex: row.order_index,
    direction: row.direction,
    isActive: row.is_active,
    pages: row.pages
  }));
}

// Get page content with sections and tiles
export async function getPageContent(pageId: string): Promise<Page | null> {
  // Get page
  const pageResult = await pool.query(
    'SELECT * FROM pages WHERE id = $1 AND is_active = true',
    [pageId]
  );
  
  if (pageResult.rows.length === 0) return null;
  
  const page = pageResult.rows[0];
  
  // Get sections with tiles (forms)
  const sectionsResult = await pool.query(`
    SELECT sec.*,
      COALESCE(json_agg(
        json_build_object(
          'id', f.id,
          'name', f.name,
          'description', f.description,
          'icon', COALESCE(f.icon, 'document'),
          'color', COALESCE(f.color, '#0a6ed1'),
          'slug', f.slug,
          'type', 'form',
          'orderIndex', COALESCE(f.order_index, 0),
          'direction', f.direction
        ) ORDER BY f.order_index
      ) FILTER (WHERE f.id IS NOT NULL), '[]') as tiles
    FROM sections sec
    LEFT JOIN forms f ON f.section_id = sec.id AND f.status = 'active'
    WHERE sec.page_id = $1 AND sec.is_active = true
    GROUP BY sec.id
    ORDER BY sec.order_index
  `, [pageId]);
  
  return {
    id: page.id,
    spaceId: page.space_id,
    name: page.name,
    nameEn: page.name_en,
    icon: page.icon,
    orderIndex: page.order_index,
    isDefault: page.is_default,
    isActive: page.is_active,
    sections: sectionsResult.rows.map(row => ({
      id: row.id,
      pageId: row.page_id,
      name: row.name,
      nameEn: row.name_en,
      orderIndex: row.order_index,
      isActive: row.is_active,
      tiles: row.tiles
    }))
  };
}

// Get default page for a space
export async function getDefaultPage(spaceId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT id FROM pages WHERE space_id = $1 AND is_default = true AND is_active = true LIMIT 1',
    [spaceId]
  );
  return result.rows[0]?.id || null;
}
```

### 2.3 Routes

Create `backend/src/routes/launchpad.routes.ts`:

```typescript
import { Router, Request, Response } from 'express';
import * as launchpadService from '../services/launchpad.service';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/v1/launchpad/spaces - Get all spaces with pages
router.get('/spaces', async (req: Request, res: Response) => {
  try {
    const spaces = await launchpadService.getSpaces();
    res.json({ spaces });
  } catch (error) {
    logger.error('Get spaces error:', error);
    res.status(500).json({ error: 'Failed to get spaces' });
  }
});

// GET /api/v1/launchpad/pages/:pageId - Get page content
router.get('/pages/:pageId', async (req: Request, res: Response) => {
  try {
    const page = await launchpadService.getPageContent(req.params.pageId);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(page);
  } catch (error) {
    logger.error('Get page content error:', error);
    res.status(500).json({ error: 'Failed to get page content' });
  }
});

// GET /api/v1/launchpad/spaces/:spaceId/default-page - Get default page ID
router.get('/spaces/:spaceId/default-page', async (req: Request, res: Response) => {
  try {
    const pageId = await launchpadService.getDefaultPage(req.params.spaceId);
    if (!pageId) {
      res.status(404).json({ error: 'No default page found' });
      return;
    }
    res.json({ pageId });
  } catch (error) {
    logger.error('Get default page error:', error);
    res.status(500).json({ error: 'Failed to get default page' });
  }
});

export default router;
```

### 2.4 Register Routes

Update `backend/src/routes/index.ts`:

```typescript
import { Router } from 'express';
import formRoutes from './form.routes';
import submissionRoutes from './submission.routes';
import searchRoutes from './search.routes';
import launchpadRoutes from './launchpad.routes';  // ADD

const router = Router();

router.use('/forms', formRoutes);
router.use('/submissions', submissionRoutes);
router.use('/search', searchRoutes);
router.use('/launchpad', launchpadRoutes);  // ADD

export default router;
```

---

## 3. Frontend - Launchpad UI

### 3.1 API Service

Update `frontend/src/services/api.ts`:

```typescript
// Add launchpad API
export const launchpadApi = {
  getSpaces: async () => {
    const res = await fetch(`${API_URL}/launchpad/spaces`);
    if (!res.ok) throw new Error('Failed to get spaces');
    return res.json();
  },
  
  getPageContent: async (pageId: string) => {
    const res = await fetch(`${API_URL}/launchpad/pages/${pageId}`);
    if (!res.ok) throw new Error('Failed to get page content');
    return res.json();
  },
  
  getDefaultPage: async (spaceId: string) => {
    const res = await fetch(`${API_URL}/launchpad/spaces/${spaceId}/default-page`);
    if (!res.ok) throw new Error('Failed to get default page');
    return res.json();
  }
};
```

### 3.2 Types

Create `frontend/src/types/launchpad.ts`:

```typescript
export interface Space {
  id: string;
  name: string;
  nameEn?: string;
  icon: string;
  color: string;
  orderIndex: number;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  pages: Page[];
}

export interface Page {
  id: string;
  spaceId: string;
  name: string;
  nameEn?: string;
  icon: string;
  orderIndex: number;
  isDefault: boolean;
  isActive: boolean;
  sections?: Section[];
}

export interface Section {
  id: string;
  pageId: string;
  name: string;
  nameEn?: string;
  orderIndex: number;
  isActive: boolean;
  tiles: Tile[];
}

export interface Tile {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi';
  orderIndex: number;
  direction?: 'ltr' | 'rtl';
}
```

### 3.3 Launchpad Page Component

Create `frontend/src/pages/LaunchpadPage.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShellBar,
  FlexBox,
  TabContainer,
  Tab,
  Select,
  Option,
  Title,
  BusyIndicator,
  Card,
  Icon,
  Text
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
  }, [spaces, spaceId]);

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
        <BusyIndicator active size="Large" />
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ height: '100vh' }}>
      {/* Shell Bar */}
      <ShellBar
        logo={<img src="/logo.svg" alt="APEX" style={{ height: '32px' }} />}
        primaryTitle="APEX Enterprise"
        secondaryTitle="Business Process Platform"
        showNotifications
        notificationsCount="3"
        profile={<img src="/avatar.png" alt="User" style={{ borderRadius: '50%' }} />}
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
            const selectedSpaceId = e.detail.tab.dataset.spaceId;
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
          <Select
            value={pageId}
            onChange={(e) => handlePageChange(e.detail.selectedOption.dataset.pageId!)}
            style={{ minWidth: '200px' }}
          >
            {activeSpace.pages.map(page => (
              <Option key={page.id} data-page-id={page.id} selected={page.id === pageId}>
                {page.name}
              </Option>
            ))}
          </Select>
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
```

### 3.4 Add Tile Hover Styles

Add to `frontend/src/index.css`:

```css
/* Tile hover effect */
.tile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #0a6ed1 !important;
}
```

### 3.5 Update Router

Update `frontend/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LaunchpadPage from './pages/LaunchpadPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Portal - Launchpad */}
        <Route path="/" element={<Navigate to="/launchpad" replace />} />
        <Route path="/launchpad" element={<LaunchpadPage />} />
        <Route path="/launchpad/:spaceId" element={<LaunchpadPage />} />
        <Route path="/launchpad/:spaceId/:pageId" element={<LaunchpadPage />} />
        
        {/* Form Pages */}
        <Route path="/forms/:slug" element={<FormPage />} />
        <Route path="/forms/:slug/submissions" element={<SubmissionsPage />} />
        
        {/* Legacy routes (redirect to launchpad) */}
        <Route path="/forms" element={<Navigate to="/launchpad" replace />} />
        
        {/* Admin Portal (future) */}
        {/* <Route path="/admin/*" element={<AdminLayout />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 4. Link Existing Forms to Sections

```sql
-- Assign existing forms to sections
-- You'll need to adjust IDs based on your actual form IDs

-- وام مهدکودک forms to "وام‌های شخصی" section
UPDATE forms SET section_id = 'sec11111-1111-1111-1111-111111111111', icon = 'nutrition-activity', order_index = 1
WHERE slug = 'daycare-allowance-request';

UPDATE forms SET section_id = 'sec11111-1111-1111-1111-111111111111', icon = 'home', order_index = 2
WHERE slug LIKE '%house%' OR slug LIKE '%home%';

-- HR forms to "انواع مرخصی" section
UPDATE forms SET section_id = 'sec33333-3333-3333-3333-333333333333', icon = 'calendar', order_index = 1
WHERE slug = 'vacation-request';

-- Personnel info forms to "فرم‌های اطلاعاتی" section
UPDATE forms SET section_id = 'sec44444-4444-4444-4444-444444444444', icon = 'family-care', order_index = 1
WHERE slug = 'family-members-information';

-- IT forms to "درخواست تجهیزات" section
UPDATE forms SET section_id = 'sec55555-5555-5555-5555-555555555555', icon = 'laptop', order_index = 1
WHERE slug LIKE '%equipment%' OR slug LIKE '%it%';
```

---

## 5. Testing

### 5.1 Build & Deploy

```bash
cd /mnt/d/Worklab/SAP/AI/apex

# Run database migrations
docker exec apex-postgres psql -U apex -d apex -f /path/to/migration.sql

# Rebuild containers
docker compose up -d --build backend frontend
```

### 5.2 Test URLs

- http://localhost:3000 → Redirects to /launchpad
- http://localhost:3000/launchpad → Shows first space
- http://localhost:3000/launchpad/{spaceId}/{pageId} → Shows specific page

### 5.3 Verify

1. ✅ Space tabs visible at top
2. ✅ Pages dropdown (if multiple pages)
3. ✅ Sections with titles
4. ✅ Tile cards with icons
5. ✅ Click tile → Opens form
6. ✅ RTL support for Persian content

---

## 6. Files Summary

| File | Action |
|------|--------|
| Database | Run SQL migrations |
| `backend/src/models/launchpad.model.ts` | CREATE |
| `backend/src/services/launchpad.service.ts` | CREATE |
| `backend/src/routes/launchpad.routes.ts` | CREATE |
| `backend/src/routes/index.ts` | UPDATE |
| `frontend/src/types/launchpad.ts` | CREATE |
| `frontend/src/services/api.ts` | UPDATE |
| `frontend/src/pages/LaunchpadPage.tsx` | CREATE |
| `frontend/src/index.css` | UPDATE |
| `frontend/src/App.tsx` | UPDATE |

---

## 7. Expected Result

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏛️ APEX Enterprise                          🔔 3  👤           │
├─────────────────────────────────────────────────────────────────┤
│ [مالی و اعتبارات] [منابع انسانی] [فناوری اطلاعات] [درخواست‌های من]│
│       ▼                                                         │
│ [وام‌ها ▼]                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  وام‌های شخصی                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│  │  🍼    │ │  🏠    │ │  ⚡    │                          │
│  │درخواست │ │درخواست │ │درخواست │                          │
│  │  وام   │ │  وام   │ │  وام   │                          │
│  │مهدکودک │ │خریدمنزل│ │ ضروری  │                          │
│  └─────────┘ └─────────┘ └─────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Next Phase

After User Portal is complete:
- **Phase 10:** Admin Portal (Sidebar + CRUD for Spaces/Pages/Sections)
- **Phase 11:** Authorization (Roles, Permissions per Space/Page/Form)
