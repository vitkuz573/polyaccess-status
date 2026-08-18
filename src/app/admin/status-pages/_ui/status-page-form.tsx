"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusPage } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  statusPageFormSchema,
  StatusPageFormValues,
} from "@/lib/status-page-schema";
import { Loader2Icon } from "lucide-react";

interface StatusPageFormProps {
  statusPage?: StatusPage | null;
  onSubmit: (values: StatusPageFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function buildDefaults(statusPage?: StatusPage | null): StatusPageFormValues {
  if (!statusPage) {
    return {
      name: "",
      slug: "",
      description: "",
      customDomain: "",
      isPublic: true,
    };
  }

  return {
    name: statusPage.name,
    slug: statusPage.slug,
    description: statusPage.description ?? "",
    customDomain: statusPage.customDomain ?? "",
    isPublic: statusPage.isPublic,
  };
}

export function StatusPageForm({
  statusPage,
  onSubmit,
  onCancel,
  isSubmitting,
}: StatusPageFormProps) {
  const isEditing = !!statusPage;

  const defaultValues = useMemo(
    () => buildDefaults(statusPage),
    [statusPage]
  );

  const form = useForm<StatusPageFormValues>({
    resolver: zodResolver(statusPageFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(buildDefaults(statusPage));
  }, [statusPage, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. PolyAccess Status"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. polyaccess"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Lowercase letters, numbers, and hyphens only. Used in the public URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description shown on the status page"
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom domain</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. status.example.com"
                  disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Optional custom hostname. Leave blank to use the default URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Make this status page publicly visible.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Create status page"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
