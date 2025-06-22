import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TerminalOutput from "@/components/terminal-output";
import { useScanner } from "@/hooks/use-scanner";
import { Search } from "lucide-react";

export default function PortPanel() {
  const [targetIp, setTargetIp] = useState("");
  const [portRange, setPortRange] = useState("1-1000");
  const { performScan, currentScan, scanHistory } = useScanner();

  const handlePortScan = async () => {
    if (!targetIp.trim()) return;
    await performScan("port", targetIp, { portRange });
  };

  const setQuickRange = (range: string) => {
    setPortRange(range);
  };

  const renderPortResults = () => {
    if (!currentScan?.results?.data?.openPorts) return null;

    const { openPorts } = currentScan.results.data;

    return (
      <div className="p-4">
        <Card className="bg-muted border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Open Ports</span>
              <span className="text-sm text-muted-foreground">{openPorts.length} found</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 font-mono text-sm">
              {openPorts.map((port: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                  <span className="text-primary">{port.port}/{port.protocol}</span>
                  <span className="text-foreground">{port.service}</span>
                  <span className="text-xs text-muted-foreground">{port.version}</span>
                </div>
              ))}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="targetIp" className="text-sm font-medium text-muted-foreground">
                Target IP
              </Label>
              <Input
                id="targetIp"
                type="text"
                placeholder="192.168.1.1"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                className="w-full bg-muted border-border text-foreground placeholder-muted-foreground mt-2"
              />
            </div>
            <div>
              <Label htmlFor="portRange" className="text-sm font-medium text-muted-foreground">
                Port Range
              </Label>
              <Input
                id="portRange"
                type="text"
                placeholder="1-1000"
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                className="w-full bg-muted border-border text-foreground placeholder-muted-foreground mt-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setQuickRange("1-100")}
              variant="secondary"
              size="sm"
              className="bg-muted hover:bg-muted/80"
            >
              Top 100
            </Button>
            <Button
              onClick={() => setQuickRange("1-1000")}
              variant="secondary"
              size="sm"
              className="bg-muted hover:bg-muted/80"
            >
              Top 1000
            </Button>
            <Button
              onClick={() => setQuickRange("1-65535")}
              variant="secondary"
              size="sm"
              className="bg-muted hover:bg-muted/80"
            >
              All Ports
            </Button>
          </div>
          
          <Button
            onClick={handlePortScan}
            disabled={!targetIp.trim() || currentScan?.status === "running"}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Search className="mr-2 h-4 w-4" />
            Start Port Scan
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-background">
        {renderPortResults()}
        <TerminalOutput 
          currentScan={currentScan} 
          scanHistory={scanHistory}
          scanType="port"
        />
      </div>
    </div>
  );
}
