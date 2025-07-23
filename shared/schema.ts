import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // super_admin, org_admin, auditor, user
  organizationId: varchar("organization_id").references(() => organizations.id),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations table for multi-tenancy
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().notNull().default("gen_random_uuid()"),
  name: varchar("name").notNull(),
  domain: varchar("domain"),
  logo: varchar("logo"),
  timezone: varchar("timezone").default("UTC"),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // web_app, server, database, cloud_service, network_device
  ip: varchar("ip"),
  domain: varchar("domain"),
  port: integer("port"),
  tags: text("tags").array().default([]),
  metadata: jsonb("metadata").default({}),
  status: varchar("status").default("active"), // active, inactive, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scan jobs table
export const scanJobs = pgTable("scan_jobs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  assetId: integer("asset_id").references(() => assets.id),
  type: varchar("type").notNull(), // vulnerability, iam, cloud_config, asset_discovery
  name: varchar("name").notNull(),
  status: varchar("status").default("pending"), // pending, running, completed, failed
  progress: integer("progress").default(0),
  results: jsonb("results").default({}),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vulnerabilities table
export const vulnerabilities = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  assetId: integer("asset_id").references(() => assets.id),
  scanJobId: integer("scan_job_id").references(() => scanJobs.id),
  name: varchar("name").notNull(),
  severity: varchar("severity").notNull(), // critical, high, medium, low, info
  cvssScore: decimal("cvss_score", { precision: 3, scale: 1 }),
  description: text("description"),
  endpoint: varchar("endpoint"),
  recommendation: text("recommendation"),
  status: varchar("status").default("open"), // open, in_progress, resolved, false_positive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// IAM records table
export const iamRecords = pgTable("iam_records", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  scanJobId: integer("scan_job_id").references(() => scanJobs.id),
  platform: varchar("platform").notNull(), // aws, google_workspace, microsoft365
  userEmail: varchar("user_email").notNull(),
  role: varchar("role"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  lastLogin: timestamp("last_login"),
  permissions: text("permissions").array().default([]),
  isOverPrivileged: boolean("is_over_privileged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance scores table
export const complianceScores = pgTable("compliance_scores", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  framework: varchar("framework").notNull(), // iso_27001, soc2, gdpr
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  gaps: jsonb("gaps").default([]),
  recommendations: jsonb("recommendations").default([]),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // executive, technical, compliance
  fileUrl: varchar("file_url"),
  status: varchar("status").default("generating"), // generating, completed, failed
  parameters: jsonb("parameters").default({}),
  generatedBy: varchar("generated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  assets: many(assets),
  scanJobs: many(scanJobs),
  vulnerabilities: many(vulnerabilities),
  iamRecords: many(iamRecords),
  complianceScores: many(complianceScores),
  reports: many(reports),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  scanJobs: many(scanJobs),
  reports: many(reports),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [assets.organizationId],
    references: [organizations.id],
  }),
  scanJobs: many(scanJobs),
  vulnerabilities: many(vulnerabilities),
}));

export const scanJobsRelations = relations(scanJobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [scanJobs.organizationId],
    references: [organizations.id],
  }),
  asset: one(assets, {
    fields: [scanJobs.assetId],
    references: [assets.id],
  }),
  createdBy: one(users, {
    fields: [scanJobs.createdBy],
    references: [users.id],
  }),
  vulnerabilities: many(vulnerabilities),
  iamRecords: many(iamRecords),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one }) => ({
  organization: one(organizations, {
    fields: [vulnerabilities.organizationId],
    references: [organizations.id],
  }),
  asset: one(assets, {
    fields: [vulnerabilities.assetId],
    references: [assets.id],
  }),
  scanJob: one(scanJobs, {
    fields: [vulnerabilities.scanJobId],
    references: [scanJobs.id],
  }),
}));

export const iamRecordsRelations = relations(iamRecords, ({ one }) => ({
  organization: one(organizations, {
    fields: [iamRecords.organizationId],
    references: [organizations.id],
  }),
  scanJob: one(scanJobs, {
    fields: [iamRecords.scanJobId],
    references: [scanJobs.id],
  }),
}));

export const complianceScoresRelations = relations(complianceScores, ({ one }) => ({
  organization: one(organizations, {
    fields: [complianceScores.organizationId],
    references: [organizations.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  organization: one(organizations, {
    fields: [reports.organizationId],
    references: [organizations.id],
  }),
  generatedBy: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScanJobSchema = createInsertSchema(scanJobs).omit({ id: true, createdAt: true });
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIamRecordSchema = createInsertSchema(iamRecords).omit({ id: true, createdAt: true });
export const insertComplianceScoreSchema = createInsertSchema(complianceScores).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });

// Insert schemas for users
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type ScanJob = typeof scanJobs.$inferSelect;
export type InsertScanJob = z.infer<typeof insertScanJobSchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type IamRecord = typeof iamRecords.$inferSelect;
export type InsertIamRecord = z.infer<typeof insertIamRecordSchema>;
export type ComplianceScore = typeof complianceScores.$inferSelect;
export type InsertComplianceScore = z.infer<typeof insertComplianceScoreSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
