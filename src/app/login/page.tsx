"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheckIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isPending, setIsPending] = useState(false);

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setIsPending(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid credentials");
        return;
      }

      toast.success("Signed in successfully");
      window.location.assign(redirectTo);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="status-dark status-aurora flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1021] to-[#020617]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sp-emerald-soft)] ring-1 ring-[var(--sp-emerald)]/20">
            <ShieldCheckIcon className="h-7 w-7 text-[var(--sp-emerald)]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--sp-text)]">
              PolyAccess Status
            </h1>
            <p className="mt-1 text-sm text-[var(--sp-text-secondary)]">
              Sign in to the admin dashboard
            </p>
          </div>
        </div>

        <div className="status-glass-strong rounded-2xl p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--sp-text)]">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@polyaccess.tech"
                value={email}
                disabled={isPending}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={!!fieldErrors.email}
                className="h-10 border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] px-3 text-[var(--sp-text)] placeholder:text-[var(--sp-text-tertiary)] focus-visible:border-[var(--sp-emerald)]/40 focus-visible:ring-[var(--sp-emerald)]/20"
              />
              {fieldErrors.email && (
                <p className="text-xs text-[var(--sp-red)]">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--sp-text)]">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                disabled={isPending}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={!!fieldErrors.password}
                className="h-10 border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] px-3 text-[var(--sp-text)] placeholder:text-[var(--sp-text-tertiary)] focus-visible:border-[var(--sp-emerald)]/40 focus-visible:ring-[var(--sp-emerald)]/20"
              />
              {fieldErrors.password && (
                <p className="text-xs text-[var(--sp-red)]">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-[var(--sp-red-soft)] p-3 text-sm text-[var(--sp-red)] ring-1 ring-[var(--sp-red)]/20">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-10 w-full bg-[var(--sp-emerald)] text-[#020617] hover:bg-[var(--sp-emerald)]/90"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to admin"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--sp-text-tertiary)]">
          PolyAccess Status Admin Portal
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="status-dark status-aurora flex min-h-screen flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1021] to-[#020617]" />
        <div className="relative z-10 w-full max-w-md">
          <div className="status-glass-strong rounded-2xl p-6 sm:p-8">
            <div className="h-10 animate-pulse rounded-lg bg-[var(--sp-surface)]" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
