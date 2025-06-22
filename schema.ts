import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scanResults = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  scanType: text("scan_type").notNull(), // 'whois', 'dns', 'port', 'network', 'vuln'
  target: text("target").notNull(),
  results: jsonb("results").notNull(),
  status: text("status").notNull().default("running"), // 'running', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true,
  createdAt: true,
});

export const scanRequestSchema = z.object({
  scanType: z.enum(['whois', 'dns', 'subdomain', 'headers', 'port', 'network', 'vuln', 'wifi', 'credentials']),
  target: z.string().min(1),
  options: z.record(z.any()).optional(),
});

export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResults.$inferSelect;
export type ScanRequest = z.infer<typeof scanRequestSchema>;
