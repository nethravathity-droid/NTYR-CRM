import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/features/auth/services/auth.service";

const broadcastSchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty").max(4000),
  statuses: z.array(z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED"])),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

const STATUS_OPTIONS = [
  { value: "ACTIVE" as const, label: "Active", description: "Paid subscribed companies" },
  { value: "TRIAL" as const, label: "Trial", description: "Companies on free trial" },
  { value: "SUSPENDED" as const, label: "Suspended", description: "Temporarily suspended" },
  { value: "EXPIRED" as const, label: "Expired", description: "Trial or subscription expired" },
] as const;

export function SuperAdminBroadcastPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      body: "",
      statuses: ["ACTIVE", "TRIAL"],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      await authService.broadcastSupportMessage({
        body: values.body,
        statuses: values.statuses,
      });

      toast({
        title: "Message broadcasted",
        description: `Your message has been sent to all ${values.statuses.join(" and ").toLowerCase()} companies.`,
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Broadcast failed",
        description: error instanceof Error ? error.message : "Failed to send broadcast message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const selectedStatuses = form.watch("statuses");

  const toggleStatus = (status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "EXPIRED") => {
    const current = form.getValues("statuses");
    if (current.includes(status)) {
      form.setValue("statuses", current.filter((s) => s !== status));
    } else {
      form.setValue("statuses", [...current, status]);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broadcast Message</h1>
        <p className="text-muted-foreground">
          Send an announcement to all subscribed companies from the super admin dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Broadcast</CardTitle>
          <CardDescription>
            This message will be delivered to every company admin in the selected audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Audience</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatuses.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleStatus(option.value)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{option.description}</span>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.statuses ? (
                <p className="text-sm text-destructive">{form.formState.errors.statuses.message}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Selected: {selectedStatuses.join(", ") || "None"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Write your announcement here..."
                rows={6}
                {...form.register("body")}
              />
              {form.formState.errors.body ? (
                <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Broadcast
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                This will notify all selected company admins.
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Use broadcasts for important platform updates, maintenance notices, or feature releases.</p>
          <p>Messages are delivered as support threads and appear in the company admin inbox.</p>
          <p>Keep messages concise and actionable. Avoid sending unnecessary broadcasts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
