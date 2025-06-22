import { Card, CardContent } from "@/components/ui/card";
import { Book, Shield, Gavel, Code, Clock, TriangleAlert } from "lucide-react";

const learningModules = [
  {
    id: "recon",
    title: "Reconnaissance Basics",
    description: "Learn how to gather information about targets legally and ethically.",
    duration: "15 min read",
    icon: Book,
    color: "text-accent"
  },
  {
    id: "network",
    title: "Network Security Scanning",
    description: "Understanding port scans, network discovery, and security implications.",
    duration: "20 min read",
    icon: Shield,
    color: "text-warning"
  },
  {
    id: "legal",
    title: "Legal & Ethical Guidelines",
    description: "Critical information about legal boundaries and responsible disclosure.",
    duration: "10 min read",
    icon: Gavel,
    color: "text-destructive"
  },
  {
    id: "vulns",
    title: "Common Vulnerabilities",
    description: "Understanding OWASP Top 10 and common security weaknesses.",
    duration: "25 min read",
    icon: Code,
    color: "text-accent"
  }
];

export default function LearnPanel() {
  return (
    <div className="tool-panel">
      <div className="p-4 space-y-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-lg text-primary-foreground">
          <h2 className="font-bold text-lg mb-2">Ethical Hacking Fundamentals</h2>
          <p className="text-sm opacity-90">Learn responsible security testing practices</p>
        </div>

        {/* Learning Modules */}
        <div className="space-y-3">
          {learningModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="bg-secondary border-border hover:bg-secondary/80 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Icon className={`${module.color} mt-1 h-5 w-5`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-primary">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legal Disclaimer */}
        <Card className="bg-destructive/20 border-destructive">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <TriangleAlert className="text-destructive mt-1 h-5 w-5" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive">Important Legal Notice</h3>
                <p className="text-sm text-destructive/80 mt-1">
                  Only test systems you own or have explicit permission to test. 
                  Unauthorized access to computer systems is illegal in most jurisdictions.
                  This tool is for educational and authorized testing purposes only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
