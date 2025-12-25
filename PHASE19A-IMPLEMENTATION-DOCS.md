# Phase 19A: Mock Authentication Implementation Documentation

## Implementation Date
December 25, 2025

## Overview
Successfully implemented a mock authentication system for development and testing. This system allows developers to test user-specific features (My Tasks, My Submissions) without requiring full Keycloak integration.

---

## Files Created

### 1. `frontend/src/data/mockUsers.ts`
**Purpose:** Mock user data with organizational hierarchy

**Content:**
- 8 mock users across different roles (employees, managers, director, admin)
- Organizational hierarchy with managerId relationships
- Helper functions: getUserById, getUserByUsername, getUserByEmail, getManagerOf, getDirectReports

**Users:**
- **Employees:** hr-employee, it-employee, finance-employee (report to respective managers)
- **Managers:** hr-manager, it-manager, finance-manager (report to director)
- **Director:** director (top of org chart)
- **Admin:** admin (system admin, outside org chart)

### 2. `backend/src/data/mockUsers.ts`
**Purpose:** Same mock user data for backend (identical to frontend)

**Content:** Exact copy of frontend mockUsers.ts for consistency

### 3. `frontend/src/contexts/AuthContext.tsx`
**Purpose:** React context for authentication state management

**Features:**
- useState hook for current user
- localStorage persistence (key: `syncro_mock_user`)
- login(username) - sets user and persists to localStorage
- logout() - clears user and localStorage
- hasRole(role) - check if user has specific role
- isAuthenticated - boolean for auth state

### 4. `frontend/src/components/UserSelector.tsx`
**Purpose:** Dropdown UI component in ShellBar for user selection

**Features:**
- UI5 Popover with grouped user list
- Groups: Employees, Managers, Directors, Admin
- Shows current user's displayName
- Visual checkmark for selected user
- Logout option at bottom
- Hover states and styling matching UI5 design

### 5. `backend/src/routes/auth.routes.ts`
**Purpose:** API endpoints for authentication info

**Endpoints:**
- `GET /api/v1/auth/me` - Returns current user (from X-Mock-User header)
- `GET /api/v1/auth/users` - Returns all mock users (dev only)

---

## Files Modified

### 1. `frontend/src/App.tsx`
**Changes:**
- Imported AuthProvider from contexts/AuthContext
- Wrapped entire app with `<AuthProvider>` component
- Ensures auth context available throughout app

### 2. `frontend/src/services/api.ts`
**Changes:**
- Added axios request interceptor
- Interceptor reads `syncro_mock_user` from localStorage
- Adds `X-Mock-User` header to all API requests
- Ensures backend receives user context

### 3. `frontend/src/pages/LaunchpadPage.tsx`
**Changes:**
- Imported UserSelector component
- Replaced hardcoded profile section with `<UserSelector />`
- Removed profile menu state and refs (profileMenuOpen, profileButtonRef)
- Removed Profile Menu Popover component

### 4. `backend/src/middleware/auth.middleware.ts`
**Changes:**
- Added imports: getUserByUsername, MockUser from mockUsers
- Added global Express.Request type extension for req.user (MockUser)
- Added `mockAuthMiddleware` - reads X-Mock-User header, attaches req.user
- Added `requireAuth` middleware - requires authenticated user
- Added `requireRole(...roles)` middleware - requires specific roles
- Preserved existing internalAuthMiddleware

### 5. `backend/src/index.ts`
**Changes:**
- Imported mockAuthMiddleware
- Registered middleware: `app.use(mockAuthMiddleware)` before routes
- Now all requests have req.user populated if X-Mock-User header present

