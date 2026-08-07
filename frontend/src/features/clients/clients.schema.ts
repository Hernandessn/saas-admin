import { z } from "zod";

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(120, "Maximum 120 characters"),
  status: z.enum(["LEAD", "ACTIVE", "PAUSED", "CHURNED"]),
  value: z.coerce.number().min(0, "Value cannot be negative"),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
