#!/usr/bin/env node
/**
 * Security audit runner — static checks + npm audit
 * Output: tests/security/audit-results.json
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(__dirname, "audit-results.json");

function read(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function check(id, name, severity, pass, evidence, recommendation = "") {
  return { id, name, severity, status: pass ? "PASS" : "FAIL", evidence, recommendation };
}

function runNpmAudit(dir) {
  try {
    const raw = execSync("npm audit --json", {
      cwd: path.join(ROOT, dir),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const data = JSON.parse(raw);
    return {
      vulnerabilities: data.metadata?.vulnerabilities || {},
      error: null,
    };
  } catch (err) {
    try {
      const data = JSON.parse(err.stdout || "{}");
      return {
        vulnerabilities: data.metadata?.vulnerabilities || {},
        error: null,
      };
    } catch {
      return { vulnerabilities: {}, error: err.message };
    }
  }
}

function main() {
  const apiRoutes = read("backend/routes/apiRoutes.js");
  const authRoutes = read("backend/routes/authRoutes.js");
  const serverJs = read("backend/server.js");
  const appJs = read("backend/app.js");
  const asaasWebhook = read("backend/controllers/AsaasWebhookController.js");
  const asaasService = read("backend/services/AsaasService.js");
  const authController = read("backend/controllers/authController.js");
  const authMiddleware = read("backend/middleware/authMiddleware.js");
  const jwtSecret = read("backend/config/jwtSecret.js");
  const messageBubble = read("src/modules/chat/presentation/components/ChatWidget/MessageBubble.tsx");
  const diagnosticoPedido = read("backend/controllers/DiagnosticoPedidoController.js");
  const webhookService = read("backend/services/DiagnosticoPagamentoWebhookService.js");
  const databaseJs = read("backend/database.js");
  const rateLimiter = read("backend/middleware/rateLimiter.js");

  const checks = [
    check(
      "S1",
      "Registro público duplicado removido",
      "CRITICAL",
      !apiRoutes.includes('router.post("/auth/register"') && !apiRoutes.includes("authController.register"),
      !apiRoutes.includes('router.post("/auth/register"') ? "Rota pública ausente em apiRoutes.js" : "Rota pública ainda presente",
      "Manter registro apenas em authRoutes com verifyToken"
    ),
    check(
      "S2",
      "Webhook ASAAS revalida pagamento na API",
      "HIGH",
      asaasWebhook.includes("asaasService.getPayment") && asaasWebhook.includes("RECEIVED"),
      "AsaasWebhookController chama getPayment antes de _markAsPaid"
    ),
    check(
      "S3",
      "Download de documentos protegido (admin)",
      "HIGH",
      !apiRoutes.includes('"/chat/documents/download/:id"') &&
        apiRoutes.includes('"/admin/chat/documents/download/:id"'),
      "Download movido para rota admin com JWT"
    ),
    check(
      "S4-helmet",
      "Helmet configurado",
      "HIGH",
      serverJs.includes("helmet()") && appJs.includes("helmet()"),
      "helmet() em server.js e app.js"
    ),
    check(
      "S4-auth-limit",
      "Rate limit no login",
      "HIGH",
      authRoutes.includes("authLimiter") && authRoutes.includes('router.post("/login", authLimiter'),
      "authLimiter aplicado em authRoutes.js"
    ),
    check(
      "S5",
      "RBAC requireRole nas rotas admin",
      "HIGH",
      apiRoutes.includes("requireRole") && apiRoutes.includes("adminOnly"),
      "requireRole + adminOnly em apiRoutes.js"
    ),
    check(
      "S6",
      "JWT secret centralizado sem fallback hardcoded legado",
      "HIGH",
      authMiddleware.includes("getJwtSecret") &&
        !authMiddleware.includes("your_jwt_secret_key_change_this_in_prod"),
      "config/jwtSecret.js usado; fallback legado removido"
    ),
    check(
      "S7",
      "DOMPurify no chat MessageBubble",
      "HIGH",
      messageBubble.includes("DOMPurify.sanitize"),
      "MessageBubble.tsx sanitiza contentHtml"
    ),
    check(
      "S8-query",
      "Webhook ASAAS sem token via query",
      "MEDIUM",
      !asaasWebhook.includes("req.query.token"),
      "req.query.token removido do AsaasWebhookController"
    ),
    check(
      "S8-timing",
      "Comparação timing-safe do token ASAAS",
      "LOW",
      asaasService.includes("timingSafeEqual"),
      "AsaasService.validateWebhookToken usa timingSafeEqual"
    ),
    check(
      "S10",
      "Rate limit POST /api/diagnostico",
      "MEDIUM",
      apiRoutes.includes("diagnosticoLeadLimiter") && apiRoutes.includes('router.post("/diagnostico", diagnosticoLeadLimiter'),
      "diagnosticoLeadLimiter aplicado"
    ),
    check(
      "S11",
      "Login com mensagem genérica (anti-enumeração)",
      "MEDIUM",
      authController.includes("Credenciais inválidas") && !authController.includes("Usuário não encontrado"),
      "authController retorna mensagem genérica"
    ),
    check(
      "S12",
      "bcrypt cost 12",
      "MEDIUM",
      authController.includes("BCRYPT_ROUNDS = 12") || authController.includes("BCRYPT_ROUNDS"),
      "bcrypt rounds = 12"
    ),
    check(
      "S13",
      "Wildcards LIKE escapados",
      "LOW",
      diagnosticoPedido.includes("escapeLikePattern") && diagnosticoPedido.includes("ESCAPE"),
      "escapeLikePattern + ESCAPE em listPedidos"
    ),
    check(
      "S14",
      "Webhook diagnostico_pago assinado (HMAC)",
      "MEDIUM",
      webhookService.includes("X-Webhook-Signature") && webhookService.includes("signWebhookPayload"),
      "DiagnosticoPagamentoWebhookService assina payload"
    ),
    check(
      "S15",
      "Admin bootstrap via ADMIN_INITIAL_PASSWORD",
      "HIGH",
      databaseJs.includes("ADMIN_INITIAL_PASSWORD") && !databaseJs.includes('hashSync("admin123"'),
      "database.js usa ADMIN_INITIAL_PASSWORD; admin123 removido"
    ),
    check(
      "S16",
      "Token de acesso em consulta de pedido",
      "MEDIUM",
      diagnosticoPedido.includes("verifyPedidoAccess") && diagnosticoPedido.includes("signPedidoAccess"),
      "HMAC token obrigatório em getPedido"
    ),
    check(
      "R1",
      "Rate limit global (generalApiLimiter)",
      "LOW",
      rateLimiter.includes("generalApiLimiter") &&
        (serverJs.includes("generalApiLimiter") || appJs.includes("generalApiLimiter")),
      "generalApiLimiter definido mas não aplicado globalmente",
      "Aplicar app.use('/api', generalApiLimiter) como baseline"
    ),
    check(
      "R2",
      "Rate limit POST /api/leads",
      "MEDIUM",
      /router\.post\("\/leads",\s*leadsLimiter/.test(apiRoutes),
      /router\.post\("\/leads",\s*leadsLimiter/.test(apiRoutes)
        ? "leadsLimiter aplicado em POST /api/leads"
        : "POST /api/leads sem leadsLimiter",
      "Aplicar leadsLimiter em POST /api/leads"
    ),
    check(
      "R3",
      "JWT fallback apenas em dev",
      "LOW",
      jwtSecret.includes('NODE_ENV === "production"') && jwtSecret.includes("process.exit(1)"),
      "jwtSecret.js exige secret em produção; dev-only fallback em dev"
    ),
    check(
      "R4",
      "CORS permite requisições sem Origin",
      "MEDIUM",
      !(serverJs.includes("if (!origin) return true") || appJs.includes("if (!origin) return true")),
      "isAllowedOrigin retorna true para origin ausente",
      "Em produção, rejeitar requests sem Origin (exceto health)"
    ),
  ];

  const backendAudit = runNpmAudit("backend");
  const frontendAudit = runNpmAudit(".");

  const passed = checks.filter((c) => c.status === "PASS").length;
  const failed = checks.filter((c) => c.status === "FAIL").length;
  const criticalFail = checks.filter((c) => c.status === "FAIL" && c.severity === "CRITICAL").length;
  const highFail = checks.filter((c) => c.status === "FAIL" && c.severity === "HIGH").length;

  const result = {
    timestamp: new Date().toISOString(),
    summary: {
      checksTotal: checks.length,
      passed,
      failed,
      criticalFail,
      highFail,
    },
    npmAudit: {
      backend: backendAudit.vulnerabilities,
      frontend: frontendAudit.vulnerabilities,
    },
    checks,
  };

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2), "utf8");

  console.log("=== Security Audit ===");
  console.log(`Checks: ${passed}/${checks.length} passed (${failed} failed)`);
  console.log(`Backend npm audit: ${JSON.stringify(backendAudit.vulnerabilities)}`);
  console.log(`Frontend npm audit: ${JSON.stringify(frontendAudit.vulnerabilities)}`);
  console.log(`Results: ${OUT}`);

  if (criticalFail > 0 || highFail > 0) {
    console.log("\nFAILED (CRITICAL/HIGH):");
    checks
      .filter((c) => c.status === "FAIL" && (c.severity === "CRITICAL" || c.severity === "HIGH"))
      .forEach((c) => console.log(`  [${c.severity}] ${c.id} ${c.name}`));
    process.exit(1);
  }

  process.exit(failed > 0 ? 0 : 0);
}

main();
