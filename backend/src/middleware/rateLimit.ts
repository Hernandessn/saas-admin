import rateLimit from "express-rate-limit";

/**
 * Factory instead of a single shared instance: express-rate-limit tracks
 * counts per middleware instance, not per route. Reusing one instance across
 * /login, /register and /refresh would pool their attempts into a single
 * shared bucket per IP — a user who mistypes their password a few times could
 * then get locked out of an unrelated refresh call. Each route gets its own
 * counter by calling this factory separately.
 *
 * 5 requests per IP per 15-minute window. Intentionally strict — these are
 * the endpoints an attacker would hit for credential stuffing / brute force /
 * refresh-token guessing.
 */
export function createAuthRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
    },
    keyGenerator: (req) => req.ip ?? "unknown",
  });
}