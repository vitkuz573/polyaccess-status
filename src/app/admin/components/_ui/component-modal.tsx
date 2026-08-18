"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ComponentForm } from "./component-form";
import { ComponentWithChecks, GroupOption } from "./types";
import { ComponentFormValues } from "@/lib/component-schema";

interface ComponentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component?: ComponentWithChecks | null;
  groups: GroupOption[];
  onSubmit: (values: ComponentFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ComponentModal({
  open,
  onOpenChange,
  component,
  groups,
  onSubmit,
  isSubmitting,
}: ComponentModalProps) {
  const title = component ? "Edit component" : "New component";
  const description = component
    ? "Update this component and its health checks."
    : "Create a new component with health checks.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[var(--sp-border-strong)] bg-[#0b1021] p-0 text-[var(--sp-text)]">
        <DialogHeader className="sticky top-0 z-10 border-b border-[var(--sp-border)] bg-[#0b1021] p-6">
          <DialogTitle className="text-[var(--sp-text)]">{title}</DialogTitle>
          <DialogDescription className="text-[var(--sp-text-secondary)]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <ComponentForm
            component={component}
            groups={groups}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
