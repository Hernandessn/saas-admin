import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .regex(/[a-z]/, "Inclua ao menos uma letra minúscula")
  .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Inclua ao menos um número")
  .regex(/[^a-zA-Z0-9]/, "Inclua ao menos um símbolo (ex: !@#$)");

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("E-mail inválido"),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
