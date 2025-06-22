import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if dismissed before
  if (localStorage.getItem('installPromptDismissed') === 'true') {
    return null;
  }

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50">
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-primary">Install SecCheck Mobile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Install this app on your device for quick access and offline use
                </p>
                <div className="flex space-x-2 mt-3">
                  <Button onClick={handleInstall} size="sm" className="bg-primary text-primary-foreground">
                    <Download className="mr-1 h-3 w-3" />
                    Install
                  </Button>
                  <Button onClick={handleDismiss} variant="ghost" size="sm">
                    Not now
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={handleDismiss} variant="ghost" size="icon" className="h-6 w-6">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}