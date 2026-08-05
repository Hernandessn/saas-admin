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
      setServerError(err?.response?.data?.message ?? "Não foi possível entrar. Tente novamente.");
    }
  };

  return (
    <AuthLayout tagline="Cada cliente, cada número, num só lugar — sem ruído.">
      <h1 className="font-display text-2xl font-medium text-ink dark:text-paper">Entrar na conta</h1>
      <p className="mt-1.5 text-sm text-ink/60 dark:text-paper/60">
        Use suas credenciais para acessar o painel.
      </p>

      <div className="mt-4 rounded-lg border border-brand-500/20 bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200">
        Conta demo: <span className="font-mono">demo@saasadmin.dev</span> /{" "}
        <span className="font-mono">Demo@1234</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@empresa.com"
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
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/60 dark:text-paper/60">
        Não tem conta?{" "}
        <Link to="/register" className="font-medium text-brand-500 hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}
