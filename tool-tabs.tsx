import { Button } from "@/components/ui/button";
import { Search, Network, Bug, DoorOpen, GraduationCap, Wifi, Key } from "lucide-react";

interface ToolTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "recon", label: "Recon", icon: Search },
  { id: "network", label: "Network", icon: Network },
  { id: "vuln", label: "Vuln Scan", icon: Bug },
  { id: "port", label: "Port Scan", icon: DoorOpen },
  { id: "wifi", label: "Wi-Fi Check", icon: Wifi },
  { id: "credentials", label: "Cred Check", icon: Key },
  { id: "learn", label: "Learn", icon: GraduationCap },
];

export default function ToolTabs({ activeTab, onTabChange }: ToolTabsProps) {
  return (
    <div className="bg-secondary border-b border-border">
      <div className="px-4 py-3">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                variant={isActive ? "default" : "secondary"}
                className={`flex-shrink-0 transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                size="sm"
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
