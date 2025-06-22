import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TerminalOutput from "@/components/terminal-output";
import { useScanner } from "@/hooks/use-scanner";
import { Key, AlertTriangle, CheckCircle } from "lucide-react";

export default function CredentialsPanel() {
  const [targetDevice, setTargetDevice] = useState("");
  const { performScan, currentScan, scanHistory } = useScanner();

  const handleCredentialCheck = async () => {
    if (!targetDevice.trim()) return;
    await performScan("credentials", targetDevice);
  };

  const renderCredentialResults = () => {
    if (!currentScan?.results?.data) return null;

    const { weakCredentials, testedCredentials, riskLevel } = currentScan.results.data;

    return (
      <div className="p-4 space-y-4">
        <Card className="bg-muted border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Credential Security Check</span>
              <Badge variant={riskLevel === "high" ? "destructive" : "secondary"}>
                {riskLevel.toUpperCase()} RISK
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tested Credentials:</span>
                <p className="font-mono">{testedCredentials}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Weak Found:</span>
                <p className="font-mono text-destructive">{weakCredentials?.length || 0}</p>
              </div>
            </div>

            {weakCredentials?.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Vulnerable Credentials Found
                </h4>
                {weakCredentials.map((cred: any, index: number) => (
                  <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          <span className="text-muted-foreground">User:</span> {cred.username}
                        </p>
                        <p className="text-sm font-medium">
                          <span className="text-muted-foreground">Pass:</span> {cred.password || "(empty)"}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {cred.service}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <div className="p-3 bg-warning/10 border border-warning/20 rounded mt-3">
                  <h5 className="font-medium text-warning mb-2">Immediate Actions Required:</h5>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start">
                      <span className="text-warning mr-2">•</span>
                      <span>Change all default passwords immediately</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warning mr-2">•</span>
                      <span>Use strong, unique passwords (12+ characters)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warning mr-2">•</span>
                      <span>Enable two-factor authentication if available</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warning mr-2">•</span>
                      <span>Disable unnecessary admin interfaces</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded">
                <div className="flex items-center text-primary">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="font-medium">No default credentials detected</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Good! No common weak credentials were found on this target.
                </p>
              </div>
            )}
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
            <Label htmlFor="targetDevice" className="text-sm font-medium text-muted-foreground">
              Target Device/IP
            </Label>
            <Input
              id="targetDevice"
              type="text"
              placeholder="192.168.1.1 or router.local"
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
              className="w-full bg-muted border-border text-foreground placeholder-muted-foreground mt-2"
            />
          </div>
          
          <Button
            onClick={handleCredentialCheck}
            disabled={!targetDevice.trim() || currentScan?.status === "running"}
            className="w-full bg-warning hover:bg-warning/90 text-background"
          >
            <Key className="mr-2 h-4 w-4" />
            Check Default Credentials
          </Button>

          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <AlertTriangle className="inline mr-1 h-3 w-3" />
            Tests for common default username/password combinations
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        {renderCredentialResults()}
        <TerminalOutput 
          currentScan={currentScan} 
          scanHistory={scanHistory}
          scanType="credentials"
        />
      </div>
    </div>
  );
}