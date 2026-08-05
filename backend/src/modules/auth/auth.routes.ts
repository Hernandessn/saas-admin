import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { createAuthRateLimiter } from "../../middleware/rateLimit";
import { requireCsrfHeader } from "../../middleware/csrf";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
} from "./auth.controller";

export const authRouter = Router();

// Cada rota tem seu próprio rate limiter (ver middleware/rateLimit.ts) — 5
// requisições por IP a cada 15 min, contadores independentes entre si.
//
// requireCsrfHeader vai em /refresh e /logout: são as únicas duas rotas que
// LEEM o refresh cookie httpOnly para agir (renovar sessão / revogar sessão).
// /login e /register não dependem desse cookie — eles o criam, não o
// consomem — então não são o vetor de CSRF que este header defende contra.
authRouter.post("/register", createAuthRateLimiter(), registerHandler);
authRouter.post("/login", createAuthRateLimiter(), loginHandler);
authRouter.post("/refresh", createAuthRateLimiter(), requireCsrfHeader, refreshHandler);
authRouter.post("/logout", requireCsrfHeader, logoutHandler);
authRouter.get("/me", requireAuth, meHandler);
