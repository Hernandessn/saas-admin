import { Response } from "express";
import { env } from "../../config/env";
import { durationToMs } from "../../utils/tokens";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthedRequest } from "../../middleware/auth";
import { loginSchema, registerSchema } from "./auth.schema";
import * as authService from "./auth.service";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(env.refreshCookieName, token, {
    httpOnly: true,
    secure: env.isProd,
    // Strict, não Lax: o refresh cookie só é lido via fetch disparado de
    // dentro do SPA já carregado — nunca via navegação de topo vinda de outro
    // site — então Strict não quebra nenhum fluxo real e fecha mais uma
    // superfície do que Lax. Se algum dia este cookie precisar ser lido a
    // partir de uma navegação cross-site legítima (ex: link de e-mail que
    // aterrissa direto numa rota autenticada), isso vai quebrar e Lax seria
    // necessário — não é o caso hoje.
    sameSite: "strict",
    maxAge: durationToMs(env.jwt.refreshExpiresIn),
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(env.refreshCookieName, { path: "/api/auth" });
}

export const registerHandler = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.register(input);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.login(input);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.refreshCookieName];
  if (!token) {
    return res.status(401).json({ message: "Session missing" });
  }
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.refreshCookieName];
  await authService.logout(token);
  clearRefreshCookie(res);
  res.status(204).send();
});

export const meHandler = asyncHandler(async (req: AuthedRequest, res) => {
  const user = await authService.getMe(req.user!.id);
  res.json({ user });
});
