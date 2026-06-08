import { useSession } from 'next-auth/react';
import { hasRole, hasScope, hasAnyRole, hasAnyScope } from '../utils/authUtils';

/**
 * Hook to reactively check user permissions (roles/scopes) from the session.
 */
export function usePermission() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    roles: session?.user?.roles || [],
    scopes: session?.user?.scopes || [],
    hasRole: (roleName: string) => hasRole(session, roleName),
    hasScope: (scopeName: string) => hasScope(session, scopeName),
    hasAnyRole: (roleNames: string[]) => hasAnyRole(session, roleNames),
    hasAnyScope: (scopeNames: string[]) => hasAnyScope(session, scopeNames),
  };
}
