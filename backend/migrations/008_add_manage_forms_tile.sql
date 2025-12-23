-- Add Manage Forms tile to admin section
INSERT INTO tiles (id, section_id, name, name_fa, description, icon, color, slug, type, order_index, config, is_active)
VALUES (
  '55555555-aaaa-aaaa-aaaa-555555555555',
  '66666666-6666-6666-6666-666666666666',
  'Manage Forms',
  'مدیریت فرم‌ها',
  'Create, edit, and manage form definitions',
  'form',
  '#10b981',
  'manage-forms',
  'app',
  5,
  '{"route": "/app/manage-forms", "permissions": ["admin.forms.manage"]}'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;
