import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";

import {
  insertAssetSchema,
  insertScanJobSchema,
  insertVulnerabilitySchema,
  insertComplianceScoreSchema,
  insertReportSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
setupAuth(app);
  // Auth routes
  app.get('/api/auth/user' ,isAuthenticated,async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const metrics = await storage.getDashboardMetrics(user.organizationId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Assets routes
  app.get('/api/assets' , isAuthenticated,async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const assets = await storage.getAssets(user.organizationId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post('/api/assets' ,isAuthenticated,async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertAssetSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.put('/api/assets/:id' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const assetId = parseInt(req.params.id);
      const updates = req.body;

      const asset = await storage.updateAsset(assetId, user.organizationId, updates);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  app.delete('/api/assets/:id' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const assetId = parseInt(req.params.id);
      const deleted = await storage.deleteAsset(assetId, user.organizationId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Scan jobs routes
  app.get('/api/scans' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const scans = await storage.getScanJobs(user.organizationId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  app.post('/api/scans' , isAuthenticated,async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertScanJobSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
        createdBy: user.id,
        status: 'pending',
      });

      const scanJob = await storage.createScanJob(validatedData);
      
      // TODO: Trigger actual scan execution here
      // This would involve calling security tools like nmap, OWASP ZAP, etc.
      
      res.status(201).json(scanJob);
    } catch (error) {
      console.error("Error creating scan:", error);
      res.status(500).json({ message: "Failed to create scan" });
    }
  });

  // Vulnerabilities routes
  app.get('/api/vulnerabilities' ,isAuthenticated,async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const vulnerabilities = await storage.getVulnerabilities(user.organizationId);
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ message: "Failed to fetch vulnerabilities" });
    }
  });

  app.put('/api/vulnerabilities/:id' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const vulnerabilityId = parseInt(req.params.id);
      const updates = req.body;

      const vulnerability = await storage.updateVulnerability(vulnerabilityId, user.organizationId, updates);
      if (!vulnerability) {
        return res.status(404).json({ message: "Vulnerability not found" });
      }

      res.json(vulnerability);
    } catch (error) {
      console.error("Error updating vulnerability:", error);
      res.status(500).json({ message: "Failed to update vulnerability" });
    }
  });

  // IAM records routes
  app.get('/api/iam-records' , isAuthenticated,async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const iamRecords = await storage.getIamRecords(user.organizationId);
      res.json(iamRecords);
    } catch (error) {
      console.error("Error fetching IAM records:", error);
      res.status(500).json({ message: "Failed to fetch IAM records" });
    }
  });

  // Compliance routes
  app.get('/api/compliance' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const complianceScores = await storage.getComplianceScores(user.organizationId);
      res.json(complianceScores);
    } catch (error) {
      console.error("Error fetching compliance scores:", error);
      res.status(500).json({ message: "Failed to fetch compliance scores" });
    }
  });

  app.post('/api/compliance' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertComplianceScoreSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
      });

      const complianceScore = await storage.createComplianceScore(validatedData);
      res.status(201).json(complianceScore);
    } catch (error) {
      console.error("Error creating compliance score:", error);
      res.status(500).json({ message: "Failed to create compliance score" });
    }
  });

  // Reports routes
  app.get('/api/reports' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const reports = await storage.getReports(user.organizationId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports' ,isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertReportSchema.parse({
        ...req.body,
        organizationId: user.organizationId,
        generatedBy: user.id,
        status: 'generating',
      });

      const report = await storage.createReport(validatedData);
      
      // TODO: Trigger actual PDF generation here
      // This would involve calling PDF generation service
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
