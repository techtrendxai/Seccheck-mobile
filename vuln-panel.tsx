import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import TerminalOutput from "@/components/terminal-output";
import { useScanner } from "@/hooks/use-scanner";
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function VulnPanel() {
  const [targetUrl, setTargetUrl] = useState("");
  const [options, setOptions] = useState({
    sslCheck: true,
    headersAnalysis: true,
    commonVulns: false,
  });
  const { performScan, currentScan, scanHistory } = useScanner();

  const handleVulnScan = async () => {
    if (!targetUrl.trim()) return;
    await performScan("vuln", targetUrl, options);
  };

  const getProgressValue = () => {
    if (!currentScan || currentScan.status !== "running") return 0;
    return 75; // Simulated progress
  };

  const renderVulnResults = () => {
    if (!currentScan?.results?.data?.vulnerabilities) return null;

    const { vulnerabilities } = currentScan.results.data;

    return (
      <div className="space-y-3 p-4">
        {vulnerabilities.map((vuln: any, index: number) => {
          const Icon = vuln.severity === "high" ? XCircle : 
                     vuln.severity === "medium" ? AlertTriangle : CheckCircle;
          const bgColor = vuln.severity === "high" ? "bg-destructive/20 border-destructive" :
                         vuln.severity === "medium" ? "bg-warning/20 border-warning" : 
                         "bg-primary/20 border-primary";
          const iconColor = vuln.severity === "high" ? "text-destructive" :
                           vuln.severity === "medium" ? "text-warning" : 
                           "text-primary";

          return (
            <Card key={index} className={`${bgColor} border`}>
              <CardContent className="p-3">
                <div className="flex items-center">
                  <Icon className={`${iconColor} mr-2 h-4 w-4`} />
                  <span className="text-sm font-medium">{vuln.description}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{vuln.risk}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="tool-panel">
      <div className="bg-secondary p-4 border-b border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url" className="text-sm font-medium text-muted-foreground">
              Target URL
            </Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-muted border-border text-foreground placeholder-muted-foreground mt-2"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="ssl"
                checked={options.sslCheck}
                onCheckedChange={(checked) => setOptions({...options, sslCheck: !!checked})}
              />
              <Label htmlFor="ssl" className="text-sm">SSL/TLS Check</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="headers"
                checked={options.headersAnalysis}
                onCheckedChange={(checked) => setOptions({...options, headersAnalysis: !!checked})}
              />
              <Label htmlFor="headers" className="text-sm">HTTP Headers Analysis</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="vulns"
                checked={options.commonVulns}
                onCheckedChange={(checked) => setOptions({...options, commonVulns: !!checked})}
              />
              <Label htmlFor="vulns" className="text-sm">Common Vulnerabilities</Label>
            </div>
          </div>
          
          <Button
            onClick={handleVulnScan}
            disabled={!targetUrl.trim() || currentScan?.status === "running"}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Start Vulnerability Scan
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-background">
        {currentScan?.status === "running" && (
          <div className="p-4">
            <Card className="bg-muted">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Scanning Progress</span>
                  <span className="text-sm text-muted-foreground">{getProgressValue()}%</span>
                </div>
                <Progress value={getProgressValue()} className="w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {renderVulnResults()}
        
        <TerminalOutput 
          currentScan={currentScan} 
          scanHistory={scanHistory}
          scanType="vuln"
        />
      </div>
    </div>
  );
}
