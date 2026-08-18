"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusPageForm } from "./status-page-form";
import { StatusPageFormValues } from "@/lib/status-page-schema";
import { StatusPage } from "@prisma/client";

interface StatusPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusPage?: StatusPage | null;
  onSubmit: (values: StatusPageFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function StatusPageModal({
  open,
  onOpenChange,
  statusPage,
  onSubmit,
  isSubmitting,
}: StatusPageModalProps) {
  const title = statusPage ? "Edit status page" : "New status page";
  const description = statusPage
    ? "Update this status page's details."
    : "Create a new public or private status page.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 border-b bg-card p-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <StatusPageForm
            statusPage={statusPage}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
