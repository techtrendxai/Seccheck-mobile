import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TerminalOutput from "@/components/terminal-output";
import { useScanner } from "@/hooks/use-scanner";
import { Search, Wifi } from "lucide-react";

export default function NetworkPanel() {
  const [networkRange, setNetworkRange] = useState("192.168.1.0/24");
  const { performScan, currentScan, scanHistory } = useScanner();

  const handleNetworkDiscovery = async () => {
    if (!networkRange.trim()) return;
    await performScan("network", networkRange);
  };

  return (
    <div className="tool-panel">
      <div className="bg-secondary p-4 border-b border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="network" className="text-sm font-medium text-muted-foreground">
              Network Range
            </Label>
            <Input
              id="network"
              type="text"
              placeholder="192.168.1.0/24"
              value={networkRange}
              onChange={(e) => setNetworkRange(e.target.value)}
              className="w-full bg-muted border-border text-foreground placeholder-muted-foreground mt-2"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleNetworkDiscovery}
              disabled={!networkRange.trim() || currentScan?.status === "running"}
              className="bg-accent hover:bg-accent/90 p-4 h-auto text-left"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">Network Discovery</div>
                  <div className="text-sm text-accent-foreground/80 mt-1">Find active hosts on network</div>
                </div>
                <Search className="h-5 w-5" />
              </div>
            </Button>
            
            <Button
              onClick={handleNetworkDiscovery}
              disabled={!networkRange.trim() || currentScan?.status === "running"}
              variant="secondary"
              className="bg-warning hover:bg-warning/90 text-background p-4 h-auto text-left"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">Ping Sweep</div>
                  <div className="text-sm text-background/80 mt-1">ICMP ping to range</div>
                </div>
                <Wifi className="h-5 w-5" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        <TerminalOutput 
          currentScan={currentScan} 
          scanHistory={scanHistory}
          scanType="network"
        />
      </div>
    </div>
  );
}