### 6. `backend/src/routes/index.ts`
**Changes:**
- Imported authRoutes from auth.routes
- Registered: `router.use('/auth', authRoutes)`
- Auth endpoints now available at /api/v1/auth/*

### 7. `backend/src/services/submission.service.ts`
**Changes:**
- Imported getUserByEmail, getManagerOf from mockUsers
- Modified `createApprovalSteps()` signature to accept `submittedBy: string`
- Logic added:
  - Find submitter using getUserByEmail(submittedBy)
  - Find manager using getManagerOf(submitter)
  - Set assigned_to = manager?.email || 'unassigned'
- Updated call to createApprovalSteps to pass submittedBy parameter
- Added logging for approval step assignment

### 8. `backend/src/routes/submission.routes.ts`
**Changes:**
- Updated POST /:slug/submissions handler
- Changed from `req.user?.preferred_username` to `req.user?.email`
- Fallback chain: req.user?.email || req.user?.preferred_username || 'anonymous'
- Ensures email is used for manager lookup

---

## API Endpoints Added

### GET /api/v1/auth/me
**Purpose:** Get current authenticated user

**Headers Required:** `X-Mock-User: {username}`

**Response (200):**
```json
{
  "user": {
    "id": "emp-hr-1",
    "username": "hr-employee",
    "displayName": "HR Employee",
    "displayName_fa": "کارمند منابع انسانی",
    "email": "hr-employee@company.com",
    "roles": ["employee"],
    "department": "HR",
    "managerId": "mgr-hr"
  }
}
```

**Response (401):**
```json
{
  "error": "Not authenticated"
}
```

### GET /api/v1/auth/users
**Purpose:** List all mock users (dev only)

**Response (200):**
```json
{
  "users": [
    { "id": "emp-hr-1", "username": "hr-employee", ... },
    { "id": "emp-it-1", "username": "it-employee", ... },
    ...
  ]
}
```

---

## How to Test

### Prerequisites
```bash
# Rebuild containers to include new code
docker compose down
docker compose up --build -d
```

### Test 1: User Selector Appears in ShellBar
1. Open browser to http://localhost:3000
2. Verify UserSelector dropdown appears in top-right of ShellBar
3. Click dropdown
4. Verify users are grouped: Employees, Managers, Directors, Admin

### Test 2: User Persistence
1. Select "hr-employee" from dropdown
2. Refresh page (F5)
3. Verify "HR Employee" still shows as selected user
4. Check localStorage in DevTools: `syncro_mock_user` = "hr-employee"

### Test 3: API Headers
1. Select "hr-employee"
2. Open DevTools → Network tab
3. Perform any API action (navigate to a form)
4. Check request headers: `X-Mock-User: hr-employee`

### Test 4: Form Submission - submitted_by
1. Select "hr-employee" from UserSelector
2. Navigate to emp-loan form
3. Fill and submit form
4. Check database:
```sql
SELECT id, submitted_by, workflow_status FROM submissions ORDER BY created_at DESC LIMIT 1;
```
**Expected:** `submitted_by = 'hr-employee@company.com'`

### Test 5: Manager Assignment - assigned_to
1. Same submission as Test 4
2. Check approval_steps table:
```sql
SELECT submission_id, step_name, assigned_to FROM approval_steps WHERE submission_id = '<submission_id>';
```
**Expected:** `assigned_to = 'hr-manager@company.com'`

### Test 6: /me Endpoint
```bash
curl -H "X-Mock-User: hr-employee" http://localhost:3001/api/v1/auth/me
```
**Expected:**
```json
{
  "user": {
    "username": "hr-employee",
    "email": "hr-employee@company.com",
    ...
  }
}
```

### Test 7: Logout
1. Select any user
2. Click dropdown → Logout
3. Verify "Select User" appears in ShellBar
4. Check localStorage: `syncro_mock_user` should be removed

---

## Organizational Hierarchy

```
                     ┌─────────────┐
                     │  director   │
                     │ director@   │
                     └──────┬──────┘
          ┌─────────────────┼─────────────────┐
          │                 │                 │
   ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
   │ hr-manager  │   │ it-manager  │   │finance-mgr  │
   │hr-manager@  │   │it-manager@  │   │finance-mgr@ │
   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
          │                 │                 │
   ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
   │hr-employee  │   │it-employee  │   │finance-emp  │
   │hr-employee@ │   │it-employee@ │   │finance-emp@ │
   └─────────────┘   └─────────────┘   └─────────────┘

   ┌─────────────┐
   │   admin     │  ← Outside org (system admin)
   │  admin@     │
   └─────────────┘
```

---

## Database Verification Commands

### Check Recent Submissions
```sql
SELECT 
  s.id,
  s.submitted_by,
  s.workflow_status,
  s.current_step,
  s.submitted_at
FROM submissions s
ORDER BY s.submitted_at DESC
LIMIT 5;
```

### Check Approval Steps with Manager Assignment
```sql
SELECT 
  a.submission_id,
  a.step_name,
  a.assigned_to,
  a.status,
  s.submitted_by
FROM approval_steps a
JOIN submissions s ON a.submission_id = s.id
ORDER BY a.created_at DESC
LIMIT 5;
```

### Verify Manager Assignment Logic
```sql
-- Should show: hr-employee → hr-manager
SELECT 
  s.submitted_by,
  a.assigned_to
FROM submissions s
JOIN approval_steps a ON s.id = a.submission_id
WHERE s.submitted_by = 'hr-employee@company.com'
ORDER BY s.submitted_at DESC
LIMIT 1;
```

---

## Issues Encountered and Resolutions

### Issue 1: Type Conflict Between AuthRequest and Express.Request
**Problem:** auth.middleware.ts defined AuthRequest interface, but we needed to extend Express.Request globally for MockUser

**Resolution:**
- Kept existing AuthRequest interface for internal auth
- Added separate global Express.Request extension for MockUser
- Used `req.user?.email || req.user?.preferred_username` fallback in submission.routes.ts

### Issue 2: UserSelector Not Showing Current User
**Problem:** Initial implementation didn't show selected user name

**Resolution:**
- Added displayName to UserSelector button text
- Show "Select User" when no user is authenticated
- Updated styling to match LaunchpadPage profile section

### Issue 3: Approval Steps Hardcoded to "managers"
**Problem:** Original createApprovalSteps() used hardcoded 'managers' string

**Resolution:**
- Modified function signature to accept submittedBy parameter
- Added logic to find submitter's manager using mockUsers helpers
- Set assigned_to = manager?.email || 'unassigned'
- Added logging for debugging

### Issue 4: Docker Not Available in Environment
**Problem:** Cannot run `docker compose up --build` from within container

**Resolution:**
- Documented rebuild instructions for user to run manually
- All code changes are complete and ready for rebuild
- Testing instructions provided for post-rebuild verification

---

## Screenshots / Testing Evidence

### cURL Test Example
```bash
# Test /me endpoint
curl -H "X-Mock-User: hr-employee" http://localhost:3001/api/v1/auth/me

# Test submission as hr-employee
curl -X POST http://localhost:3001/api/v1/forms/emp-loan/submissions \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: hr-employee" \
  -d '{
    "data": {
      "amount": "5000",
      "purpose": "Emergency expense"
    }
  }'

# Verify database
docker exec -it apex-db-1 psql -U postgres -d apex -c \
  "SELECT submitted_by, workflow_status FROM submissions ORDER BY submitted_at DESC LIMIT 1;"

docker exec -it apex-db-1 psql -U postgres -d apex -c \
  "SELECT assigned_to FROM approval_steps WHERE submission_id IN (SELECT id FROM submissions ORDER BY submitted_at DESC LIMIT 1);"
```

Expected Results:
- First query: `submitted_by = hr-employee@company.com`
- Second query: `assigned_to = hr-manager@company.com`

---

## Future Considerations

### Keycloak Migration Path
When migrating to Keycloak:

1. **Frontend:**
   - Replace localStorage with Keycloak session
   - Replace UserSelector with Keycloak login/logout
   - Replace X-Mock-User header with Authorization: Bearer <JWT>
   - Keep AuthContext structure, just change implementation

2. **Backend:**
   - Replace mockAuthMiddleware with JWT validation middleware
   - Parse user info from JWT claims
   - Replace mockUsers data with user sync service / database
   - Keep req.user interface compatible

3. **Database:**
   - submitted_by and assigned_to remain email addresses
   - Approval logic remains the same
   - Add user_id column for Keycloak user ID

### Security Notes
- Mock auth is DEVELOPMENT ONLY
- X-Mock-User header is trusted without validation
- Remove mockAuthMiddleware before production
- Replace with proper JWT validation
- Never expose /auth/users endpoint in production

---

## Implementation Complete ✓

All 13 steps from PHASE19A-MOCK-AUTHENTICATION.md have been successfully implemented. The system is ready for testing after container rebuild.

**Next Steps for User:**
1. Run `docker compose down && docker compose up --build -d`
2. Test user selection in UI
3. Submit a form as hr-employee
4. Verify database shows correct submitted_by and assigned_to values
5. Test other user combinations (it-employee, finance-employee, etc.)
