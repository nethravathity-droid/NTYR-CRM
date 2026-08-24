import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/whatsapp/WhatsAppIcon";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppMessage,
  isValidWhatsAppNumber,
  openWhatsAppConversation,
  type WhatsAppMessageContext,
  type WhatsAppTemplateId,
} from "@/lib/whatsapp";

interface WhatsAppMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobile: string;
  context: WhatsAppMessageContext;
  defaultTemplate?: WhatsAppTemplateId;
}

export function WhatsAppMessageDialog({
  open,
  onOpenChange,
  mobile,
  context,
  defaultTemplate = "greeting",
}: WhatsAppMessageDialogProps) {
  const [templateId, setTemplateId] = useState<WhatsAppTemplateId>(defaultTemplate);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setTemplateId(defaultTemplate);
    setMessage(buildWhatsAppMessage(defaultTemplate, context));
  }, [open, defaultTemplate, context]);

  const handleTemplateChange = (nextTemplate: WhatsAppTemplateId) => {
    setTemplateId(nextTemplate);
    setMessage(buildWhatsAppMessage(nextTemplate, context));
  };

  const handleSend = () => {
    if (!isValidWhatsAppNumber(mobile)) return;
    openWhatsAppConversation(mobile, message);
    onOpenChange(false);
  };

  const invalidNumber = !isValidWhatsAppNumber(mobile);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            Send WhatsApp Message
          </DialogTitle>
          <DialogDescription>
            Message {context.customerName} at {mobile || "—"} via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {invalidNumber ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            A valid mobile number is required to open WhatsApp.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-template">Message template</Label>
              <Select
                id="whatsapp-template"
                value={templateId}
                onChange={(event) =>
                  handleTemplateChange(event.target.value as WhatsAppTemplateId)
                }
              >
                {WHATSAPP_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label} — {template.description}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Message</Label>
              <Textarea
                id="whatsapp-message"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#25D366] hover:bg-[#20bd5a]"
            disabled={invalidNumber || !message.trim()}
            onClick={handleSend}
          >
            <WhatsAppIcon className="mr-2 h-4 w-4" />
            Open in WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
