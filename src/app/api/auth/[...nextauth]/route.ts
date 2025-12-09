import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: "openid profile email",
          // Forzar pantalla de login siempre
          prompt: "login",
          // Asegurar que el usuario esté autenticado
          max_age: 0,
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
        return {
          ...token,
          accessToken: account.access_token,
          id: user.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          username: (user as any).preferred_username || user.name
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.username = token.username as string;
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