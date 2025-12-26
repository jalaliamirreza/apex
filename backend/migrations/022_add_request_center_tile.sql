-- Migration: Add Request Center tile to My Requests space
-- Date: 2025-12-26

-- Add Request Center tile to My Requests space
INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active)
SELECT 
  gen_random_uuid(),
  s.id,
  'Request Center',
  'مرکز درخواست‌ها',
  'request-center',
  'View and manage your requests and approvals',
  'task',
  '#0a6ed1',
  'app',
  1,
  'rtl',
  '{"route": "/app/request-center"}'::jsonb,
  true
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'my-requests' AND p.slug = 'all'
LIMIT 1;
