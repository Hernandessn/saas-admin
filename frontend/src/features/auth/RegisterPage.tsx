import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, X } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthContext";
import { RegisterFormValues, registerSchema } from "./auth.schema";
import { cn } from "@/lib/cn";

const passwordChecks = [
  { label: "8+ caracteres", test: (v: string) => v.length >= 8 },
  { label: "1 uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "1 number", test: (v: string) => /[0-9]/.test(v) },
  { label: "1 symbol", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Unable to create your account.",
      );
    }
  };

  return (
    <AuthLayout tagline="Get started in minutes. Your client base, organized from day one.">
      <h1 className="font-display text-2xl font-medium text-ink dark:text-paper">
        Create account
      </h1>
      <p className="mt-1.5 text-sm text-ink/60 dark:text-paper/60">
        Leva menos de um minuto para configurar.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-4"
      >
        <Input
          label="Name completo"
          placeholder="Your name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {passwordValue.length > 0 && (
          <div className="-mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {passwordChecks.map((check) => {
              const passed = check.test(passwordValue);
              return (
                <span
                  key={check.label}
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    passed
                      ? "text-status-active"
                      : "text-ink/40 dark:text-paper/40",
                  )}
                >
                  {passed ? <Check size={12} /> : <X size={12} />}
                  {check.label}
                </span>
              );
            })}
          </div>
        )}

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <div className="flex items-start gap-2 rounded-lg bg-status-churned/10 px-3 py-2 text-sm text-status-churned">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/60 dark:text-paper/60">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-brand-500 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
