import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, res: Response) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Invalid data",
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({ message: "Erro interno do servidor" });
}
