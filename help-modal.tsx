import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Quick Help</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-accent mb-1">Getting Started</h4>
            <p className="text-muted-foreground">
              Select a tool category from the tabs above, enter your target, and start scanning.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-accent mb-1">Best Practices</h4>
            <p className="text-muted-foreground">
              Always ensure you have permission to test the target system.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-accent mb-1">Support</h4>
            <p className="text-muted-foreground">
              Visit the Learning section for detailed tutorials and guides.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
