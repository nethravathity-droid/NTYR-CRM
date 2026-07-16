import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { CallForm } from "@/features/calls/components/CallForm";
import { useCreateCall } from "@/features/calls/hooks/useCalls";
import { getDefaultCallFormValues } from "@/features/calls/types/call.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CallCreatePage() {
  const navigate = useNavigate();
  const createCall = useCreateCall();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={PhoneCall}
        tone="violet"
        title="Log Call"
        description="Record a new incoming, outgoing, or missed call."
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <CallForm
        defaultValues={getDefaultCallFormValues()}
        submitLabel="Save Call"
        isSubmitting={createCall.isPending}
        onCancel={() => navigate(paths.calls.list)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const call = await createCall.mutateAsync(values);
            navigate(paths.calls.details(call.uuid));
          } catch (err) {
            setError(getApiErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
