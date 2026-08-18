"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ComponentStatus } from "@prisma/client";
import {
  componentFormSchema,
  ComponentFormValues,
} from "@/lib/component-schema";
import { ComponentWithChecks, GroupOption } from "./types";
import {
  PlusIcon,
  TrashIcon,
  Loader2Icon,
  AlertCircleIcon,
  ServerIcon,
} from "lucide-react";

const statusOptions: { value: ComponentStatus; label: string }[] = [
  { value: "operational", label: "Operational" },
  { value: "degraded", label: "Degraded Performance" },
  { value: "partial_outage", label: "Partial Outage" },
  { value: "major_outage", label: "Major Outage" },
  { value: "maintenance", label: "Under Maintenance" },
];

const checkTypeOptions: { value: "http" | "heartbeat"; label: string }[] = [
  { value: "http", label: "HTTP" },
  { value: "heartbeat", label: "Heartbeat" },
];

const methodOptions = ["GET", "POST", "HEAD"] as const;

interface ComponentFormProps {
  component?: ComponentWithChecks | null;
  groups: GroupOption[];
  onSubmit: (values: ComponentFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function defaultCheck(): ComponentFormValues["checks"][number] {
  return {
    name: "",
    type: "http",
    target: "",
    timeout: 10,
    interval: 60,
    expectedStatus: 200,
    method: "GET",
    headers: "",
    enabled: true,
  };
}

function buildDefaults(
  component?: ComponentWithChecks | null
): ComponentFormValues {
  if (!component) {
    return {
      name: "",
      description: "",
      groupId: null,
      newGroupName: "",
      position: 0,
      statusOverride: null,
      active: true,
      checks: [defaultCheck()],
    };
  }

  return {
    name: component.name,
    description: component.description ?? "",
    groupId: component.groupId,
    newGroupName: "",
    position: component.position,
    statusOverride: component.status,
    active: true,
    checks: component.checks.length
      ? component.checks.map((check) => ({
          id: check.id,
          name: "",
          type: "http",
          target: check.target,
          timeout: check.timeout,
          interval: check.interval,
          expectedStatus: null,
          method: "GET",
          headers: "",
          enabled: check.enabled,
        }))
      : [defaultCheck()],
  };
}

export function ComponentForm({
  component,
  groups,
  onSubmit,
  onCancel,
  isSubmitting,
}: ComponentFormProps) {
  const isEditing = !!component;

  const defaultValues = useMemo(
    () => buildDefaults(component),
    [component]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ComponentFormValues>({
    resolver: zodResolver(componentFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "checks",
  });

  useEffect(() => {
    reset(buildDefaults(component));
  }, [component, reset]);

  const groupIdValue = watch("groupId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Component name</Label>
          <Input
            id="name"
            placeholder="e.g. Challenge Proxy"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-[var(--sp-red)]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of this service"
            className="min-h-[80px] border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--sp-text)] placeholder:text-[var(--sp-text-tertiary)]"
            disabled={isSubmitting}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-[var(--sp-red)]">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupId">Group</Label>
          <Select
            value={groupIdValue ?? "__none__"}
            onValueChange={(value) => {
              setValue("groupId", value === "__none__" ? null : value, {
                shouldValidate: true,
              });
              if (value !== "__new__") {
                setValue("newGroupName", "", { shouldValidate: true });
              }
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="groupId"
              className="w-full border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] text-[var(--sp-text)]"
            >
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b1021] text-[var(--sp-text)] ring-1 ring-[var(--sp-border-strong)]">
              <SelectItem value="__none__">Ungrouped</SelectItem>
              <SelectItem value="__new__">+ Create new group</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.groupId && (
            <p className="text-xs text-[var(--sp-red)]">{errors.groupId.message}</p>
          )}
        </div>

        {groupIdValue === "__new__" && (
          <div className="space-y-2">
            <Label htmlFor="newGroupName">New group name</Label>
            <Input
              id="newGroupName"
              placeholder="e.g. Core Services"
              disabled={isSubmitting}
              {...register("newGroupName")}
            />
            {errors.newGroupName && (
              <p className="text-xs text-[var(--sp-red)]">
                {errors.newGroupName.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="position">Position / order</Label>
          <Input
            id="position"
            type="number"
            disabled={isSubmitting}
            {...register("position")}
          />
          {errors.position && (
            <p className="text-xs text-[var(--sp-red)]">
              {errors.position.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="statusOverride">Status override</Label>
          <Select
            value={watch("statusOverride") ?? "__auto__"}
            onValueChange={(value) =>
              setValue(
                "statusOverride",
                value === "__auto__" ? null : (value as ComponentStatus),
                { shouldValidate: true }
              )
            }
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="statusOverride"
              className="w-full border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] text-[var(--sp-text)]"
            >
              <SelectValue placeholder="Auto (from checks)" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b1021] text-[var(--sp-text)] ring-1 ring-[var(--sp-border-strong)]">
              <SelectItem value="__auto__">Auto (from checks)</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.statusOverride && (
            <p className="text-xs text-[var(--sp-red)]">
              {errors.statusOverride.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <Checkbox
            id="active"
            checked={watch("active")}
            onCheckedChange={(checked) =>
              setValue("active", checked === true, { shouldValidate: true })
            }
            disabled={isSubmitting}
          />
          <Label htmlFor="active" className="font-normal">
            Show on status page
          </Label>
        </div>
      </div>

      <Separator className="bg-[var(--sp-border)]" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--sp-text)]">
            Health checks
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(defaultCheck())}
            disabled={isSubmitting}
            className="gap-1 border-[var(--sp-border)] text-[var(--sp-text)] hover:bg-[var(--sp-surface-hover)]"
          >
            <PlusIcon className="h-4 w-4" />
            Add check
          </Button>
        </div>

        {errors.checks?.root && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--sp-red-soft)] p-3 text-sm text-[var(--sp-red)] ring-1 ring-[var(--sp-red)]/20">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            {errors.checks.root.message}
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const checkType = watch(`checks.${index}.type`);
            const checkErrors = errors.checks?.[index];

            return (
              <div
                key={field.id}
                className="rounded-xl border border-[var(--sp-border)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-4 w-4 text-[var(--sp-text-tertiary)]" />
                    <span className="text-sm font-medium text-[var(--sp-text)]">
                      Check {index + 1}
                    </span>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                      className="h-8 gap-1 text-[var(--sp-red)] hover:bg-[var(--sp-red-soft)]"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`checks.${index}.name`}>Check name</Label>
                    <Input
                      id={`checks.${index}.name`}
                      placeholder="e.g. Health endpoint"
                      disabled={isSubmitting}
                      {...register(`checks.${index}.name`)}
                    />
                    {checkErrors?.name && (
                      <p className="text-xs text-[var(--sp-red)]">
                        {checkErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`checks.${index}.type`}>Check type</Label>
                    <Select
                      value={checkType}
                      onValueChange={(value) =>
                        setValue(
                          `checks.${index}.type`,
                          value as "http" | "heartbeat",
                          { shouldValidate: true }
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id={`checks.${index}.type`}
                        className="w-full border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] text-[var(--sp-text)]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b1021] text-[var(--sp-text)] ring-1 ring-[var(--sp-border-strong)]">
                        {checkTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {checkErrors?.type && (
                      <p className="text-xs text-[var(--sp-red)]">
                        {checkErrors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`checks.${index}.target`}>
                      Target URL / identifier
                    </Label>
                    <Input
                      id={`checks.${index}.target`}
                      placeholder="https://api.example.com/health"
                      disabled={isSubmitting}
                      {...register(`checks.${index}.target`)}
                    />
                    {checkErrors?.target && (
                      <p className="text-xs text-[var(--sp-red)]">
                        {checkErrors.target.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                    <div className="space-y-2">
                      <Label htmlFor={`checks.${index}.timeout`}>
                        Timeout (seconds)
                      </Label>
                      <Input
                        id={`checks.${index}.timeout`}
                        type="number"
                        disabled={isSubmitting}
                        {...register(`checks.${index}.timeout`)}
                      />
                      {checkErrors?.timeout && (
                        <p className="text-xs text-[var(--sp-red)]">
                          {checkErrors.timeout.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`checks.${index}.interval`}>
                        Interval (seconds)
                      </Label>
                      <Input
                        id={`checks.${index}.interval`}
                        type="number"
                        disabled={isSubmitting}
                        {...register(`checks.${index}.interval`)}
                      />
                      {checkErrors?.interval && (
                        <p className="text-xs text-[var(--sp-red)]">
                          {checkErrors.interval.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {checkType === "http" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`checks.${index}.expectedStatus`}>
                          Expected HTTP status
                        </Label>
                        <Input
                          id={`checks.${index}.expectedStatus`}
                          type="number"
                          placeholder="200"
                          disabled={isSubmitting}
                          {...register(`checks.${index}.expectedStatus`)}
                        />
                        {checkErrors?.expectedStatus && (
                          <p className="text-xs text-[var(--sp-red)]">
                            {checkErrors.expectedStatus.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`checks.${index}.method`}>Method</Label>
                        <Select
                          value={watch(`checks.${index}.method`)}
                          onValueChange={(value) =>
                            setValue(
                              `checks.${index}.method`,
                              value as (typeof methodOptions)[number],
                              { shouldValidate: true }
                            )
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id={`checks.${index}.method`}
                            className="w-full border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] text-[var(--sp-text)]"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b1021] text-[var(--sp-text)] ring-1 ring-[var(--sp-border-strong)]">
                            {methodOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {checkErrors?.method && (
                          <p className="text-xs text-[var(--sp-red)]">
                            {checkErrors.method.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`checks.${index}.headers`}>
                          Headers JSON (optional)
                        </Label>
                        <Textarea
                          id={`checks.${index}.headers`}
                          placeholder='{"Authorization":"Bearer token"}'
                          className="min-h-[80px] border-[var(--sp-border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--sp-text)] placeholder:text-[var(--sp-text-tertiary)]"
                          disabled={isSubmitting}
                          {...register(`checks.${index}.headers`)}
                        />
                        {checkErrors?.headers && (
                          <p className="text-xs text-[var(--sp-red)]">
                            {checkErrors.headers.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Checkbox
                      id={`checks.${index}.enabled`}
                      checked={watch(`checks.${index}.enabled`)}
                      onCheckedChange={(checked) =>
                        setValue(`checks.${index}.enabled`, checked === true, {
                          shouldValidate: true,
                        })
                      }
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={`checks.${index}.enabled`}
                      className="font-normal"
                    >
                      Enabled
                    </Label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[var(--sp-border-strong)] text-[var(--sp-text)] hover:bg-[var(--sp-surface-hover)]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--sp-emerald)] text-[#020617] hover:bg-[var(--sp-emerald)]/90"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Create component"
          )}
        </Button>
      </div>
    </form>
  );
}
