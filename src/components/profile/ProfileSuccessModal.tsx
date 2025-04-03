
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface ProfileSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function ProfileSuccessModal({ 
  open, 
  onOpenChange, 
  onClose 
}: ProfileSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Profile Updated
          </DialogTitle>
          <DialogDescription>
            Your profile information has been successfully saved to the database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
