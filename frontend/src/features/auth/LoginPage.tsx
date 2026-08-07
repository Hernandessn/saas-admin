import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthContext";
import { LoginFormValues, loginSchema } from "./auth.schema";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: string })?.from ?? "/dashboard";

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Unable to log in. Please try again.",
      );
    }
  };

  return (
    <AuthLayout tagline="Every client, every number, in one place — no noise.">
      <h1 className="font-display text-2xl font-medium text-ink dark:text-paper">
        Log in to your account
      </h1>
      <p className="mt-1.5 text-sm text-ink/60 dark:text-paper/60">
        Use your credentials to access the dashboard.
      </p>

      <div className="mt-4 rounded-lg border border-brand-500/20 bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200">
        Demo account: <span className="font-mono">demo@saasadmin.dev</span> /{" "}
        <span className="font-mono">Demo@1234</span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-4"
      >
        <Input
          label="E-mail"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <div className="flex items-start gap-2 rounded-lg bg-status-churned/10 px-3 py-2 text-sm text-status-churned">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/60 dark:text-paper/60">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-brand-500 hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
