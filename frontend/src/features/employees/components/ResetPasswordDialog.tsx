import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/features/employees/schemas/employee.schema";

interface ResetPasswordDialogProps {
  employeeName: string;
  employeeCode?: string;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
}

export function ResetPasswordDialog({
  employeeName,
  employeeCode,
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ResetPasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {employeeName}
            {employeeCode ? ` (${employeeCode})` : ""}.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => onSubmit(values.password))}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="mt-2"
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="mt-2"
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
