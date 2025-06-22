import { Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-secondary border-b border-border sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-primary">SecCheck Mobile</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full status-pulse"></div>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
