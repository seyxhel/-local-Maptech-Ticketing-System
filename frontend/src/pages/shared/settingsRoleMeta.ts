export type RoleMeta = {
  subtitle: string;
  department: string;
  roleLabel: string;
};

const ROLE_META: Record<string, RoleMeta> = {
  superadmin: {
    subtitle: 'Manage your super admin account settings',
    department: 'Administration',
    roleLabel: 'Super Administrator',
  },
  admin: {
    subtitle: 'Manage your supervisor account settings',
    department: 'Administration',
    roleLabel: 'Supervisor',
  },
  sales: {
    subtitle: 'Manage your sales account settings',
    department: 'Sales',
    roleLabel: 'Sales Representative',
  },
  employee: {
    subtitle: 'Manage your account settings',
    department: 'Technical Support',
    roleLabel: 'Technical Staff',
  },
};

const DEFAULT_ROLE_META: RoleMeta = {
  subtitle: 'Manage your account settings',
  department: 'General',
  roleLabel: 'User',
};

export function getRoleMeta(role?: string): RoleMeta {
  if (!role) return DEFAULT_ROLE_META;
  return ROLE_META[role] || DEFAULT_ROLE_META;
}
