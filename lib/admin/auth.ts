/**
 * VIXUAL - Admin Authentication & Authorization Middleware
 */

import { PATRON_EMAIL, AdminRole, ROLE_PERMISSIONS, Permission } from './roles';

export interface AdminSession {
  adminId: string;
  email: string;
  role: AdminRole;
  isPatron: boolean;
  twoFactorVerified: boolean;
  sessionToken: string;
  expiresAt: Date;
  ipAddress: string;
  trustedDevice: boolean;
}

export class AdminAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export function verifyAdminRole(role: AdminRole, requiredPermission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(requiredPermission) ?? false;
}

export function verifyAdminAction(
  adminRole: AdminRole,
  action: string,
  targetRole?: AdminRole,
): boolean {
  // ADMIN can do anything
  if (adminRole === 'admin') return true;

  // ADMIN-ADJOINT can't modify system rules or access Stripe
  if (adminRole === 'admin_adjoint' && ['modify_rules', 'access_stripe'].includes(action)) {
    return false;
  }

  // ADMIN-ADJOINT can't delete accounts
  if (adminRole === 'admin_adjoint' && action === 'delete_account') {
    return false;
  }

  // MODERATOR has limited permissions
  if (adminRole === 'moderator' && !['block_content', 'warn_user'].includes(action)) {
    return false;
  }

  // SUPPORT has only warning permission
  if (adminRole === 'support' && action !== 'warn_user') {
    return false;
  }

  return true;
}

export function enforceAdminSecurity(session: AdminSession): void {
  // Check session expiry
  if (new Date() > session.expiresAt) {
    throw new AdminAuthError('Admin session expired', 'SESSION_EXPIRED');
  }

  // PATRON requires 2FA
  if (session.isPatron && !session.twoFactorVerified) {
    throw new AdminAuthError('2FA required for PATRON', '2FA_REQUIRED');
  }

  // ADMIN-ADJOINT requires 2FA
  if (session.role === 'admin_adjoint' && !session.twoFactorVerified) {
    throw new AdminAuthError('2FA required for ADMIN-ADJOINT', '2FA_REQUIRED');
  }
}

export function canCreateSubordinate(creatorRole: AdminRole, targetRole: AdminRole): boolean {
  // Only ADMIN can create other admins
  if (creatorRole !== 'admin') return false;
  
  // ADMIN can create: ADMIN-ADJOINT, MODERATOR, SUPPORT
  return ['admin_adjoint', 'moderator', 'support'].includes(targetRole);
}

export function getInitialPermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
