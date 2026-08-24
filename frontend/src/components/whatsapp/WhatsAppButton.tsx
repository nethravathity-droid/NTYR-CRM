import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp/WhatsAppIcon";
import { WhatsAppMessageDialog } from "@/components/whatsapp/WhatsAppMessageDialog";
import {
  isValidWhatsAppNumber,
  openWhatsAppConversation,
  type WhatsAppMessageContext,
  type WhatsAppTemplateId,
} from "@/lib/whatsapp";

interface WhatsAppButtonProps extends Omit<ButtonProps, "onClick"> {
  mobile: string | null | undefined;
  context: WhatsAppMessageContext;
  defaultTemplate?: WhatsAppTemplateId;
  showDialog?: boolean;
  directMessage?: string;
  onUnavailable?: () => void;
}

export function WhatsAppButton({
  mobile,
  context,
  defaultTemplate = "greeting",
  showDialog = true,
  directMessage,
  onUnavailable,
  children,
  className,
  variant = "outline",
  size = "default",
  ...props
}: WhatsAppButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    if (!mobile || !isValidWhatsAppNumber(mobile)) {
      onUnavailable?.();
      return;
    }

    if (showDialog) {
      setDialogOpen(true);
      return;
    }

    if (!openWhatsAppConversation(mobile, directMessage)) {
      onUnavailable?.();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className ?? "text-[#25D366]"}
        onClick={handleClick}
        {...props}
      >
        {children ?? (
          <>
            <WhatsAppIcon className="mr-2 h-4 w-4" />
            WhatsApp
          </>
        )}
      </Button>

      {mobile && showDialog ? (
        <WhatsAppMessageDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mobile={mobile}
          context={context}
          defaultTemplate={defaultTemplate}
        />
      ) : null}
    </>
  );
}

interface WhatsAppIconButtonProps {
  mobile: string | null | undefined;
  context: WhatsAppMessageContext;
  defaultTemplate?: WhatsAppTemplateId;
  onUnavailable?: () => void;
  className?: string;
}

export function WhatsAppIconButton({
  mobile,
  context,
  defaultTemplate = "followup",
  onUnavailable,
  className,
}: WhatsAppIconButtonProps) {
  return (
    <WhatsAppButton
      mobile={mobile}
      context={context}
      defaultTemplate={defaultTemplate}
      onUnavailable={onUnavailable}
      variant="outline"
      size="icon"
      className={className ?? "h-8 w-8 rounded-full text-[#25D366]"}
      aria-label="WhatsApp customer"
    >
      <WhatsAppIcon className="h-3.5 w-3.5" />
    </WhatsAppButton>
  );
}
