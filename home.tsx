import { useState } from "react";
import Header from "@/components/header";
import ToolTabs from "@/components/tool-tabs";
import ReconPanel from "@/components/recon-panel";
import NetworkPanel from "@/components/network-panel";
import VulnPanel from "@/components/vuln-panel";
import PortPanel from "@/components/port-panel";
import WifiPanel from "@/components/wifi-panel";
import CredentialsPanel from "@/components/credentials-panel";
import LearnPanel from "@/components/learn-panel";
import HelpModal from "@/components/help-modal";
import QuickReport from "@/components/quick-report";
import InstallPrompt from "@/components/install-prompt";
import { Button } from "@/components/ui/button";
import { HelpCircle, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ScanResult } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("recon");
  const [showHelp, setShowHelp] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const { data: scanHistory = [] } = useQuery<ScanResult[]>({
    queryKey: ["/api/scans"],
    staleTime: 30000,
  });

  const renderActivePanel = () => {
    switch (activeTab) {
      case "recon":
        return <ReconPanel />;
      case "network":
        return <NetworkPanel />;
      case "vuln":
        return <VulnPanel />;
      case "port":
        return <PortPanel />;
      case "wifi":
        return <WifiPanel />;
      case "credentials":
        return <CredentialsPanel />;
      case "learn":
        return <LearnPanel />;
      default:
        return <ReconPanel />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <InstallPrompt />
      <ToolTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {renderActivePanel()}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <Button
          onClick={() => setShowReport(!showReport)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
          size="icon"
        >
          <BarChart3 className="h-6 w-6" />
        </Button>
        <Button
          onClick={() => setShowHelp(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
          size="icon"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Quick Report Overlay */}
      {showReport && (
        <div className="fixed bottom-20 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]">
          <QuickReport scanHistory={scanHistory} />
        </div>
      )}

      <HelpModal open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
