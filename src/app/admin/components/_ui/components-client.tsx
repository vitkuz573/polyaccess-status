"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ComponentStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ComponentModal } from "./component-modal";
import { DeleteDialog } from "./delete-dialog";
import { ResultsPreview } from "./results-preview";
import { ComponentWithChecks, GroupOption } from "./types";
import { ComponentFormValues } from "@/lib/component-schema";
import { uptimePercentage } from "@/lib/status";
import { formatDistanceToNow } from "date-fns";
import {
  ServerIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircle2Icon,
  ActivityIcon,
} from "lucide-react";
import { toast } from "sonner";
import { RunChecksButton } from "../run-checks-button";

interface ComponentsClientProps {
  initialComponents: ComponentWithChecks[];
  groups: GroupOption[];
}

export function ComponentsClient({ initialComponents, groups }: ComponentsClientProps) {
  const [components, setComponents] = useState<ComponentWithChecks[]>(initialComponents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentWithChecks | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingComponent, setDeletingComponent] = useState<ComponentWithChecks | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const grouped = components.reduce<Record<string, ComponentWithChecks[]>>((acc, c) => {
    const key = c.group?.name ?? "Ungrouped";
    acc[key] = acc[key] ?? [];
    acc[key].push(c);
    return acc;
  }, {});

  const totalChecks = components.reduce(
    (sum, c) => sum + c.checks.reduce((s, ch) => s + ch.results.length, 0),
    0
  );

  const handleCreateClick = useCallback(() => {
    setEditingComponent(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback((component: ComponentWithChecks) => {
    setEditingComponent(component);
    setModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((component: ComponentWithChecks) => {
    setDeletingComponent(component);
    setDeleteDialogOpen(true);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingComponent(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (values: ComponentFormValues) => {
      setIsSubmitting(true);
      try {
        const url = editingComponent
          ? `/api/admin/components/${editingComponent.id}`
          : "/api/admin/components";
        const method = editingComponent ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to save component");
          return;
        }

        toast.success(
          editingComponent ? "Component updated" : "Component created"
        );

        setComponents((prev) => {
          const updated = data.component as ComponentWithChecks;
          if (editingComponent) {
            return prev
              .map((c) => (c.id === updated.id ? updated : c))
              .sort(
                (a, b) =>
                  (a.group?.position ?? Number.MAX_SAFE_INTEGER) -
                    (b.group?.position ?? Number.MAX_SAFE_INTEGER) ||
                  a.position - b.position
              );
          }
          return [...prev, updated].sort(
            (a, b) =>
              (a.group?.position ?? Number.MAX_SAFE_INTEGER) -
                (b.group?.position ?? Number.MAX_SAFE_INTEGER) ||
              a.position - b.position
          );
        });

        setModalOpen(false);
        setEditingComponent(null);
      } catch {
        toast.error("Network error while saving component");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingComponent]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingComponent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/components/${deletingComponent.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete component");
        return;
      }

      toast.success("Component deleted");
      setComponents((prev) => prev.filter((c) => c.id !== deletingComponent.id));
      setDeleteDialogOpen(false);
      setDeletingComponent(null);
    } catch {
      toast.error("Network error while deleting component");
    } finally {
      setIsDeleting(false);
    }
  }, [deletingComponent]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Components
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateClick} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New component
          </Button>
          <RunChecksButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ServerIcon className="h-4 w-4" />
              Total components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">
              {components.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ActivityIcon className="h-4 w-4" />
              Total checks run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">
              {totalChecks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CheckCircle2Icon className="h-4 w-4" />
              Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">
              {components.filter((c) => c.status === "operational").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {components.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ServerIcon}
              title="No components yet"
              description="Add your first component to start monitoring a service."
            />
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([groupName, items]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-foreground">{groupName}</CardTitle>
              <CardDescription>
                {items.length} component{items.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Last checked</TableHead>
                      <TableHead>Latest result</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((c) => {
                      const allResults = c.checks.flatMap((ch) => ch.results);
                      const latestResult = allResults[0];
                      const uptime = uptimePercentage(allResults);

                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {c.name}
                            </div>
                            {c.description && (
                              <div className="text-xs text-muted-foreground">
                                {c.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <ComponentStatusBadge status={c.status} />
                          </TableCell>
                          <TableCell className="tabular-nums text-foreground">
                            {uptime.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {latestResult ? (
                              formatDistanceToNow(latestResult.checkedAt) + " ago"
                            ) : (
                              <span className="text-muted-foreground">
                                Never
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <ResultsPreview results={allResults} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditClick(c)}
                                title="Edit component"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteClick(c)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Delete component"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <ComponentModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        component={editingComponent}
        groups={groups}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete component"
        description={`Are you sure you want to delete "${deletingComponent?.name ?? ""}"? This will also remove its health checks and result history. This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
