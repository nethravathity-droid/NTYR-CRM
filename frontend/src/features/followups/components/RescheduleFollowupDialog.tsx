import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import type { FollowupListItem } from "@/features/followups/types/followup.types";

interface RescheduleFormValues {
  followupDate: string;
  followupTime: string;
  notes: string;
}

interface RescheduleFollowupDialogProps {
  followup: FollowupListItem | null;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: { followupDate: string; followupTime: string; notes?: string | null }) => void;
}

export function RescheduleFollowupDialog({
  followup,
  open,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: RescheduleFollowupDialogProps) {
  const { register, handleSubmit, reset } = useForm<RescheduleFormValues>();

  useEffect(() => {
    if (followup && open) {
      reset({
        followupDate: followup.followupDate,
        followupTime: followup.followupTime,
        notes: followup.notes ?? "",
      });
    }
  }, [followup, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule follow-up</DialogTitle>
          <DialogDescription>
            Update the schedule for {followup?.customerName ?? "this follow-up"}.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) =>
            onConfirm({
              followupDate: values.followupDate,
              followupTime: values.followupTime,
              notes: values.notes.trim() || null,
            }),
          )}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="followupDate">Follow-up Date</Label>
            <Input id="followupDate" type="date" {...register("followupDate", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="followupTime">Follow-up Time</Label>
            <Input id="followupTime" type="time" {...register("followupTime", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
