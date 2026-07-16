import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CallListItem } from "@/features/calls/types/call.types";

interface DeleteCallDialogProps {
  call: CallListItem | null;
  open: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCallDialog({ call, open, isDeleting = false, onConfirm, onOpenChange }: DeleteCallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete call log?</DialogTitle>
          <DialogDescription>
            This will remove call {call?.callNumber} for {call?.customerName}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? "Deleting..." : "Delete Call"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
