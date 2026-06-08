import { Session } from 'next-auth';

/**
 * Checks if the user session has a specific role.
 */
export function hasRole(session: Session | null | undefined, roleName: string): boolean {
  if (!session?.user?.roles) return false;
  return session.user.roles.includes(roleName);
}

/**
 * Checks if the user session has a specific scope.
 */
export function hasScope(session: Session | null | undefined, scopeName: string): boolean {
  if (!session?.user?.scopes) return false;
  return session.user.scopes.includes(scopeName);
}

/**
 * Checks if the user session has any of the specified roles.
 */
export function hasAnyRole(session: Session | null | undefined, roleNames: string[]): boolean {
  if (!session?.user?.roles) return false;
  return roleNames.some(role => session.user.roles?.includes(role));
}

/**
 * Checks if the user session has any of the specified scopes.
 */
export function hasAnyScope(session: Session | null | undefined, scopeNames: string[]): boolean {
  if (!session?.user?.scopes) return false;
  return scopeNames.some(scope => session.user.scopes?.includes(scope));
}
