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

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const metrics = await storage.getDashboardMetrics(req.user.organizationId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Assets routes
  app.get('/api/assets', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const assets = await storage.getAssets(req.user.organizationId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post('/api/assets', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertAssetSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
      });

      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.put('/api/assets/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const assetId = parseInt(req.params.id);
      const updates = req.body;

      const asset = await storage.updateAsset(assetId, req.user.organizationId, updates);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  app.delete('/api/assets/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const assetId = parseInt(req.params.id);
      const deleted = await storage.deleteAsset(assetId, req.user.organizationId);
      
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
  app.get('/api/scans', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const scans = await storage.getScanJobs(req.user.organizationId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  app.post('/api/scans', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertScanJobSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
        createdBy: req.user.id,
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
  app.get('/api/vulnerabilities', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const vulnerabilities = await storage.getVulnerabilities(req.user.organizationId);
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ message: "Failed to fetch vulnerabilities" });
    }
  });

  app.put('/api/vulnerabilities/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const vulnerabilityId = parseInt(req.params.id);
      const updates = req.body;

      const vulnerability = await storage.updateVulnerability(vulnerabilityId, req.user.organizationId, updates);
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
  app.get('/api/iam-records', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const iamRecords = await storage.getIamRecords(req.user.organizationId);
      res.json(iamRecords);
    } catch (error) {
      console.error("Error fetching IAM records:", error);
      res.status(500).json({ message: "Failed to fetch IAM records" });
    }
  });

  // Compliance routes
  app.get('/api/compliance', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const complianceScores = await storage.getComplianceScores(req.user.organizationId);
      res.json(complianceScores);
    } catch (error) {
      console.error("Error fetching compliance scores:", error);
      res.status(500).json({ message: "Failed to fetch compliance scores" });
    }
  });

  app.post('/api/compliance', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertComplianceScoreSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
      });

      const complianceScore = await storage.createComplianceScore(validatedData);
      res.status(201).json(complianceScore);
    } catch (error) {
      console.error("Error creating compliance score:", error);
      res.status(500).json({ message: "Failed to create compliance score" });
    }
  });

  // Reports routes
  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const reports = await storage.getReports(req.user.organizationId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const validatedData = insertReportSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
        generatedBy: req.user.id,
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

  // User profile routes
  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updates = req.body;
      const user = await storage.updateUser(req.user.id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Organization routes
  app.get('/api/organization', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User not associated with an organization" });
      }

      const organization = await storage.getOrganization(req.user.organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  // Notification routes (mock implementation)
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      // Mock notifications data
      const notifications = [
        {
          id: "1",
          type: "security",
          severity: "critical",
          title: "Critical Vulnerability Detected",
          message: "SQL injection vulnerability found in main application database endpoint",
          read: false,
          createdAt: new Date().toISOString(),
          relatedId: "vuln-123"
        },
        {
          id: "2",
          type: "scan",
          severity: "medium",
          title: "Security Scan Completed",
          message: "Asset discovery scan for production environment completed with 15 new assets found",
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          relatedId: "scan-456"
        }
      ];
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/settings', isAuthenticated, async (req: any, res) => {
    try {
      // Mock notification settings
      const settings = {
        emailNotifications: true,
        pushNotifications: false,
        securityAlerts: true,
        scanUpdates: true,
        complianceReports: true,
        weeklyDigest: false,
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
