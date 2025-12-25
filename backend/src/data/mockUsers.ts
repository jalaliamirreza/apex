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
