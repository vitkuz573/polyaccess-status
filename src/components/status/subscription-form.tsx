"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subscribeSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type SubscribeFormValues = z.infer<typeof subscribeSchema>;

interface SubscriptionFormProps {
  slug: string;
}

export function SubscriptionForm({ slug }: SubscriptionFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: SubscribeFormValues) {
    try {
      const res = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "email", target: values.email, slug }),
      });

      const data = (await res.json().catch(() => ({ error: "Unexpected response" }))) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || data.ok !== true) {
        toast.error(data.error ?? "Subscription failed. Please try again.");
        return;
      }

      toast.success(data.message ?? "Subscribed successfully");
      setSubmitted(true);
      reset();
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  return (
    <section className="status-glass rounded-2xl p-6 sm:p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sp-emerald-soft)] text-[var(--sp-emerald)]">
          <Mail className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-[var(--sp-text)]">
          Stay in the loop
        </h3>
        <p className="mt-1 text-sm text-[var(--sp-text-secondary)]">
          Subscribe to receive incident and maintenance notifications for this status page.
        </p>

        {submitted ? (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[var(--sp-emerald)]/20 bg-[var(--sp-emerald-soft)] px-4 py-3 text-sm font-medium text-[var(--sp-emerald)]">
            <CheckCircle2 className="h-4 w-4" />
            You are subscribed.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1 text-left">
              <Label htmlFor="subscribe-email" className="sr-only">
                Email address
              </Label>
              <Input
                id="subscribe-email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                className="h-10 w-full rounded-lg border-[var(--sp-border-strong)] bg-[var(--sp-bg-elevated)]/50 px-3 text-sm text-[var(--sp-text)] placeholder:text-[var(--sp-text-tertiary)] focus-visible:border-[var(--sp-emerald)] focus-visible:ring-[var(--sp-emerald)]/20"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[var(--sp-red)]">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 shrink-0 gap-2 rounded-lg bg-[var(--sp-emerald)] px-5 text-sm font-semibold text-[var(--sp-bg)] hover:bg-[var(--sp-emerald)]/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
