import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: "taskforge360-client",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: "http://localhost:8080/realms/taskforge360",
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
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as any;
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