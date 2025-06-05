
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancellation: (reason: string, details?: string) => void;
  isLoading?: boolean;
}

const cancellationReasons = [
  "Changed my mind",
  "Found a better price elsewhere",
  "No longer need the item",
  "Ordered by mistake",
  "Product delivery time too long",
  "Payment issues",
  "Other"
];

export default function CancellationModal({
  open,
  onOpenChange,
  onConfirmCancellation,
  isLoading = false
}: CancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleSubmit = () => {
    if (!selectedReason) return;
    onConfirmCancellation(selectedReason, additionalDetails);
    setSelectedReason("");
    setAdditionalDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Please let us know why you're canceling this order. This helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-base font-medium">Reason for cancellation *</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {cancellationReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="text-sm">{reason}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details" className="text-base font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Please provide any additional details about your cancellation..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep Order
          </Button>
          <Button 
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedReason || isLoading}
          >
            {isLoading ? "Canceling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
