import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { FollowupForm } from "@/features/followups/components/FollowupForm";
import { useCreateFollowup } from "@/features/followups/hooks/useFollowups";
import type { FollowupFormValues } from "@/features/followups/types/followup.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function FollowupCreatePage() {
  const navigate = useNavigate();
  const createFollowup = useCreateFollowup();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: FollowupFormValues) => {
    setError(null);
    try {
      await createFollowup.mutateAsync(values);
      navigate(paths.followups.list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Plus} tone="indigo" title="Add Follow-up" description="Create a structured follow-up task for a lead or customer." />
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : null}
      <FollowupForm mode="create" submitLabel="Create Follow-up" isSubmitting={createFollowup.isPending} onSubmit={handleSubmit} onCancel={() => navigate(paths.followups.list)} />
    </div>
  );
}
