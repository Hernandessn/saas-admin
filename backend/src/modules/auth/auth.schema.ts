import { z } from "zod";

// Senha forte: min 8 chars, ao menos 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
const strongPassword = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter ao menos um número")
  .regex(/[^a-zA-Z0-9]/, "A senha deve conter ao menos um símbolo");

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo").max(100),
  email: z.string().email("E-mail inválido"),
  password: strongPassword,
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
