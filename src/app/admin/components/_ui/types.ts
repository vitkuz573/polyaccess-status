import { Component, ComponentGroup, Check, CheckResult } from "@prisma/client";

export type ComponentWithChecks = Component & {
  group: ComponentGroup | null;
  checks: (Check & { results: CheckResult[] })[];
};

export type GroupOption = {
  id: string;
  name: string;
  position: number;
};
