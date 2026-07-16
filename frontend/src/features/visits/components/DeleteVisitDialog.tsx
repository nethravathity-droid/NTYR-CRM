import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { VisitListItem } from "@/features/visits/types/visit.types";

interface DeleteVisitDialogProps {
  visit: VisitListItem | null;
  open: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVisitDialog({ visit, open, isDeleting = false, onConfirm, onOpenChange }: DeleteVisitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete visit</DialogTitle>
          <DialogDescription>
            This will soft-delete visit {visit?.visitNumber} for {visit?.customerName}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? "Deleting..." : "Delete Visit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
