ALTER TABLE "invitations" ALTER COLUMN "staff_role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "staff_role" SET DATA TYPE text;--> statement-breakpoint
-- Staff roles now come from Descope (Owner, Employee, Contractor). Map the old values so existing
-- rows survive the type change; each person's role is refreshed from Descope at their next sign-in.
UPDATE "users" SET "staff_role" = CASE "staff_role" WHEN 'superadmin' THEN 'owner' WHEN 'admin' THEN 'employee' WHEN 'sales' THEN 'employee' WHEN 'delivery' THEN 'contractor' ELSE "staff_role" END WHERE "staff_role" IS NOT NULL;--> statement-breakpoint
UPDATE "invitations" SET "staff_role" = CASE "staff_role" WHEN 'superadmin' THEN 'owner' WHEN 'admin' THEN 'employee' WHEN 'sales' THEN 'employee' WHEN 'delivery' THEN 'contractor' ELSE "staff_role" END WHERE "staff_role" IS NOT NULL;--> statement-breakpoint
DROP TYPE "public"."staff_role";--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('owner', 'employee', 'contractor');--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "staff_role" SET DATA TYPE "public"."staff_role" USING "staff_role"::"public"."staff_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "staff_role" SET DATA TYPE "public"."staff_role" USING "staff_role"::"public"."staff_role";--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_descope_tenant_uq" ON "organizations" USING btree ("descope_tenant_id");