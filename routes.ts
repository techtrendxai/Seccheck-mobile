import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SecurityScanner } from "./services/scanner";
import { scanRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const scanner = new SecurityScanner();

  // Start a security scan
  app.post("/api/scan", async (req, res) => {
    try {
      const { scanType, target, options } = scanRequestSchema.parse(req.body);

      // Create initial scan result
      const scanResult = await storage.createScanResult({
        scanType,
        target,
        results: {},
        status: "running"
      });

      // Perform scan asynchronously
      (async () => {
        try {
          let result;
          
          switch (scanType) {
            case 'whois':
              result = await scanner.performWhoisLookup(target);
              break;
            case 'dns':
              result = await scanner.performDnsLookup(target);
              break;
            case 'port':
              result = await scanner.performPortScan(target, options);
              break;
            case 'network':
              result = await scanner.performNetworkScan(target);
              break;
            case 'vuln':
              result = await scanner.performVulnScan(target);
              break;
            case 'subdomain':
              // Simplified subdomain enumeration
              result = await scanner.performDnsLookup(target);
              break;
            case 'headers':
              result = await scanner.performVulnScan(target);
              break;
            case 'wifi':
              result = await scanner.performWifiScan(target);
              break;
            case 'credentials':
              result = await scanner.performCredentialCheck(target);
              break;
            default:
              throw new Error(`Unsupported scan type: ${scanType}`);
          }

          await storage.updateScanResult(scanResult.id, {
            results: result,
            status: result.success ? "completed" : "failed"
          });
        } catch (error) {
          await storage.updateScanResult(scanResult.id, {
            results: { error: error instanceof Error ? error.message : "Scan failed" },
            status: "failed"
          });
        }
      })();

      res.json(scanResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get scan result
  app.get("/api/scan/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scanResult = await storage.getScanResult(id);
      
      if (!scanResult) {
        res.status(404).json({ message: "Scan result not found" });
        return;
      }

      res.json(scanResult);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all scan results
  app.get("/api/scans", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const scans = await storage.getScanResults(limit);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
