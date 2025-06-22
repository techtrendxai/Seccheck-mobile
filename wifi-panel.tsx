import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TerminalOutput from "@/components/terminal-output";
import { useScanner } from "@/hooks/use-scanner";
import { Wifi, Shield, AlertTriangle } from "lucide-react";

export default function WifiPanel() {
  const [networkName, setNetworkName] = useState("");
  const { performScan, currentScan, scanHistory } = useScanner();

  const handleWifiScan = async () => {
    if (!networkName.trim()) return;
    await performScan("wifi", networkName);
  };

  const renderWifiResults = () => {
    if (!currentScan?.results?.data?.analysis) return null;

    const { analysis, recommendations } = currentScan.results.data;

    return (
      <div className="p-4 space-y-4">
        <Card className="bg-muted border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Wi-Fi Security Analysis</span>
              <Badge variant={analysis.encryption === "WEP" ? "destructive" : "secondary"}>
                {analysis.encryption}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Network:</span>
                <p className="font-mono">{analysis.networkName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Signal:</span>
                <p className="font-mono">{analysis.signalStrength}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Channel:</span>
                <p className="font-mono">{analysis.channel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Encryption:</span>
                <p className="font-mono">{analysis.encryption}</p>
              </div>
            </div>

            {analysis.securityIssues?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Security Issues
                </h4>
                {analysis.securityIssues.map((issue: any, index: number) => (
                  <div key={index} className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-sm font-medium text-destructive">{issue.issue}</p>
                    <p className="text-xs text-muted-foreground mt-1">{issue.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-accent">Recommendations</h4>
              <ul className="text-sm space-y-1">
                {recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="tool-panel">
      <div className="bg-secondary p-4 border-b border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="networkName" className="text-sm font-medium text-muted-foreground">
              Wi-Fi Network Name
            </Label>
            <Input
              id="networkName"
              type="text"
              placeholder="MyHomeWiFi"
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value)}
              className="w-full bg-muted border-border text-foreground placeholder-muted-foreground mt-2"
            />
          </div>
          
          <Button
            onClick={handleWifiScan}
            disabled={!networkName.trim() || currentScan?.status === "running"}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Wifi className="mr-2 h-4 w-4" />
            Analyze Wi-Fi Security
          </Button>

          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <Shield className="inline mr-1 h-3 w-3" />
            Checks encryption type, signal strength, and security configuration
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        {renderWifiResults()}
        <TerminalOutput 
          currentScan={currentScan} 
          scanHistory={scanHistory}
          scanType="wifi"
        />
      </div>
    </div>
  );
}