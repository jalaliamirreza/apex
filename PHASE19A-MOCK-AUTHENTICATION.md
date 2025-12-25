# Phase 19A: Mock Authentication System

## Purpose

Enable development and testing of user-specific features (My Tasks, My Submissions) without full Keycloak integration. This is a **development-only** feature that will be replaced by Keycloak in production.

---

## Mock Users

### Org Structure

```
                         ┌─────────────┐
                         │  director   │
                         │ (مدیر ارشد)  │
                         └──────┬──────┘
              ┌─────────────────┼─────────────────┐
              │                 │                 │
       ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
       │ hr-manager  │   │ it-manager  │   │finance-mgr  │
       │ (مدیر HR)   │   │  (مدیر IT)  │   │ (مدیر مالی) │
       └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
              │                 │                 │
       ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
       │ hr-employee │   │ it-employee │   │finance-emp  │
       │(کارمند HR)  │   │ (کارمند IT) │   │(کارمند مالی)│
       └─────────────┘   └─────────────┘   └─────────────┘

       ┌─────────────┐
       │   admin     │  ← Outside org chart (system admin)
       │(مدیر سیستم) │
       └─────────────┘
```

### User Data

```typescript
// frontend/src/data/mockUsers.ts
// backend/src/data/mockUsers.ts (same file)

export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  displayName_fa: string;
  email: string;
  roles: string[];
  department: string | null;
  managerId: string | null;
}

export const MOCK_USERS: MockUser[] = [
  // ============ EMPLOYEES ============
  {
    id: 'emp-hr-1',
    username: 'hr-employee',
    displayName: 'HR Employee',
    displayName_fa: 'کارمند منابع انسانی',
    email: 'hr-employee@company.com',
    roles: ['employee'],
    department: 'HR',
    managerId: 'mgr-hr',
  },
  {
    id: 'emp-it-1',
    username: 'it-employee',
    displayName: 'IT Employee',
    displayName_fa: 'کارمند فناوری اطلاعات',
    email: 'it-employee@company.com',
    roles: ['employee'],
    department: 'IT',
    managerId: 'mgr-it',
  },
  {
    id: 'emp-fin-1',
    username: 'finance-employee',
    displayName: 'Finance Employee',
    displayName_fa: 'کارمند مالی',
    email: 'finance-employee@company.com',
    roles: ['employee'],
    department: 'Finance',
    managerId: 'mgr-fin',
  },

  // ============ MANAGERS ============
  {
    id: 'mgr-hr',
    username: 'hr-manager',
    displayName: 'HR Manager',
    displayName_fa: 'مدیر منابع انسانی',
    email: 'hr-manager@company.com',
    roles: ['employee', 'manager'],
    department: 'HR',
    managerId: 'dir-1',
  },
  {
    id: 'mgr-it',
    username: 'it-manager',
    displayName: 'IT Manager',
    displayName_fa: 'مدیر فناوری اطلاعات',
    email: 'it-manager@company.com',
    roles: ['employee', 'manager'],
    department: 'IT',
    managerId: 'dir-1',
  },
  {
    id: 'mgr-fin',
    username: 'finance-manager',
    displayName: 'Finance Manager',
    displayName_fa: 'مدیر مالی',
    email: 'finance-manager@company.com',
    roles: ['employee', 'manager'],
    department: 'Finance',
    managerId: 'dir-1',
  },

  // ============ DIRECTOR ============
  {
    id: 'dir-1',
    username: 'director',
    displayName: 'Director',
    displayName_fa: 'مدیر ارشد',
    email: 'director@company.com',
    roles: ['employee', 'manager', 'director'],
    department: 'Executive',
    managerId: null,
  },

  // ============ SYSTEM ADMIN ============
  {
    id: 'admin-1',
    username: 'admin',
    displayName: 'System Admin',
    displayName_fa: 'مدیر سیستم',
    email: 'admin@company.com',
    roles: ['admin'],
    department: null,
    managerId: null,
  },
];

// Helper functions
export const getUserById = (id: string) => MOCK_USERS.find(u => u.id === id);
export const getUserByUsername = (username: string) => MOCK_USERS.find(u => u.username === username);
export const getUserByEmail = (email: string) => MOCK_USERS.find(u => u.email === email);
export const getManagerOf = (user: MockUser) => user.managerId ? getUserById(user.managerId) : null;
export const getDirectReports = (managerId: string) => MOCK_USERS.filter(u => u.managerId === managerId);
```

