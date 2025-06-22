import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScanResult } from "@shared/schema";

interface TerminalOutputProps {
  currentScan?: ScanResult | null;
  scanHistory: ScanResult[];
  scanType: string;
}

export default function TerminalOutput({ currentScan, scanHistory, scanType }: TerminalOutputProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentScan, scanHistory]);

  const formatOutput = (scan: ScanResult) => {
    if (!scan.results) return [];

    const lines = [];
    
    // Command line
    lines.push({
      type: "command",
      content: `$ ${scan.scanType} ${scan.target}`
    });

    if (scan.status === "running") {
      lines.push({
        type: "info",
        content: "Scan in progress..."
      });
      return lines;
    }

    if (!scan.results.success) {
      lines.push({
        type: "error",
        content: `Error: ${scan.results.error}`
      });
      return lines;
    }

    // Format based on scan type
    switch (scan.scanType) {
      case "whois":
        if (scan.results.data) {
          lines.push({
            type: "success",
            content: scan.results.data
          });
        }
        break;

      case "dns":
        if (scan.results.data) {
          const { A, AAAA, MX, TXT } = scan.results.data;
          if (A?.length) {
            A.forEach((ip: string) => {
              lines.push({
                type: "success",
                content: `${scan.target}. IN A ${ip}`
              });
            });
          }
          if (AAAA?.length) {
            AAAA.forEach((ip: string) => {
              lines.push({
                type: "success",
                content: `${scan.target}. IN AAAA ${ip}`
              });
            });
          }
          if (MX?.length) {
            MX.forEach((mx: any) => {
              lines.push({
                type: "info",
                content: `${scan.target}. IN MX ${mx.priority} ${mx.exchange}`
              });
            });
          }
        }
        break;

      case "port":
        if (scan.results.data?.openPorts) {
          lines.push({
            type: "info",
            content: `Scan completed for ${scan.results.data.host}`
          });
          scan.results.data.openPorts.forEach((port: any) => {
            lines.push({
              type: "success",
              content: `${port.port}/${port.protocol} open ${port.service}`
            });
          });
        }
        break;

      case "network":
        if (scan.results.data?.activeHosts) {
          lines.push({
            type: "info",
            content: `Network scan results for ${scan.results.data.networkRange}`
          });
          scan.results.data.activeHosts.forEach((host: any) => {
            lines.push({
              type: "success",
              content: `✓ ${host.ip} - ${host.hostname}`
            });
          });
        }
        break;

      case "vuln":
        if (scan.results.data) {
          lines.push({
            type: "info",
            content: `Vulnerability scan completed for ${scan.results.data.url}`
          });
          if (scan.results.data.vulnerabilities?.length) {
            scan.results.data.vulnerabilities.forEach((vuln: any) => {
              lines.push({
                type: vuln.severity === "high" ? "error" : vuln.severity === "medium" ? "warning" : "info",
                content: `[${vuln.severity.toUpperCase()}] ${vuln.description}`
              });
            });
          } else {
            lines.push({
              type: "success",
              content: "No critical vulnerabilities found"
            });
          }
        }
        break;

      case "wifi":
        if (scan.results.data?.analysis) {
          const { analysis } = scan.results.data;
          lines.push({
            type: "info",
            content: `Wi-Fi analysis for ${analysis.networkName}`
          });
          lines.push({
            type: "info",
            content: `Encryption: ${analysis.encryption}, Signal: ${analysis.signalStrength}%`
          });
          if (analysis.securityIssues?.length) {
            analysis.securityIssues.forEach((issue: any) => {
              lines.push({
                type: issue.severity === "high" ? "error" : "warning",
                content: `[${issue.severity.toUpperCase()}] ${issue.issue}`
              });
            });
          } else {
            lines.push({
              type: "success",
              content: "No major Wi-Fi security issues detected"
            });
          }
        }
        break;

      case "credentials":
        if (scan.results.data) {
          const { weakCredentials, riskLevel } = scan.results.data;
          lines.push({
            type: "info",
            content: `Credential check completed for ${scan.target}`
          });
          if (weakCredentials?.length) {
            lines.push({
              type: "error",
              content: `Found ${weakCredentials.length} weak credential(s) - RISK LEVEL: ${riskLevel.toUpperCase()}`
            });
            weakCredentials.forEach((cred: any) => {
              lines.push({
                type: "error",
                content: `Vulnerable: ${cred.username}/${cred.password || "(empty)"} on ${cred.service}`
              });
            });
          } else {
            lines.push({
              type: "success",
              content: "No default credentials found"
            });
          }
        }
        break;
    }

    return lines;
  };

  const copyOutput = () => {
    const allOutput = scanHistory
      .filter(scan => scan.scanType === scanType)
      .map(scan => formatOutput(scan).map(line => line.content).join('\n'))
      .join('\n\n');
    
    navigator.clipboard.writeText(allOutput);
    toast({
      title: "Copied to clipboard",
      description: "Terminal output has been copied to your clipboard.",
    });
  };

  const exportOutput = () => {
    const allOutput = scanHistory
      .filter(scan => scan.scanType === scanType)
      .map(scan => formatOutput(scan).map(line => line.content).join('\n'))
      .join('\n\n');
    
    const blob = new Blob([allOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scanType}-scan-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearOutput = () => {
    // This would typically clear the scan history
    toast({
      title: "Output cleared",
      description: "Terminal output has been cleared.",
    });
  };

  const relevantScans = scanHistory
    .filter(scan => scan.scanType === scanType)
    .slice(-10); // Show last 10 scans

  if (currentScan && !relevantScans.find(s => s.id === currentScan.id)) {
    relevantScans.push(currentScan);
  }

  return (
    <>
      <div className="p-4 flex-1">
        <Card className="bg-background border-border h-96 overflow-hidden">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center text-primary mb-3">
              <Terminal className="mr-2 h-4 w-4" />
              <span className="font-mono text-sm">SecCheck Terminal</span>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 overflow-y-auto terminal-output space-y-1"
            >
              {relevantScans.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  Enter a target and select a scan type to begin...
                </div>
              ) : (
                relevantScans.map((scan, scanIndex) => (
                  <div key={scan.id} className="space-y-1">
                    {formatOutput(scan).map((line, lineIndex) => (
                      <div 
                        key={`${scanIndex}-${lineIndex}`}
                        className={`text-sm ${
                          line.type === "command" ? "command" :
                          line.type === "success" ? "success" :
                          line.type === "error" ? "error" :
                          line.type === "warning" ? "warning" :
                          "info"
                        }`}
                      >
                        {line.content}
                      </div>
                    ))}
                  </div>
                ))
              )}
              {currentScan?.status === "running" && (
                <div className="text-primary animate-pulse">█</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-between items-center">
          <Button
            onClick={copyOutput}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-4 w-4" />
            <span className="text-sm">Copy Output</span>
          </Button>
          <Button
            onClick={exportOutput}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">Export</span>
          </Button>
          <Button
            onClick={clearOutput}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Clear</span>
          </Button>
        </div>
      </div>
    </>
  );
}
