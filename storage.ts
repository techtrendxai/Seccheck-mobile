import { scanResults, type ScanResult, type InsertScanResult } from "@shared/schema";

export interface IStorage {
  createScanResult(scanResult: InsertScanResult): Promise<ScanResult>;
  getScanResult(id: number): Promise<ScanResult | undefined>;
  getScanResults(limit?: number): Promise<ScanResult[]>;
  updateScanResult(id: number, updates: Partial<InsertScanResult>): Promise<ScanResult | undefined>;
}

export class MemStorage implements IStorage {
  private scanResults: Map<number, ScanResult>;
  private currentId: number;

  constructor() {
    this.scanResults = new Map();
    this.currentId = 1;
  }

  async createScanResult(insertScanResult: InsertScanResult): Promise<ScanResult> {
    const id = this.currentId++;
    const scanResult: ScanResult = { 
      ...insertScanResult, 
      id,
      createdAt: new Date(),
      status: insertScanResult.status || "running"
    };
    this.scanResults.set(id, scanResult);
    return scanResult;
  }

  async getScanResult(id: number): Promise<ScanResult | undefined> {
    return this.scanResults.get(id);
  }

  async getScanResults(limit = 50): Promise<ScanResult[]> {
    return Array.from(this.scanResults.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateScanResult(id: number, updates: Partial<InsertScanResult>): Promise<ScanResult | undefined> {
    const existing = this.scanResults.get(id);
    if (!existing) return undefined;

    const updated: ScanResult = { ...existing, ...updates };
    this.scanResults.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
