import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import TerminalOutput from "@/components/terminal-output";
import { useScanner } from "@/hooks/use-scanner";
import { Play, Info, Globe, Map, FileCode } from "lucide-react";

export default function ReconPanel() {
  const [target, setTarget] = useState("");
  const { performScan, currentScan, scanHistory } = useScanner();

  const handleQuickScan = async (scanType: string) => {
    if (!target.trim()) return;
    await performScan(scanType, target);
  };

  const toolButtons = [
    { id: "whois", label: "WHOIS", icon: Info, description: "Domain registration info" },
    { id: "dns", label: "DNS Lookup", icon: Globe, description: "DNS record resolution" },
    { id: "subdomain", label: "Subdomains", icon: Map, description: "Subdomain enumeration" },
    { id: "headers", label: "Headers", icon: FileCode, description: "HTTP header analysis" },
  ];

  return (
    <div className="tool-panel">
      {/* Input Section */}
      <div className="bg-secondary p-4 border-b border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="target" className="text-sm font-medium text-muted-foreground">
              Target Domain/IP
            </Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="target"
                type="text"
                placeholder="example.com or 192.168.1.1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="flex-1 bg-muted border-border text-foreground placeholder-muted-foreground"
              />
              <Button
                onClick={() => handleQuickScan("whois")}
                disabled={!target.trim() || currentScan?.status === "running"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="icon"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {toolButtons.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  onClick={() => handleQuickScan(tool.id)}
                  disabled={!target.trim() || currentScan?.status === "running"}
                  variant="secondary"
                  className="bg-muted hover:bg-muted/80 p-3 h-auto flex-col space-y-1 text-left"
                >
                  <Icon className="h-5 w-5 text-accent mb-1" />
                  <div className="text-sm font-medium">{tool.label}</div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 bg-background">
        <TerminalOutput 
          currentScan={currentScan} 
          scanHistory={scanHistory}
          scanType="recon"
        />
      </div>
    </div>
  );
}
