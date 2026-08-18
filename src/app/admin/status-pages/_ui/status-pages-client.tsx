"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { StatusPage } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPageModal } from "./status-page-modal";
import { DeleteDialog } from "../../components/_ui/delete-dialog";
import { StatusPageFormValues } from "@/lib/status-page-schema";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FileTextIcon,
  ExternalLinkIcon,
  GlobeIcon,
} from "lucide-react";
import { toast } from "sonner";

interface StatusPagesClientProps {
  initialPages: StatusPage[];
}

export function StatusPagesClient({ initialPages }: StatusPagesClientProps) {
  const [pages, setPages] = useState<StatusPage[]>(initialPages);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<StatusPage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPage, setDeletingPage] = useState<StatusPage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateClick = useCallback(() => {
    setEditingPage(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback((page: StatusPage) => {
    setEditingPage(page);
    setModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((page: StatusPage) => {
    setDeletingPage(page);
    setDeleteDialogOpen(true);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingPage(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (values: StatusPageFormValues) => {
      setIsSubmitting(true);
      try {
        const url = editingPage
          ? `/api/admin/status-pages/${editingPage.id}`
          : "/api/admin/status-pages";
        const method = editingPage ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to save status page");
          return;
        }

        toast.success(editingPage ? "Status page updated" : "Status page created");

        setPages((prev) => {
          const updated = data.page as StatusPage;
          if (editingPage) {
            return prev
              .map((p) => (p.id === updated.id ? updated : p))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
          return [updated, ...prev].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
        });

        setModalOpen(false);
        setEditingPage(null);
      } catch {
        toast.error("Network error while saving status page");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingPage]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingPage) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/status-pages/${deletingPage.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete status page");
        return;
      }

      toast.success("Status page deleted");
      setPages((prev) => prev.filter((p) => p.id !== deletingPage.id));
      setDeleteDialogOpen(false);
      setDeletingPage(null);
    } catch {
      toast.error("Network error while deleting status page");
    } finally {
      setIsDeleting(false);
    }
  }, [deletingPage]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Status pages
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage public and private status pages for your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateClick} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New status page
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/polyaccess" target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="h-4 w-4" />
              View public page
            </Link>
          </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileTextIcon}
              title="No status pages yet"
              description="Create your first status page to start sharing status with your users."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">All status pages</CardTitle>
            <CardDescription>
              {pages.length} page{pages.length === 1 ? "" : "s"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{page.name}</div>
                        {page.description && (
                          <div className="max-w-xs truncate text-xs text-muted-foreground">
                            {page.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {page.slug}
                      </TableCell>
                      <TableCell>
                        {page.customDomain ? (
                          <div className="flex items-center gap-1.5 text-sm text-foreground">
                            <GlobeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {page.customDomain}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.isPublic ? "default" : "secondary"}>
                          {page.isPublic ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(page.createdAt)} ago
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEditClick(page)}
                            title="Edit status page"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteClick(page)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete status page"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <StatusPageModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        statusPage={editingPage}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete status page"
        description={`Are you sure you want to delete "${deletingPage?.name ?? ""}"? This will also remove its components, incidents, and history. This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
