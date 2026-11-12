/**
 * OWASP Top 10 pre-push gate.
 *
 * Runs Semgrep, npm audit and a set of repository-specific checks, writes a
 * machine-readable report to .security/report.json and exits non-zero when any
 * blocking check fails. The verify-before-push plugin runs this before every
 * `git push` issued from OpenCode.
 *
 * Run manually with: npm run security
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { SECURITY_HEADERS } from "../src/config/security-headers.mjs";

const ROOT = process.cwd();
const REPORT_DIR = join(ROOT, ".security");
const REPORT_JSON = join(REPORT_DIR, "report.json");
const SARIF_FILE = join(REPORT_DIR, "report.sarif");

type Severity = "ERROR" | "WARNING" | "INFO";
type Status = "PASS" | "FAIL" | "WARN" | "MANUAL";

interface Finding {
  category: string;
  ruleId: string;
  severity: Severity;
  file: string;
  line: number;
  message: string;
  source: "semgrep" | "audit" | "repo-check";
  verdict: "pending";
}

interface Check {
  category: string;
  name: string;
  status: Status;
  detail: string;
  blocking: boolean;
}

interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

interface SarifResult {
  ruleId?: string;
  level?: string;
  message?: { text?: string };
  properties?: { owasp?: unknown };
  locations?: Array<{
    physicalLocation?: {
      artifactLocation?: { uri?: string };
      region?: { startLine?: number };
    };
  }>;
}

interface SarifRule {
  id?: string;
  properties?: { owasp?: unknown };
}

interface SarifLog {
  runs?: Array<{
    tool?: { driver?: { rules?: SarifRule[] } };
    results?: SarifResult[];
  }>;
}

interface AuditReport {
  metadata?: { vulnerabilities?: Record<string, number> };
  vulnerabilities?: Record<
    string,
    { severity?: string; via?: Array<string | { title?: string }> }
  >;
}

const findings: Finding[] = [];
const checks: Check[] = [];

function run(
  command: string,
  args: string[],
  options: { timeout?: number } = {}
): RunResult {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: options.timeout ?? 120_000,
    maxBuffer: 32 * 1024 * 1024,
  });

  return {
    status: result.status,
    stdout: String(result.stdout ?? ""),
    stderr: String(result.stderr ?? ""),
    error: result.error,
  };
}

function addCheck(check: Check) {
  checks.push(check);
}

function addFinding(finding: Finding) {
  findings.push(finding);
}

function walk(
  dir: string,
  predicate: (path: string) => boolean,
  out: string[] = []
): string[] {
  if (!existsSync(dir)) return out;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      ["node_modules", ".next", "coverage", "__tests__", "test"].includes(
        entry.name
      )
    ) {
      continue;
    }

    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }

  return out;
}

function relativePath(path: string) {
  return relative(ROOT, path) || path;
}

function extractOwaspCategory(metadata: unknown): string | undefined {
  if (!Array.isArray(metadata)) return undefined;

  for (const entry of metadata) {
    if (typeof entry !== "string") continue;
    const match = entry.match(/A(\d{2})/);
    if (match) return `A${match[1]}`;
  }

  return undefined;
}

function mapSarifLevel(level: string | undefined): Severity {
  if (level === "error") return "ERROR";
  if (level === "warning") return "WARNING";
  return "INFO";
}

function checkSemgrep(): void {
  const version = run("semgrep", ["--version"]);
  if (version.error || version.status !== 0) {
    addCheck({
      category: "A06",
      name: "Semgrep installation",
      status: "FAIL",
      detail: "semgrep is not installed. Run: pipx install semgrep",
      blocking: true,
    });
    return;
  }

  const result = run(
    "semgrep",
    [
      "scan",
      "--config",
      "p/owasp-top-ten",
      "--config",
      "p/default",
      "--config",
      "p/secrets",
      "--config",
      "p/typescript",
      "--config",
      "p/react",
      "--severity",
      "ERROR",
      "--severity",
      "WARNING",
      "--metrics=off",
      "--disable-version-check",
      "--sarif",
      "--output",
      SARIF_FILE,
      ".",
    ],
    { timeout: 300_000 }
  );

  if (!existsSync(SARIF_FILE)) {
    addCheck({
      category: "A03",
      name: "Semgrep OWASP scan",
      status: "FAIL",
      detail: `Semgrep did not produce a report: ${result.stderr.trim() || "unknown error"}`,
      blocking: true,
    });
    return;
  }

  const sarif = JSON.parse(readFileSync(SARIF_FILE, "utf8")) as SarifLog;
  const runData = sarif.runs?.[0];
  const rules = new Map<string, SarifRule>();
  for (const rule of runData?.tool?.driver?.rules ?? []) {
    if (rule.id) rules.set(rule.id, rule);
  }

  let total = 0;
  let blocking = 0;
  for (const resultItem of runData?.results ?? []) {
    const ruleId = resultItem.ruleId ?? "unknown";
    const rule = rules.get(ruleId);
    const category =
      extractOwaspCategory(rule?.properties?.owasp) ??
      extractOwaspCategory(resultItem.properties?.owasp) ??
      "A03";
    const location = resultItem.locations?.[0]?.physicalLocation;
    const severity = mapSarifLevel(resultItem.level);

    addFinding({
      category,
      ruleId,
      severity,
      file: location?.artifactLocation?.uri ?? "unknown",
      line: location?.region?.startLine ?? 0,
      message: resultItem.message?.text ?? "Semgrep finding",
      source: "semgrep",
      verdict: "pending",
    });
    total += 1;
    if (severity !== "INFO") blocking += 1;
  }

  addCheck({
    category: "A03",
    name: "Semgrep OWASP scan",
    status: blocking === 0 ? "PASS" : "FAIL",
    detail:
      blocking === 0
        ? `No blocking findings in p/owasp-top-ten, p/default, p/secrets, p/typescript, p/react (${total} informational)`
        : `${blocking} blocking finding(s), ${total} total. See .security/report.json`,
    blocking: true,
  });
}

function checkDependencies(): void {
  const result = run("npm", [
    "audit",
    "--omit=dev",
    "--audit-level=high",
    "--json",
  ]);

  let report: AuditReport;
  try {
    report = JSON.parse(result.stdout) as AuditReport;
  } catch {
    addCheck({
      category: "A06",
      name: "Runtime dependency audit",
      status: "FAIL",
      detail: `npm audit did not return JSON: ${result.stderr.trim() || "network or lockfile error"}`,
      blocking: true,
    });
    return;
  }

  const counts = report.metadata?.vulnerabilities ?? {};
  const blocking = (counts.high ?? 0) + (counts.critical ?? 0);

  for (const [name, vulnerability] of Object.entries(
    report.vulnerabilities ?? {}
  )) {
    const severity = vulnerability.severity;
    if (severity !== "high" && severity !== "critical") continue;

    addFinding({
      category: "A06",
      ruleId: `npm-audit:${name}`,
      severity: severity === "critical" ? "ERROR" : "WARNING",
      file: "package-lock.json",
      line: 0,
      message: `Vulnerable runtime dependency: ${name}`,
      source: "audit",
      verdict: "pending",
    });
  }

  addCheck({
    category: "A06",
    name: "Runtime dependency audit",
    status: blocking === 0 ? "PASS" : "FAIL",
    detail:
      blocking === 0
        ? "No high/critical vulnerabilities in production dependencies"
        : `${blocking} high/critical vulnerability(ies) in production dependencies`,
    blocking: true,
  });
}

function checkRouteProtection(): void {
  const appDir = join(ROOT, "src/app");
  const proxyPath = join(ROOT, "src/proxy.ts");

  if (!existsSync(appDir) || !existsSync(proxyPath)) {
    addCheck({
      category: "A01",
      name: "Route protection",
      status: "FAIL",
      detail: "src/app or src/proxy.ts is missing",
      blocking: true,
    });
    return;
  }

  const proxy = readFileSync(proxyPath, "utf8");
  const matcherBlock = proxy.match(/matcher:\s*\[([\s\S]*?)\]/);
  const matcherBases = matcherBlock
    ? Array.from(matcherBlock[1].matchAll(/"([^"]+)"/g), (match) =>
        match[1].replace(/\/:path\*$/, "")
      )
    : [];

  const publicRoutes = new Set(["/", "/login", "/unauthorized"]);
  const routes: string[] = [];

  if (existsSync(join(appDir, "page.tsx"))) routes.push("/");

  for (const entry of readdirSync(appDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;

    if (entry.name === "api") {
      const apiRoutes = readdirSync(join(appDir, "api"), {
        withFileTypes: true,
      })
        .filter((apiEntry) => apiEntry.isDirectory())
        .map((apiEntry) => `/api/${apiEntry.name}`);

      for (const apiRoute of apiRoutes) {
        if (apiRoute !== "/api/auth") routes.push(apiRoute);
      }
      continue;
    }

    routes.push(`/${entry.name}`);
  }

  const unprotected = routes.filter((route) => {
    if (publicRoutes.has(route)) return false;
    return !matcherBases.some(
      (base) => route === base || route.startsWith(`${base}/`)
    );
  });

  for (const route of unprotected) {
    addFinding({
      category: "A01",
      ruleId: "repo:unprotected-route",
      severity: "ERROR",
      file: "src/proxy.ts",
      line: 0,
      message: `Route ${route} is not covered by config.matcher`,
      source: "repo-check",
      verdict: "pending",
    });
  }

  addCheck({
    category: "A01",
    name: "Route protection",
    status: unprotected.length === 0 ? "PASS" : "FAIL",
    detail:
      unprotected.length === 0
        ? `All app routes are protected or explicitly public (${matcherBases.join(", ")})`
        : `Unprotected routes: ${unprotected.join(", ")}`,
    blocking: true,
  });
}

const SECRET_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  {
    id: "private-key",
    pattern: /-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/,
  },
  { id: "aws-access-key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "github-token", pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { id: "openai-key", pattern: /\bsk-[A-Za-z0-9]{20,}\b/ },
  {
    id: "hardcoded-secret",
    pattern:
      /(NEXTAUTH_SECRET|KEYCLOAK_SECRET|CLIENT_SECRET|API_KEY|PASSWORD)\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}/,
  },
];

function getDiffBase(): string | null {
  const upstream = run("git", [
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{u}",
  ]);
  if (upstream.status === 0 && upstream.stdout.trim()) {
    return upstream.stdout.trim();
  }

  const mergeBase = run("git", ["merge-base", "origin/HEAD", "HEAD"]);
  if (mergeBase.status === 0 && mergeBase.stdout.trim()) {
    return mergeBase.stdout.trim();
  }

  const parent = run("git", ["rev-parse", "--verify", "HEAD~1"]);
  if (parent.status === 0 && parent.stdout.trim()) {
    return parent.stdout.trim();
  }

  return null;
}

function checkSecrets(): void {
  const tracked = run("git", ["ls-files"]);
  const trackedEnv =
    tracked.status === 0
      ? tracked.stdout
          .split("\n")
          .filter(
            (file) =>
              /(^|\/)\.env($|\.)/.test(file) && !file.endsWith(".env.example")
          )
      : [];

  for (const file of trackedEnv) {
    addFinding({
      category: "A02",
      ruleId: "repo:tracked-env-file",
      severity: "ERROR",
      file,
      line: 0,
      message: "Environment file is tracked by git",
      source: "repo-check",
      verdict: "pending",
    });
  }

  const staged = run("git", ["diff", "--cached", "--name-only"]);
  const stagedEnv =
    staged.status === 0
      ? staged.stdout
          .split("\n")
          .filter((file) => /(^|\/)\.env($|\.)/.test(file))
      : [];

  for (const file of stagedEnv) {
    addFinding({
      category: "A02",
      ruleId: "repo:staged-env-file",
      severity: "ERROR",
      file,
      line: 0,
      message: "Environment file is staged for commit",
      source: "repo-check",
      verdict: "pending",
    });
  }

  const base = getDiffBase();
  if (base) {
    const diff = run("git", ["diff", "--unified=0", `${base}..HEAD`]);
    let currentFile = "pushed-diff";
    let currentLine = 0;

    for (const line of diff.stdout.split("\n")) {
      if (line.startsWith("+++ b/")) {
        currentFile = line.slice(6);
        continue;
      }

      const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (hunk) {
        currentLine = Number(hunk[1]);
        continue;
      }

      if (line.startsWith("+") && !line.startsWith("+++")) {
        const content = line.slice(1);
        for (const secret of SECRET_PATTERNS) {
          if (secret.pattern.test(content)) {
            addFinding({
              category: "A02",
              ruleId: `repo:secret-${secret.id}`,
              severity: "ERROR",
              file: currentFile,
              line: currentLine,
              message: `Possible secret in pushed diff (${secret.id})`,
              source: "repo-check",
              verdict: "pending",
            });
          }
        }
        currentLine += 1;
      } else if (line.startsWith(" ")) {
        currentLine += 1;
      }
    }
  }

  const sourceFiles = walk(
    join(ROOT, "src"),
    (path) => path.endsWith(".ts") || path.endsWith(".tsx")
  );
  for (const file of sourceFiles) {
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|KEY)/.test(line)) {
        addFinding({
          category: "A02",
          ruleId: "repo:public-secret-env",
          severity: "ERROR",
          file: relativePath(file),
          line: index + 1,
          message: "Sensitive value exposed through a NEXT_PUBLIC_ variable",
          source: "repo-check",
          verdict: "pending",
        });
      }
    });
  }

  const secretFindings = findings.filter((finding) => finding.category === "A02");
  addCheck({
    category: "A02",
    name: "Secret exposure",
    status: secretFindings.length === 0 ? "PASS" : "FAIL",
    detail:
      secretFindings.length === 0
        ? "No tracked .env files or secrets in the pushed diff"
        : `${secretFindings.length} secret exposure(s) detected`,
    blocking: true,
  });
}

const INJECTION_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: "dangerously-set-inner-html", pattern: /dangerouslySetInnerHTML/ },
  { id: "eval", pattern: /\beval\s*\(/ },
  { id: "new-function", pattern: /\bnew\s+Function\s*\(/ },
  { id: "inner-html", pattern: /\.innerHTML\s*=/ },
  { id: "document-write", pattern: /\bdocument\.write\s*\(/ },
];

function checkInjectionSinks(): void {
  const sourceFiles = walk(
    join(ROOT, "src"),
    (path) => path.endsWith(".ts") || path.endsWith(".tsx")
  );

  let count = 0;
  for (const file of sourceFiles) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const pattern of INJECTION_PATTERNS) {
        if (!pattern.pattern.test(line)) continue;

        addFinding({
          category: "A03",
          ruleId: `repo:${pattern.id}`,
          severity: "ERROR",
          file: relativePath(file),
          line: index + 1,
          message: `Potential injection/XSS sink: ${pattern.id}`,
          source: "repo-check",
          verdict: "pending",
        });
        count += 1;
      }
    });
  }

  addCheck({
    category: "A03",
    name: "Injection sinks",
    status: count === 0 ? "PASS" : "FAIL",
    detail:
      count === 0
        ? "No eval, innerHTML, document.write or dangerouslySetInnerHTML"
        : `${count} injection sink(s) detected`,
    blocking: true,
  });
}

function checkSecurityHeaders(): void {
  const configPath = join(ROOT, "next.config.ts");
  const config = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
  const required = [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
  ];
  const present = new Set(SECURITY_HEADERS.map((header) => header.key));
  const missing = required.filter((key) => !present.has(key));
  const wired =
    /async\s+headers\s*\(/.test(config) && config.includes("SECURITY_HEADERS");

  addCheck({
    category: "A05",
    name: "Security headers",
    status: missing.length === 0 && wired ? "PASS" : "FAIL",
    detail:
      missing.length === 0 && wired
        ? `${required.length} headers configured for all routes`
        : `Missing headers: ${missing.join(", ") || "none"}; wired in next.config.ts: ${wired}`,
    blocking: true,
  });
}

function checkAuthConfiguration(): void {
  const routePath = join(ROOT, "src/app/api/auth/[...nextauth]/route.ts");
  const content = existsSync(routePath)
    ? readFileSync(routePath, "utf8")
    : "";
  const secureCookies = /useSecureCookies\s*:/.test(content);
  const envValidation =
    /NEXTAUTH_SECRET/.test(content) && /Missing required auth environment/.test(content);

  addCheck({
    category: "A07",
    name: "Auth configuration",
    status: secureCookies && envValidation ? "PASS" : "FAIL",
    detail:
      secureCookies && envValidation
        ? "Secure cookies forced in production and required env vars validated"
        : `useSecureCookies: ${secureCookies}; env validation: ${envValidation}`,
    blocking: true,
  });
}

function checkSupplyChain(): void {
  const lockfile = run("git", ["ls-files", "package-lock.json"]);
  const lockfileTracked = lockfile.stdout.trim() === "package-lock.json";

  const installScripts = run("npm", ["install-scripts", "ls"]);
  const installScriptsClean =
    installScripts.status === 0 &&
    /No packages with unreviewed install scripts/.test(installScripts.stdout);
  const installScriptsSupported =
    installScripts.status === 0 && !/Unknown command/i.test(installScripts.stderr);

  const failed = !lockfileTracked || (installScriptsSupported && !installScriptsClean);

  addCheck({
    category: "A08",
    name: "Supply chain integrity",
    status: failed ? "FAIL" : installScriptsSupported ? "PASS" : "WARN",
    detail: !lockfileTracked
      ? "package-lock.json is not tracked"
      : installScriptsSupported
        ? installScriptsClean
          ? "Lockfile tracked; no unreviewed install scripts"
          : "Unreviewed npm install scripts detected"
        : "Lockfile tracked; npm install-scripts not available",
    blocking: true,
  });
}

function printReport() {
  const rows = checks.map((check) => ({
    category: check.category,
    status: check.status,
    name: check.name,
    detail: check.detail,
  }));

  console.log("\nSecurity check — OWASP Top 10\n");
  for (const row of rows) {
    console.log(
      `${row.category}  ${row.status.padEnd(6)}  ${row.name}: ${row.detail}`
    );
  }

  if (findings.length > 0) {
    console.log("\nFindings:");
    for (const finding of findings.slice(0, 50)) {
      const location = finding.line
        ? `${finding.file}:${finding.line}`
        : finding.file;
      console.log(
        `  [${finding.category}] ${finding.ruleId} (${finding.severity}) at ${location}`
      );
      console.log(`    ${finding.message}`);
    }
    if (findings.length > 50) {
      console.log(`  ... and ${findings.length - 50} more`);
    }
  }

  console.log(`\nFull report: ${relativePath(REPORT_JSON)}`);
}

function main() {
  mkdirSync(REPORT_DIR, { recursive: true });

  console.log("Running Semgrep OWASP scan...");
  checkSemgrep();

  console.log("Auditing runtime dependencies...");
  checkDependencies();

  console.log("Checking access control, secrets, injection, headers and auth...");
  checkRouteProtection();
  checkSecrets();
  checkInjectionSinks();
  checkSecurityHeaders();
  checkAuthConfiguration();
  checkSupplyChain();

  addCheck({
    category: "A04",
    name: "Insecure design",
    status: "MANUAL",
    detail: "Requires threat modeling and abuse-case review",
    blocking: false,
  });
  addCheck({
    category: "A09",
    name: "Security logging",
    status: "MANUAL",
    detail: "Requires reviewing auth and admin event logging",
    blocking: false,
  });
  addCheck({
    category: "A10",
    name: "SSRF",
    status: "MANUAL",
    detail: "No server-side fetch of user-supplied URLs; Semgrep reports SSRF rules",
    blocking: false,
  });

  const blockingFindings = findings.filter(
    (finding) => finding.severity === "ERROR" || finding.severity === "WARNING"
  );
  const failedChecks = checks.filter(
    (check) => check.blocking && check.status === "FAIL"
  );
  const ok = blockingFindings.length === 0 && failedChecks.length === 0;

  writeFileSync(
    REPORT_JSON,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        ok,
        checks,
        findings,
      },
      null,
      2
    )}\n`
  );

  printReport();

  if (!ok) {
    console.error(
      "\nSecurity gate failed. Load skill 'security-triage' and resolve .security/report.json before pushing."
    );
    process.exit(1);
  }

  console.log("\nSecurity gate passed.");
}

main();
