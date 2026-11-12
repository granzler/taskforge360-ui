/**
 * Security headers shared by next.config.ts and the pre-push OWASP check.
 *
 * Keep this file dependency-free: next.config.ts imports it at build time and
 * scripts/security-check.mts imports it with Node's native TypeScript support.
 */

const isProduction = process.env.NODE_ENV === "production";

function contentSecurityPolicy(production) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7157/";
  const keycloakIssuer =
    process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/taskforge360";

  const connectSrc = ["'self'", apiUrl, keycloakIssuer];
  if (!production) {
    // Turbopack HMR uses a WebSocket connection.
    connectSrc.push("ws:", "wss:");
  }

  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (!production) {
    // React/Turbopack use eval for development diagnostics.
    scriptSrc.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];

  if (production) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy(isProduction),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
