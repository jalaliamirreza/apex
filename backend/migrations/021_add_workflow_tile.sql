-- Add workflow configuration tile to admin section
INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Form Workflows',
  'گردش کار فرم‌ها',
  'manage-forms-workflow',
  'Configure workflow automation for forms',
  'process',
  '#6366f1',
  'app',
  7,
  'ltr',
  '{"route": "/app/manage-forms-workflow"}'::jsonb,
  true
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'admin' AND p.slug = 'system' AND s.name = 'System Management'
ON CONFLICT DO NOTHING;
