import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextRequest } from "next/server";

const REQUIRED_AUTH_ENV = [
  "NEXTAUTH_SECRET",
  "KEYCLOAK_ID",
  "KEYCLOAK_SECRET",
  "KEYCLOAK_ISSUER",
] as const;

/**
 * Fail closed when production is missing the auth secrets. Running this per
 * request (instead of at module load) keeps `next build` working in CI images
 * that only inject secrets at runtime.
 */
function assertAuthEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing = REQUIRED_AUTH_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required auth environment variables: ${missing.join(", ")}`
    );
  }
}

/** Subset of the Keycloak access-token claims consumed by the JWT callback. */
interface KeycloakClaims {
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  scope?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] } | undefined>;
}

/** Profile fields Keycloak adds to the OIDC user on top of next-auth's User. */
interface KeycloakUserProfile {
  name?: string | null;
  preferred_username?: string | null;
}

function decodeJwt(token: string): KeycloakClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as KeycloakClaims;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export const authOptions: AuthOptions = {
  // Force the __Secure- cookie prefix in production instead of inferring it
  // from NEXTAUTH_URL.
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: "openid profile email",
          prompt: "consent",
          max_age: 28800,
        }
      },
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Show errors on the login page
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        const accessToken = account.access_token;
        const idToken = account.id_token;
        const decoded = accessToken ? decodeJwt(accessToken) : null;
        const clientId = process.env.KEYCLOAK_ID || 'taskforge360-client';
        const profile = user as KeycloakUserProfile;

        // Extract realm roles and client roles to cover both configurations
        const realmRoles = decoded?.realm_access?.roles || [];
        const clientRoles = decoded?.resource_access?.[clientId]?.roles || [];
        const roles = Array.from(new Set([...realmRoles, ...clientRoles]));

        // Extract OIDC scopes (usually space-separated)
        const scopes = decoded?.scope?.split(' ') || [];

        return {
          ...token,
          accessToken,
          idToken,
          id: user.id,
          username: profile.preferred_username || user.name || undefined,
          name: profile.name
            || decoded?.name
            || (decoded?.given_name && decoded?.family_name
                ? `${decoded.given_name} ${decoded.family_name}`
                : null)
            || decoded?.given_name
            || decoded?.preferred_username
            || profile.preferred_username
            || undefined,
          roles,
          scopes,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.name = token.name as string;
      session.user.roles = (token.roles as string[]) || [];
      session.user.scopes = (token.scopes as string[]) || [];

      // Construct Keycloak logout URL on the server side
      const keycloakIssuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/taskforge360';
      const keycloakClientId = process.env.KEYCLOAK_ID || 'taskforge360-client';
      const idToken = token.idToken as string;

      let logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout`;
      if (idToken) {
        logoutUrl += `?id_token_hint=${idToken}`;
      } else {
        logoutUrl += `?client_id=${keycloakClientId}`;
      }
      session.logoutUrl = logoutUrl;

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
};

const nextAuthHandler = NextAuth(authOptions);

type AuthRouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(request: NextRequest, context: AuthRouteContext) {
  assertAuthEnv();
  return nextAuthHandler(request, context);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  assertAuthEnv();
  return nextAuthHandler(request, context);
}
