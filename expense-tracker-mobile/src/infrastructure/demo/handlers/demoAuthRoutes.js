const DEMO_JWT_PREFIX = "expensio-demo-token";

function buildDemoJwt() {
  return `${DEMO_JWT_PREFIX}.${Date.now()}`;
}

export async function tryDemoAuthRoutes(ctx) {
  const { method, path, body, cfg, resolveDemoData, rejectDemoHttp } = ctx;

  if (method === "POST" && path === "/auth/signin") {
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    if (email === cfg.demoEmail && password === cfg.demoPassword) {
      return resolveDemoData({ jwt: buildDemoJwt() });
    }
    return rejectDemoHttp(401, "Invalid email or password.");
  }

  if (method === "POST" && path === "/auth/signup") {
    return resolveDemoData({ message: "Registered. Sign in with demo credentials.", success: true });
  }

  if (method === "POST" && path === "/auth/oauth2/google") {
    return resolveDemoData({ jwt: buildDemoJwt() });
  }

  if (method === "POST" && path === "/auth/check-email") {
    return resolveDemoData({ exists: false });
  }

  if (method === "POST" && path === "/auth/verify-login-otp") {
    return resolveDemoData({ jwt: buildDemoJwt() });
  }

  return null;
}
