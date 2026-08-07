import { z } from "zod";

// Password forte: min 8 chars, ao menos 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol");

export const registerSchema = z.object({
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Invalid email"),
  password: strongPassword,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
