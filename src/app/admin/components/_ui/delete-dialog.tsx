"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon, AlertTriangleIcon } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[var(--sp-border-strong)] bg-[#0b1021] text-[var(--sp-text)]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sp-red-soft)]">
              <AlertTriangleIcon className="h-5 w-5 text-[var(--sp-red)]" />
            </div>
            <div>
              <DialogTitle className="text-[var(--sp-text)]">{title}</DialogTitle>
              <DialogDescription className="text-[var(--sp-text-secondary)]">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="border-[var(--sp-border-strong)] text-[var(--sp-text)] hover:bg-[var(--sp-surface-hover)]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-[var(--sp-red)] text-white hover:bg-[var(--sp-red)]/90"
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
