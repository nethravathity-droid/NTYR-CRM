import { PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WhatsAppIconButton } from "@/components/whatsapp/WhatsAppButton";
import type { FollowupListItem } from "@/features/followups/types/followup.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paths } from "@/routes/paths";

export function FollowupQuickActions({
  followup,
  onWhatsAppUnavailable,
}: {
  followup: FollowupListItem;
  onWhatsAppUnavailable?: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mobile = followup.lead?.mobile;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        aria-label="Call customer"
        onClick={() => {
          if (mobile) window.location.href = `tel:${mobile}`;
          else navigate(paths.calls.create);
        }}
      >
        <PhoneCall className="h-3.5 w-3.5" />
      </Button>
      <WhatsAppIconButton
        mobile={mobile}
        defaultTemplate="followup"
        onUnavailable={onWhatsAppUnavailable}
        context={{
          customerName: followup.customerName,
          companyName: user?.company.name,
          agentName:
            user?.user.displayName ??
            `${user?.user.firstName ?? ""} ${user?.user.lastName ?? ""}`.trim(),
          projectName: followup.projectInterested ?? undefined,
        }}
      />
    </div>
  );
}
