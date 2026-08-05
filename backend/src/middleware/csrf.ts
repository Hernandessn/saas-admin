import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const CSRF_HEADER = "x-nimbus-csrf";

/**
 * Defense-in-depth against CSRF, on top of SameSite=Strict on the refresh
 * cookie. Why both:
 *
 * SameSite blocks the cookie from being attached to cross-site requests in
 * modern browsers, but it does nothing in browsers old enough to not
 * implement the SameSite attribute at all (pre-2016 Safari, some embedded
 * webviews) — for those, the cookie is sent regardless, exactly like it was
 * before this attribute existed.
 *
 * This middleware requires a custom header with a fixed value on every
 * request that reads the refresh cookie. It is not a secret — the value
 * itself is public — its security comes from *how browsers are allowed to
 * set headers*, not from the value being unguessable:
 *
 *  - A classic CSRF vector (a plain <form> submit, or an <img>/no-cors fetch
 *    triggered from an attacker's page) can only send a fixed, small set of
 *    "simple" headers. It cannot add an arbitrary custom header like this
 *    one — browsers simply don't allow it outside of a proper CORS request.
 *  - To add this header via fetch/XHR, the request stops being a "simple
 *    request" and triggers a CORS preflight (OPTIONS). That preflight is
 *    answered using our `cors` origin allowlist (see app.ts) — an
 *    attacker's origin isn't on it, so the browser blocks the real request
 *    before it's ever sent.
 *
 * So: no custom header present -> not a legitimate same-origin app request,
 * reject outright. This does NOT replace SameSite, it covers the gap
 * SameSite leaves open.
 */
export function requireCsrfHeader(req: Request, _res: Response, next: NextFunction) {
  if (req.get(CSRF_HEADER) !== "1") {
    return next(
      ApiError.forbidden("Requisição bloqueada por proteção CSRF (header ausente ou inválido)")
    );
  }
  next();
}
