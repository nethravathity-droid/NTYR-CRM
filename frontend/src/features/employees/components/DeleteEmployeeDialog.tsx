import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EmployeeListItem } from "@/features/employees/types/employee.types";
import { getEmployeeDisplayName } from "@/features/employees/schemas/employee.schema";

interface DeleteEmployeeDialogProps {
  employee: EmployeeListItem | null;
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteEmployeeDialog({
  employee,
  open,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteEmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete employee?</DialogTitle>
          <DialogDescription>
            This will soft-delete{" "}
            <span className="font-medium text-foreground">
              {employee ? getEmployeeDisplayName(employee) : ""}
            </span>{" "}
            ({employee?.employeeCode}). The account will be deactivated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
