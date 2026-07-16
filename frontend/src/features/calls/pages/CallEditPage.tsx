import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { CallForm } from "@/features/calls/components/CallForm";
import { useCall, useUpdateCall } from "@/features/calls/hooks/useCalls";
import { mapCallToFormValues } from "@/features/calls/types/call.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CallEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: call, isLoading, error } = useCall(uuid ?? "");
  const updateCall = useUpdateCall(uuid ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) return <Loading label="Loading call..." />;
  if (error || !call) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Call not found.</p>
        <Button variant="outline" onClick={() => navigate(paths.calls.list)}>Back to Calls</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={PhoneCall}
        tone="violet"
        title={`Edit ${call.callNumber}`}
        description={`Update call log for ${call.customerName}.`}
      />

      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <CallForm
        defaultValues={mapCallToFormValues(call)}
        submitLabel="Update Call"
        isSubmitting={updateCall.isPending}
        onCancel={() => navigate(paths.calls.details(call.uuid))}
        onSubmit={async (values) => {
          setSubmitError(null);
          try {
            await updateCall.mutateAsync(values);
            navigate(paths.calls.details(call.uuid));
          } catch (err) {
            setSubmitError(getApiErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
