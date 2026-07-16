import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PaymentListItem } from "@/features/payments/types/payment.types";

interface DeletePaymentDialogProps {
  payment: PaymentListItem | null;
  open: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeletePaymentDialog({ payment, open, isDeleting = false, onConfirm, onOpenChange }: DeletePaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete payment</DialogTitle>
          <DialogDescription>
            This will soft-delete payment {payment?.paymentNumber} for {payment?.customerName}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? "Deleting..." : "Delete Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
