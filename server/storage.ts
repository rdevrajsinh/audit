import {
  users,
  organizations,
  assets,
  scanJobs,
  vulnerabilities,
  iamRecords,
  complianceScores,
  reports,
  type User,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
  type Asset,
  type InsertAsset,
  type ScanJob,
  type InsertScanJob,
  type Vulnerability,
  type InsertVulnerability,
  type IamRecord,
  type InsertIamRecord,
  type ComplianceScore,
  type InsertComplianceScore,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - local authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  
  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Asset operations
  getAssets(organizationId: string): Promise<Asset[]>;
  getAsset(id: number, organizationId: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, organizationId: string, updates: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: number, organizationId: string): Promise<boolean>;
  
  // Scan job operations
  getScanJobs(organizationId: string): Promise<ScanJob[]>;
  getScanJob(id: number, organizationId: string): Promise<ScanJob | undefined>;
  createScanJob(scanJob: InsertScanJob): Promise<ScanJob>;
  updateScanJob(id: number, organizationId: string, updates: Partial<InsertScanJob>): Promise<ScanJob | undefined>;
  
  // Vulnerability operations
  getVulnerabilities(organizationId: string): Promise<Vulnerability[]>;
  getVulnerability(id: number, organizationId: string): Promise<Vulnerability | undefined>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerability(id: number, organizationId: string, updates: Partial<InsertVulnerability>): Promise<Vulnerability | undefined>;
  
  // IAM records operations
  getIamRecords(organizationId: string): Promise<IamRecord[]>;
  createIamRecord(record: InsertIamRecord): Promise<IamRecord>;
  
  // Compliance operations
  getComplianceScores(organizationId: string): Promise<ComplianceScore[]>;
  getLatestComplianceScore(organizationId: string, framework: string): Promise<ComplianceScore | undefined>;
  createComplianceScore(score: InsertComplianceScore): Promise<ComplianceScore>;
  
  // Report operations
  getReports(organizationId: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, organizationId: string, updates: Partial<InsertReport>): Promise<Report | undefined>;
  
  // Dashboard metrics
  getDashboardMetrics(organizationId: string): Promise<{
    totalAssets: number;
    criticalVulnerabilities: number;
    activeScans: number;
    averageComplianceScore: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - local authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Organization operations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(org).returning();
    return organization;
  }

  // Asset operations
  async getAssets(organizationId: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.organizationId, organizationId)).orderBy(desc(assets.createdAt));
  }

  async getAsset(id: number, organizationId: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(and(eq(assets.id, id), eq(assets.organizationId, organizationId)));
    return asset;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: number, organizationId: string, updates: Partial<InsertAsset>): Promise<Asset | undefined> {
    const [asset] = await db
      .update(assets)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(assets.id, id), eq(assets.organizationId, organizationId)))
      .returning();
    return asset;
  }

  async deleteAsset(id: number, organizationId: string): Promise<boolean> {
    const result = await db.delete(assets).where(and(eq(assets.id, id), eq(assets.organizationId, organizationId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Scan job operations
  async getScanJobs(organizationId: string): Promise<ScanJob[]> {
    return await db.select().from(scanJobs).where(eq(scanJobs.organizationId, organizationId)).orderBy(desc(scanJobs.createdAt));
  }

  async getScanJob(id: number, organizationId: string): Promise<ScanJob | undefined> {
    const [scanJob] = await db.select().from(scanJobs).where(and(eq(scanJobs.id, id), eq(scanJobs.organizationId, organizationId)));
    return scanJob;
  }

  async createScanJob(scanJob: InsertScanJob): Promise<ScanJob> {
    const [newScanJob] = await db.insert(scanJobs).values(scanJob).returning();
    return newScanJob;
  }

  async updateScanJob(id: number, organizationId: string, updates: Partial<InsertScanJob>): Promise<ScanJob | undefined> {
    const [scanJob] = await db
      .update(scanJobs)
      .set(updates)
      .where(and(eq(scanJobs.id, id), eq(scanJobs.organizationId, organizationId)))
      .returning();
    return scanJob;
  }

  // Vulnerability operations
  async getVulnerabilities(organizationId: string): Promise<Vulnerability[]> {
    return await db.select().from(vulnerabilities).where(eq(vulnerabilities.organizationId, organizationId)).orderBy(desc(vulnerabilities.createdAt));
  }

  async getVulnerability(id: number, organizationId: string): Promise<Vulnerability | undefined> {
    const [vulnerability] = await db.select().from(vulnerabilities).where(and(eq(vulnerabilities.id, id), eq(vulnerabilities.organizationId, organizationId)));
    return vulnerability;
  }

  async createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [newVulnerability] = await db.insert(vulnerabilities).values(vulnerability).returning();
    return newVulnerability;
  }

  async updateVulnerability(id: number, organizationId: string, updates: Partial<InsertVulnerability>): Promise<Vulnerability | undefined> {
    const [vulnerability] = await db
      .update(vulnerabilities)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(vulnerabilities.id, id), eq(vulnerabilities.organizationId, organizationId)))
      .returning();
    return vulnerability;
  }

  // IAM records operations
  async getIamRecords(organizationId: string): Promise<IamRecord[]> {
    return await db.select().from(iamRecords).where(eq(iamRecords.organizationId, organizationId)).orderBy(desc(iamRecords.createdAt));
  }

  async createIamRecord(record: InsertIamRecord): Promise<IamRecord> {
    const [newRecord] = await db.insert(iamRecords).values(record).returning();
    return newRecord;
  }

  // Compliance operations
  async getComplianceScores(organizationId: string): Promise<ComplianceScore[]> {
    return await db.select().from(complianceScores).where(eq(complianceScores.organizationId, organizationId)).orderBy(desc(complianceScores.assessmentDate));
  }

  async getLatestComplianceScore(organizationId: string, framework: string): Promise<ComplianceScore | undefined> {
    const [score] = await db
      .select()
      .from(complianceScores)
      .where(and(eq(complianceScores.organizationId, organizationId), eq(complianceScores.framework, framework)))
      .orderBy(desc(complianceScores.assessmentDate))
      .limit(1);
    return score;
  }

  async createComplianceScore(score: InsertComplianceScore): Promise<ComplianceScore> {
    const [newScore] = await db.insert(complianceScores).values(score).returning();
    return newScore;
  }

  // Report operations
  async getReports(organizationId: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.organizationId, organizationId)).orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReport(id: number, organizationId: string, updates: Partial<InsertReport>): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set(updates)
      .where(and(eq(reports.id, id), eq(reports.organizationId, organizationId)))
      .returning();
    return report;
  }

  // Dashboard metrics
  async getDashboardMetrics(organizationId: string): Promise<{
    totalAssets: number;
    criticalVulnerabilities: number;
    activeScans: number;
    averageComplianceScore: number;
  }> {
    const [assetCount] = await db
      .select({ count: count() })
      .from(assets)
      .where(eq(assets.organizationId, organizationId));

    const [criticalVulnCount] = await db
      .select({ count: count() })
      .from(vulnerabilities)
      .where(and(eq(vulnerabilities.organizationId, organizationId), eq(vulnerabilities.severity, 'critical'), eq(vulnerabilities.status, 'open')));

    const [activeScanCount] = await db
      .select({ count: count() })
      .from(scanJobs)
      .where(and(eq(scanJobs.organizationId, organizationId), eq(scanJobs.status, 'running')));

    const complianceData = await db
      .select({ score: complianceScores.score, maxScore: complianceScores.maxScore })
      .from(complianceScores)
      .where(eq(complianceScores.organizationId, organizationId));

    const averageComplianceScore = complianceData.length > 0
      ? Math.round(complianceData.reduce((acc: number, cs: { score: number; maxScore: number }) => acc + (cs.score / cs.maxScore * 100), 0) / complianceData.length)
      : 0;

    return {
      totalAssets: assetCount.count,
      criticalVulnerabilities: criticalVulnCount.count,
      activeScans: activeScanCount.count,
      averageComplianceScore,
    };
  }
}

export const storage = new DatabaseStorage();
