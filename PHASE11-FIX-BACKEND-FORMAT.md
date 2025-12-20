# PHASE 11 FIX: Backend Admin Service Data Format

## Issue
The `backend/src/services/admin.service.ts` returns data in camelCase format (e.g., `nameFa`, `orderIndex`, `isActive`), but the frontend expects snake_case format (e.g., `name_fa`, `order_index`, `is_active`).

## File to Modify
`backend/src/services/admin.service.ts`

## Fix Instructions

For ALL return statements in ALL functions, change camelCase to snake_case:

### Pattern to Find and Replace

**SPACES:**
```
nameFa: row.name_fa      →  name_fa: row.name_fa
orderIndex: row.order_index  →  order_index: row.order_index
isActive: row.is_active  →  is_active: row.is_active
```

**PAGES:**
```
spaceId: row.space_id    →  space_id: row.space_id
nameFa: row.name_fa      →  name_fa: row.name_fa
orderIndex: row.order_index  →  order_index: row.order_index
isDefault: row.is_default →  is_default: row.is_default
isActive: row.is_active  →  is_active: row.is_active
```

**SECTIONS:**
```
pageId: row.page_id      →  page_id: row.page_id
nameFa: row.name_fa      →  name_fa: row.name_fa
orderIndex: row.order_index  →  order_index: row.order_index
isActive: row.is_active  →  is_active: row.is_active
```

**TILES:**
```
sectionId: row.section_id →  section_id: row.section_id
nameFa: row.name_fa      →  name_fa: row.name_fa
orderIndex: row.order_index  →  order_index: row.order_index
isActive: row.is_active  →  is_active: row.is_active
```

## Functions to Update

1. `getAllSpaces()` - return mapping
2. `getSpaceById()` - return mapping
3. `createSpace()` - return mapping
4. `updateSpace()` - return mapping
5. `getAllPages()` - return mapping
6. `getPageById()` - return mapping
7. `createPage()` - return mapping
8. `updatePage()` - return mapping
9. `getAllSections()` - return mapping
10. `getSectionById()` - return mapping
11. `createSection()` - return mapping
12. `updateSection()` - return mapping
13. `getAllTiles()` - return mapping
14. `getTileById()` - return mapping
15. `createTile()` - return mapping
16. `updateTile()` - return mapping

## Do NOT Change
- The import statements
- The DTO interfaces (CreateSpaceDto, UpdateSpaceDto, etc.) - these use snake_case already
- The SQL queries
- The function logic

## After Fix
Restart backend container:
```bash
docker-compose restart apex-backend
```

## Test
```bash
curl http://localhost:3001/api/v1/admin/spaces
```
Should return data with snake_case keys like `name_fa`, `order_index`, `is_active`.
