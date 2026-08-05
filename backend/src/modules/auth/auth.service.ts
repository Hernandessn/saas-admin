import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  hashToken,
  newTokenId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  durationToMs,
} from "../../utils/tokens";
import { env } from "../../config/env";
import { LoginInput, RegisterInput } from "./auth.schema";

const PUBLIC_USER_SELECT = { id: true, email: true, name: true, createdAt: true };

async function issueTokenPair(userId: string, email: string, name: string) {
  const accessToken = signAccessToken({ sub: userId, email, name });

  const jti = newTokenId();
  const refreshToken = signRefreshToken({ sub: userId, jti });

  await prisma.refreshToken.create({
    data: {
      id: jti,
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: new Date(Date.now() + durationToMs(env.jwt.refreshExpiresIn)),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("Já existe uma conta com este e-mail");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
    select: PUBLIC_USER_SELECT,
  });

  const tokens = await issueTokenPair(user.id, user.email, user.name);
  return { user, ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized("E-mail ou senha incorretos");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("E-mail ou senha incorretos");
  }

  const tokens = await issueTokenPair(user.id, user.email, user.name);
  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    ...tokens,
  };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Sessão expirada, faça login novamente");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!stored || stored.revokedAt || stored.tokenHash !== hashToken(refreshToken)) {
    throw ApiError.unauthorized("Sessão inválida, faça login novamente");
  }
  if (stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Sessão expirada, faça login novamente");
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) {
    throw ApiError.unauthorized("Usuário não encontrado");
  }

  const tokens = await issueTokenPair(user.id, user.email, user.name);
  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    ...tokens,
  };
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // token already invalid/expired — nothing to revoke
  }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
  if (!user) throw ApiError.notFound("Usuário não encontrado");
  return user;
}
