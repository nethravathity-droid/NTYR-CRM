import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LeadListItem } from "@/features/leads/types/lead.types";

interface DeleteLeadDialogProps {
  lead: LeadListItem | null;
  open: boolean;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteLeadDialog({
  lead,
  open,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: DeleteLeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete lead</DialogTitle>
          <DialogDescription>
            This will soft-delete{" "}
            <span className="font-medium text-foreground">
              {lead?.customerName} ({lead?.leadNumber})
            </span>
            . The record remains in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? "Deleting..." : "Delete Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