### Role Permissions

| Role | Permissions |
|------|-------------|
| `employee` | Submit forms, view own submissions |
| `manager` | Above + view/approve tasks from direct reports |
| `director` | Above + view/approve all tasks (escalation) |
| `admin` | Access admin pages (spaces, tiles, forms management) |

---

## Frontend Implementation

### 1. Auth Context

**File:** `frontend/src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MockUser, MOCK_USERS, getUserByUsername } from '../data/mockUsers';

interface AuthContextType {
  user: MockUser | null;
  login: (username: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'syncro_mock_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY);
    if (savedUsername) {
      const savedUser = getUserByUsername(savedUsername);
      if (savedUser) setUser(savedUser);
    }
  }, []);

  const login = (username: string) => {
    const foundUser = getUserByUsername(username);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, username);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (role: string) => user?.roles.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasRole,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 2. User Selector Component

**File:** `frontend/src/components/UserSelector.tsx`

Dropdown in ShellBar showing current user and allowing switch:

```
┌─────────────────────────────────────────────────────────────────┐
│  SYNCRO                                    👤 hr-employee ▼     │
│                                            ┌─────────────────┐  │
│                                            │ ── Employees ── │  │
│                                            │ hr-employee   ✓ │  │
│                                            │ it-employee     │  │
│                                            │ finance-employee│  │
│                                            │ ── Managers ──  │  │
│                                            │ hr-manager      │  │
│                                            │ it-manager      │  │
│                                            │ finance-manager │  │
│                                            │ ── Directors ── │  │
│                                            │ director        │  │
│                                            │ ── Admin ──     │  │
│                                            │ admin           │  │
│                                            ├─────────────────┤  │
│                                            │ 🚪 Logout       │  │
│                                            └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Use UI5 `Popover` with `List` grouped by role category.

### 3. API Interceptor

**File:** `frontend/src/services/api.ts` (update)

Add interceptor to include user header in all requests:

```typescript
api.interceptors.request.use((config) => {
  const savedUsername = localStorage.getItem('syncro_mock_user');
  if (savedUsername) {
    config.headers['X-Mock-User'] = savedUsername;
  }
  return config;
});
```

### 4. App.tsx Update

Wrap app with AuthProvider:

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          {/* ... routes ... */}
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

---

## Backend Implementation

### 1. Mock Users Data

**File:** `backend/src/data/mockUsers.ts`

Same data as frontend (copy the MOCK_USERS array and helper functions).

### 2. Auth Middleware

**File:** `backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { getUserByUsername, MockUser } from '../data/mockUsers';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: MockUser | null;
    }
  }
}

export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const mockUsername = req.headers['x-mock-user'] as string;
  
  if (mockUsername) {
    req.user = getUserByUsername(mockUsername) || null;
  } else {
    req.user = null;
  }
  
  next();
};

// Optional: Require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Optional: Require specific role
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 3. Register Middleware

**File:** `backend/src/index.ts` (update)

```typescript
import { mockAuthMiddleware } from './middleware/auth.middleware';

// After body parsers, before routes
app.use(mockAuthMiddleware);
```

### 4. Update Submission Service

**File:** `backend/src/services/submission.service.ts` (update)

Update `createSubmission` to use `req.user`:

```typescript
// In route handler:
const submission = await createSubmission(
  formId, 
  data, 
  req.user?.email || 'anonymous'
);
```

Update workflow integration to assign to user's manager:

```typescript
import { getManagerOf, getUserByEmail } from '../data/mockUsers';

