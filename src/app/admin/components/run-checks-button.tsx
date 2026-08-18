"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export function RunChecksButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/run-checks", { method: "POST" });
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to run checks");
        return;
      }
      toast.success(`Checks completed: ${data.checksRun ?? 0} checks run`);
    } catch {
      toast.error("Network error while running checks");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <PlayIcon className="h-4 w-4" />
      )}
      Run checks
    </Button>
  );
}
