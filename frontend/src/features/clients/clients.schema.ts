import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres").max(120, "Máximo de 120 caracteres"),
  status: z.enum(["LEAD", "ACTIVE", "PAUSED", "CHURNED"]),
  value: z.coerce.number().min(0, "O valor não pode ser negativo"),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
