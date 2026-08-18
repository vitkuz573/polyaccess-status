"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOutIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({
  variant = "ghost",
  className,
  children,
}: {
  variant?: "ghost" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Signed out successfully");
        window.location.assign("/login");
      } else {
        toast.error("Failed to sign out");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOutIcon className="mr-2 h-4 w-4" />
      )}
      {children}
    </Button>
  );
}
