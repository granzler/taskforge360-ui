import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export const authOptions: AuthOptions = {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          username: (user as any).preferred_username || user.name,
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };