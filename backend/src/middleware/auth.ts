import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/tokens";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Token de acesso ausente"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    next(ApiError.unauthorized("Token de acesso inválido ou expirado"));
  }
}
