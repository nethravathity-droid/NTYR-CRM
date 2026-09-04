import { useMemo, useState } from "react";
import { MessageSquare, Search, Send } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/shared/Loading";
import { useWhatsAppMessages, useSendWhatsAppMessage } from "@/features/whatsapp/hooks/useWhatsApp";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { useToast } from "@/hooks/useToast";

export function WhatsAppInboxPage() {
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const { toast } = useToast();
  const sendMutation = useSendWhatsAppMessage();

  const { data: messagesData, isLoading: messagesLoading } = useWhatsAppMessages({
    page: 1,
    limit: 50,
    search: search || undefined,
  });

  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    page: 1,
    limit: 50,
    search: search || undefined,
  });

  const messages = messagesData?.messages ?? [];
  const leads = leadsData?.leads ?? [];

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const handleSend = async () => {
    if (!selectedLead || !messageBody.trim()) return;

    try {
      await sendMutation.mutateAsync({
        customerName: selectedLead.customerName,
        customerMobile: selectedLead.mobile,
        leadId: selectedLead.id,
        body: messageBody.trim(),
      });

      toast({
        title: "Message queued",
        description: `WhatsApp message to ${selectedLead.customerName} has been queued.`,
      });

      setMessageBody("");
    } catch (error) {
      toast({
        title: "Failed to send",
        description: error instanceof Error ? error.message : "Failed to send WhatsApp message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Inbox</h1>
        <p className="text-muted-foreground">Send and track WhatsApp messages from one place.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <GlassCard className="p-4">
          <SectionHeader title="Leads" description="Select a lead" />
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leads..."
              className="pl-9"
            />
          </div>
          {leadsLoading ? (
            <Loading label="Loading leads..." />
          ) : (
            <div className="max-h-[520px] space-y-1 overflow-y-auto">
              {leads.map((lead) => (
                <button
                  key={lead.uuid}
                  type="button"
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-left text-sm transition hover:bg-muted/40 ${
                    selectedLeadId === lead.id ? "border-[#25D366]/40 bg-[#25D366]/5" : ""
                  }`}
                >
                  <MessageSquare className="h-4 w-4 text-[#25D366]" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lead.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{lead.mobile}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader
            title={selectedLead ? `Chat with ${selectedLead.customerName}` : "Conversation"}
            description={
              selectedLead
                ? `Send WhatsApp messages to ${selectedLead.mobile}`
                : "Select a lead to start a WhatsApp conversation"
            }
          />

          {!selectedLead ? (
            <p className="text-sm text-muted-foreground">Choose a lead from the list to view or send WhatsApp messages.</p>
          ) : messagesLoading ? (
            <Loading label="Loading messages..." />
          ) : (
            <div className="space-y-4">
              <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-[14px] border p-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No WhatsApp messages yet for this lead.</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.uuid}
                      className={`rounded-[12px] border p-3 ${
                        message.direction === "outbound" ? "ml-8 bg-muted/40" : "mr-8 bg-background"
                      }`}
                    >
                      <p className="text-sm font-medium">{message.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {message.direction} · {message.status} · {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="Type your WhatsApp message..."
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={!messageBody.trim() || sendMutation.isPending}
                className="bg-[#25D366] hover:bg-[#20bd5a]"
              >
                {sendMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
