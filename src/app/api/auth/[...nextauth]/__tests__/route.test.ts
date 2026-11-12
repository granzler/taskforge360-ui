import { afterEach, describe, expect, it } from "vitest";
import { authOptions } from "../route";

type JwtCallback = NonNullable<NonNullable<typeof authOptions.callbacks>["jwt"]>;

/** Builds a JWT-shaped string whose payload is the given Keycloak claims. */
function encodeClaims(claims: Record<string, unknown>) {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64");
  return `header.${payload}.signature`;
}

async function runJwtCallback(options: {
  claims?: Record<string, unknown>;
  user?: Record<string, unknown>;
}) {
  const callback = authOptions.callbacks?.jwt as JwtCallback;

  return callback({
    token: { sub: "user-1" },
    user: options.user,
    account: {
      provider: "keycloak",
      type: "oidc",
      providerAccountId: "user-1",
      access_token: options.claims ? encodeClaims(options.claims) : undefined,
      id_token: "id-token",
    },
    trigger: "signIn",
  } as unknown as Parameters<JwtCallback>[0]);
}

afterEach(() => {
  delete process.env.KEYCLOAK_ID;
});

describe("authOptions.callbacks.jwt", () => {
  it("reads name, roles and scopes from the Keycloak claims", async () => {
    process.env.KEYCLOAK_ID = "taskforge360-client";

    const token = await runJwtCallback({
      claims: {
        name: "Ana Pérez",
        scope: "openid profile email",
        realm_access: { roles: ["admin", "user"] },
        resource_access: {
          "taskforge360-client": { roles: ["user", "editor"] },
        },
      },
      user: { id: "user-1", preferred_username: "aperez" },
    });

    expect(token.name).toBe("Ana Pérez");
    expect(token.username).toBe("aperez");
    expect(token.roles).toEqual(["admin", "user", "editor"]);
    expect(token.scopes).toEqual(["openid", "profile", "email"]);
  });

  it("composes the name from given_name and family_name", async () => {
    const token = await runJwtCallback({
      claims: { given_name: "Ana", family_name: "Pérez" },
      user: { id: "user-1", preferred_username: "aperez" },
    });

    expect(token.name).toBe("Ana Pérez");
  });

  it("falls back to preferred_username when no name claim exists", async () => {
    const token = await runJwtCallback({
      claims: { preferred_username: "aperez" },
      user: { id: "user-1" },
    });

    expect(token.name).toBe("aperez");
  });
});
