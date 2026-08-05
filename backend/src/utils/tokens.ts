import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function newTokenId(): string {
  return crypto.randomUUID();
}

/** Converts a "15m" / "7d" style duration into milliseconds for cookie maxAge. */
export function durationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * unitMs[unit];
}
