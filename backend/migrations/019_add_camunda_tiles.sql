-- Migration 019: Add Camunda workflow tiles to Administration space
-- Date: 2025-12-25

INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active)
VALUES 
  (
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    'My Tasks',
    'کارهای من',
    'my-tasks',
    'Camunda Tasklist - View and complete assigned tasks',
    'task',
    '#0a6ed1',
    'link',
    10,
    'ltr',
    '{"url": "http://localhost:8082", "target": "_blank"}',
    true
  ),
  (
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    'Workflow Management',
    'مدیریت گردش کار',
    'workflow-management',
    'Camunda Operate - Monitor running processes',
    'process',
    '#6366f1',
    'link',
    11,
    'ltr',
    '{"url": "http://localhost:8081", "target": "_blank"}',
    true
  );
