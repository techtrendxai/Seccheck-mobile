import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ScanResult } from "@shared/schema";

interface QuickReportProps {
  scanHistory: ScanResult[];
}

export default function QuickReport({ scanHistory }: QuickReportProps) {
  const recentScans = scanHistory.slice(0, 10);
  const completedScans = recentScans.filter(scan => scan.status === "completed");
  
  const riskSummary = {
    high: 0,
    medium: 0,
    low: 0
  };

  completedScans.forEach(scan => {
    if (scan.scanType === "vuln" && scan.results?.data?.riskLevel) {
      riskSummary[scan.results.data.riskLevel as keyof typeof riskSummary]++;
    }
    if (scan.scanType === "credentials" && scan.results?.data?.riskLevel === "high") {
      riskSummary.high++;
    }
    if (scan.scanType === "network" && scan.results?.data?.securitySummary?.overallRisk) {
      const risk = scan.results.data.securitySummary.overallRisk;
      riskSummary[risk as keyof typeof riskSummary]++;
    }
  });

  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalScans: completedScans.length,
        riskDistribution: riskSummary,
        overallRisk: riskSummary.high > 0 ? "HIGH" : riskSummary.medium > 0 ? "MEDIUM" : "LOW"
      },
      scans: completedScans.map(scan => ({
        type: scan.scanType,
        target: scan.target,
        status: scan.status,
        timestamp: scan.createdAt,
        findings: scan.results
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-secondary border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Security Summary</span>
          </div>
          <Button onClick={generateReport} variant="outline" size="sm">
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-destructive/10 rounded">
            <div className="text-lg font-bold text-destructive">{riskSummary.high}</div>
            <div className="text-xs text-muted-foreground">High Risk</div>
          </div>
          <div className="p-2 bg-warning/10 rounded">
            <div className="text-lg font-bold text-warning">{riskSummary.medium}</div>
            <div className="text-xs text-muted-foreground">Medium Risk</div>
          </div>
          <div className="p-2 bg-primary/10 rounded">
            <div className="text-lg font-bold text-primary">{riskSummary.low}</div>
            <div className="text-xs text-muted-foreground">Low Risk</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Recent Scans:</span>
            <Badge variant="secondary">{completedScans.length}</Badge>
          </div>
          
          {recentScans.slice(0, 3).map((scan, index) => (
            <div key={scan.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
              <div className="flex items-center">
                {scan.status === "completed" ? (
                  <CheckCircle className="mr-1 h-3 w-3 text-primary" />
                ) : scan.status === "failed" ? (
                  <AlertTriangle className="mr-1 h-3 w-3 text-destructive" />
                ) : (
                  <Clock className="mr-1 h-3 w-3 text-warning" />
                )}
                <span className="capitalize">{scan.scanType}</span>
              </div>
              <span className="text-muted-foreground truncate max-w-20">{scan.target}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}