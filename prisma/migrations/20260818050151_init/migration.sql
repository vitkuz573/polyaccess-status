-- CreateEnum
CREATE TYPE "component_status" AS ENUM ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance');

-- CreateEnum
CREATE TYPE "check_type" AS ENUM ('http', 'https', 'tcp', 'challenge_proxy_health');

-- CreateEnum
CREATE TYPE "incident_impact" AS ENUM ('none', 'minor', 'major', 'critical');

-- CreateEnum
CREATE TYPE "incident_status" AS ENUM ('investigating', 'identified', 'monitoring', 'resolved');

-- CreateEnum
CREATE TYPE "maintenance_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "subscriber_channel" AS ENUM ('email', 'webhook', 'slack', 'discord');

-- CreateEnum
CREATE TYPE "status_page_role" AS ENUM ('admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('component_create', 'component_update', 'component_delete', 'incident_create', 'incident_update', 'incident_resolve', 'maintenance_create', 'maintenance_update', 'maintenance_cancel', 'subscriber_create', 'subscriber_delete', 'page_update');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_pages" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "custom_css" TEXT,
    "custom_domain" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_groups" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status_page_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "components" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "component_status" NOT NULL DEFAULT 'operational',
    "position" INTEGER NOT NULL DEFAULT 0,
    "status_page_id" UUID NOT NULL,
    "group_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checks" (
    "id" UUID NOT NULL,
    "type" "check_type" NOT NULL,
    "target" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 60,
    "timeout" INTEGER NOT NULL DEFAULT 10,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "component_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_results" (
    "id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "response_time_ms" INTEGER,
    "status_code" INTEGER,
    "message" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'default',
    "check_id" UUID NOT NULL,

    CONSTRAINT "check_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "impact" "incident_impact" NOT NULL DEFAULT 'none',
    "status" "incident_status" NOT NULL DEFAULT 'investigating',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "status_page_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_updates" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "status" "incident_status" NOT NULL,
    "incident_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_components" (
    "incident_id" UUID NOT NULL,
    "component_id" UUID NOT NULL,

    CONSTRAINT "incident_components_pkey" PRIMARY KEY ("incident_id","component_id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "maintenance_status" NOT NULL DEFAULT 'scheduled',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "status_page_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_components" (
    "maintenance_id" UUID NOT NULL,
    "component_id" UUID NOT NULL,

    CONSTRAINT "maintenance_components_pkey" PRIMARY KEY ("maintenance_id","component_id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "channel" "subscriber_channel" NOT NULL,
    "target" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status_page_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_page_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "key_user_id" TEXT,
    "role" "status_page_role" NOT NULL DEFAULT 'viewer',
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_page_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "action" "audit_action" NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID,
    "metadata" JSONB DEFAULT '{}',
    "actor_email" TEXT,
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "status_pages_slug_key" ON "status_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "status_pages_custom_domain_key" ON "status_pages"("custom_domain");

-- CreateIndex
CREATE INDEX "status_pages_organization_id_idx" ON "status_pages"("organization_id");

-- CreateIndex
CREATE INDEX "status_pages_is_public_idx" ON "status_pages"("is_public");

-- CreateIndex
CREATE INDEX "component_groups_status_page_id_idx" ON "component_groups"("status_page_id");

-- CreateIndex
CREATE INDEX "components_status_page_id_idx" ON "components"("status_page_id");

-- CreateIndex
CREATE INDEX "components_status_page_id_status_idx" ON "components"("status_page_id", "status");

-- CreateIndex
CREATE INDEX "components_group_id_idx" ON "components"("group_id");

-- CreateIndex
CREATE INDEX "checks_component_id_idx" ON "checks"("component_id");

-- CreateIndex
CREATE INDEX "checks_enabled_idx" ON "checks"("enabled");

-- CreateIndex
CREATE INDEX "check_results_check_id_checked_at_idx" ON "check_results"("check_id", "checked_at");

-- CreateIndex
CREATE INDEX "check_results_checked_at_idx" ON "check_results"("checked_at");

-- CreateIndex
CREATE INDEX "incidents_status_page_id_status_idx" ON "incidents"("status_page_id", "status");

-- CreateIndex
CREATE INDEX "incidents_status_page_id_started_at_idx" ON "incidents"("status_page_id", "started_at");

-- CreateIndex
CREATE INDEX "incidents_resolved_at_idx" ON "incidents"("resolved_at");

-- CreateIndex
CREATE INDEX "incident_updates_incident_id_created_at_idx" ON "incident_updates"("incident_id", "created_at");

-- CreateIndex
CREATE INDEX "maintenances_status_page_id_status_idx" ON "maintenances"("status_page_id", "status");

-- CreateIndex
CREATE INDEX "maintenances_starts_at_idx" ON "maintenances"("starts_at");

-- CreateIndex
CREATE INDEX "subscribers_status_page_id_active_idx" ON "subscribers"("status_page_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_status_page_id_channel_target_key" ON "subscribers"("status_page_id", "channel", "target");

-- CreateIndex
CREATE UNIQUE INDEX "status_page_users_organization_id_email_key" ON "status_page_users"("organization_id", "email");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_created_at_idx" ON "audit_logs"("organization_id", "created_at");

-- AddForeignKey
ALTER TABLE "status_pages" ADD CONSTRAINT "status_pages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_groups" ADD CONSTRAINT "component_groups_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "component_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_results" ADD CONSTRAINT "check_results_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_updates" ADD CONSTRAINT "incident_updates_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_components" ADD CONSTRAINT "incident_components_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_components" ADD CONSTRAINT "incident_components_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_components" ADD CONSTRAINT "maintenance_components_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_components" ADD CONSTRAINT "maintenance_components_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_page_users" ADD CONSTRAINT "status_page_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
