import { ReactNode } from "react";

export function AuthLayout({
  children,
  tagline,
}: {
  children: ReactNode;
  tagline: string;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1fr]">
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-base font-semibold text-volt">
              N
            </span>
            <span className="font-display text-lg font-medium text-ink dark:text-paper">
              Nimbus
            </span>
          </div>
          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-brand-800 lg:block">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(196,241,53,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(196,241,53,0.15), transparent 40%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-14">
          <div />
          <div className="max-w-md">
            <p className="font-display text-3xl font-medium leading-snug text-paper">
              {tagline}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-paper/20" />
              <span className="font-mono text-xs uppercase tracking-widest text-volt">
                operational dashboard
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
