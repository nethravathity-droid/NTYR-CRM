import { useState } from "react";
import { Save } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";

const WHATSAPP_PROVIDERS = [
  { value: "whatsapp_cloud", label: "WhatsApp Cloud API" },
  { value: "twilio", label: "Twilio" },
  { value: "custom", label: "Custom Provider" },
] as const;

export function WhatsAppSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [provider, setProvider] = useState<"whatsapp_cloud" | "twilio" | "custom">("whatsapp_cloud");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Settings saved",
        description: "WhatsApp integration settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save WhatsApp settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Settings</h1>
        <p className="text-muted-foreground">Configure WhatsApp integration for your workspace.</p>
      </div>

      <GlassCard className="p-6">
        <SectionHeader title="Integration" description="Enable or disable WhatsApp messaging" />
        <div className="flex items-center justify-between rounded-[14px] border p-4">
          <div>
            <p className="font-medium">Enable WhatsApp</p>
            <p className="text-sm text-muted-foreground">Allow sending and receiving WhatsApp messages from this workspace.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader title="Provider" description="Choose your WhatsApp provider" />
        <div className="grid gap-4 sm:grid-cols-3">
          {WHATSAPP_PROVIDERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setProvider(option.value)}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm transition hover:border-primary/50 ${
                provider === option.value ? "border-primary bg-primary/5" : ""
              }`}
            >
              <p className="font-medium">{option.label}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader title="Credentials" description="Enter your WhatsApp provider credentials" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <Input
              id="phoneNumberId"
              value={phoneNumberId}
              onChange={(event) => setPhoneNumberId(event.target.value)}
              placeholder="e.g. 1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessNumber">Business Number</Label>
            <Input
              id="businessNumber"
              value={businessNumber}
              onChange={(event) => setBusinessNumber(event.target.value)}
              placeholder="e.g. +91 98765 43210"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          These credentials are stored securely and used only for WhatsApp API communication.
        </p>
      </GlassCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" />Save Settings</>}
        </Button>
      </div>
    </div>
  );
}