// When creating approval step:
const submitter = getUserByEmail(submittedBy);
const manager = submitter ? getManagerOf(submitter) : null;

await createApprovalStep({
  submissionId: submission.id,
  stepName: 'manager_review',
  stepOrder: 1,
  status: 'pending',
  assignedTo: manager?.email || 'unassigned',
});
```

### 5. Auth Info Endpoint (Optional)

**File:** `backend/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { MOCK_USERS } from '../data/mockUsers';

const router = Router();

// GET /api/v1/auth/me - Get current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// GET /api/v1/auth/users - List all mock users (dev only)
router.get('/users', (req, res) => {
  // Return users without sensitive data (if any)
  res.json({ users: MOCK_USERS });
});

export default router;
```

---

## Files Summary

### Create:

| File | Description |
|------|-------------|
| `frontend/src/data/mockUsers.ts` | Mock user data + helpers |
| `frontend/src/contexts/AuthContext.tsx` | Auth state management |
| `frontend/src/components/UserSelector.tsx` | ShellBar user dropdown |
| `backend/src/data/mockUsers.ts` | Same mock user data |
| `backend/src/middleware/auth.middleware.ts` | Parse X-Mock-User header |
| `backend/src/routes/auth.routes.ts` | /me and /users endpoints |

### Modify:

| File | Change |
|------|--------|
| `frontend/src/App.tsx` | Wrap with AuthProvider |
| `frontend/src/services/api.ts` | Add X-Mock-User header interceptor |
| `frontend/src/pages/LaunchpadPage.tsx` | Add UserSelector to ShellBar |
| `backend/src/index.ts` | Register auth middleware |
| `backend/src/routes/index.ts` | Register auth routes |
| `backend/src/services/submission.service.ts` | Use req.user for submitted_by |
| `backend/src/routes/submission.routes.ts` | Pass req.user to service |

---

## Test Checklist

| # | Test | Login As | Expected |
|---|------|----------|----------|
| 1 | User selector shows in ShellBar | - | Dropdown visible |
| 2 | Select user persists on refresh | hr-employee | Still hr-employee after F5 |
| 3 | API includes X-Mock-User header | hr-employee | Check Network tab |
| 4 | Submit form stores correct user | hr-employee | `submitted_by = hr-employee@company.com` |
| 5 | Approval assigned to manager | hr-employee | `assigned_to = hr-manager@company.com` |
| 6 | Backend /me returns user | hr-employee | Returns full user object |
| 7 | Logout clears localStorage | hr-employee → logout | No user selected |

---

## Future: Keycloak Migration

When Keycloak is integrated:

1. Replace `localStorage` with Keycloak session
2. Replace `X-Mock-User` header with `Authorization: Bearer <JWT>`
3. Backend validates JWT instead of trusting header
4. User data comes from JWT claims + user sync service
5. Remove mock user dropdown from ShellBar
6. Add login/logout redirects to Keycloak

---

## Claude Code Prompt

```
Read PHASE18B-MOCK-AUTHENTICATION.md and implement in order:

1. Create frontend/src/data/mockUsers.ts - mock user data with 8 users
2. Create backend/src/data/mockUsers.ts - copy same file
3. Create frontend/src/contexts/AuthContext.tsx - auth state with localStorage
4. Create frontend/src/components/UserSelector.tsx - ShellBar dropdown using UI5 Popover
5. Update frontend/src/App.tsx - wrap with AuthProvider
6. Update frontend/src/services/api.ts - add X-Mock-User header interceptor
7. Update frontend/src/pages/LaunchpadPage.tsx - add UserSelector to ShellBar
8. Create backend/src/middleware/auth.middleware.ts - parse header, attach req.user
9. Create backend/src/routes/auth.routes.ts - /me and /users endpoints
10. Update backend/src/index.ts - register auth middleware before routes
11. Update backend/src/routes/index.ts - register auth routes
12. Update backend/src/services/submission.service.ts - use submitter's manager for assignedTo
13. Rebuild and test: select hr-employee, submit form, check database for correct submitted_by and assigned_to
```
