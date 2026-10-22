import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Plus, Sparkles } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import {
  useCreateGrowthItem,
  useGrowthInbox,
  useGrowthList,
  useInboxReply,
  useInboxThread,
  useRunCampaign,
} from "@/features/growth/hooks/useGrowth";
import type { InboxThread } from "@/features/growth/services/growth.service";
import { GROWTH_SECTION_LABELS, type GrowthSection } from "@/features/growth/types/growth.types";
import { paths } from "@/routes/paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/shared/Loading";

const SECTIONS: GrowthSection[] = [
  "templates",
  "campaigns",
  "workflows",
  "forms",
  "funnels",
  "appointments",
  "reviews",
  "inbox",
];

function isGrowthSection(value: string | undefined): value is GrowthSection {
  return value != null && SECTIONS.includes(value as GrowthSection);
}

export function GrowthSectionPage() {
  const { section: sectionParam } = useParams<{ section: string }>();
  const section = isGrowthSection(sectionParam) ? sectionParam : "templates";
  const isInbox = section === "inbox";

  const { data, isLoading } = useGrowthList<Record<string, unknown>>(section, { enabled: !isInbox });
  const { data: inboxThreads, isLoading: inboxLoading } = useGrowthInbox();
  const createMutation = useCreateGrowthItem(section === "inbox" ? "templates" : section);
  const runCampaign = useRunCampaign();
  const inboxReply = useInboxReply();

  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const { data: threadMessages, isLoading: threadLoading } = useInboxThread(
    selectedThread?.channel ?? null,
    selectedThread?.recipient ?? null,
  );

  const defaultFields = useMemo(() => {
    switch (section) {
      case "templates":
        return { name: "", channel: "SMS", subject: "", body: "" };
      case "campaigns":
        return { name: "", channel: "SMS" };
      case "workflows":
        return {
          name: "",
          triggerType: "LEAD_CREATED",
          toStatus: "BOOKED",
          fromStatus: "",
          description: "",
        };
      case "forms":
        return { name: "", slug: "" };
      case "funnels":
        return { name: "", description: "" };
      case "appointments":
        return { title: "", startAt: "", endAt: "" };
      case "reviews":
        return { reviewerName: "", rating: "5", reviewText: "" };
      default:
        return {};
    }
  }, [section]);

  function openCreate() {
    setFormState(defaultFields as Record<string, string>);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = { ...formState };
    if (section === "reviews") body.rating = Number(formState.rating);
    if (section === "workflows") {
      body.triggerType = body.triggerType || "LEAD_CREATED";
      body.status = "ACTIVE";
      const triggerType = String(body.triggerType);
      if (triggerType === "LEAD_STATUS_CHANGED") {
        body.triggerConfig = {
          toStatus: formState.toStatus || undefined,
          fromStatus: formState.fromStatus || undefined,
        };
        body.actions = [
          {
            type: "SEND_SMS",
            body: "Hi {{customerName}}, your enquiry status is now {{status}}. — Team",
          },
        ];
      } else {
        body.triggerConfig = {};
        body.actions = [
          {
            type: "SEND_WHATSAPP",
            body: "Hi {{customerName}}, thanks for your interest. Our team will call you shortly.",
          },
          { type: "CREATE_FOLLOWUP", delayMinutes: 120, followupType: "CALL" },
        ];
      }
    }
    if (section === "forms") {
      body.fields = [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "mobile", label: "Mobile", type: "tel", required: true },
        { name: "email", label: "Email", type: "email", required: false },
      ];
    }
    if (section === "funnels") {
      body.stages = [
        { name: "Awareness", order: 1 },
        { name: "Interest", order: 2 },
        { name: "Decision", order: 3 },
        { name: "Booking", order: 4 },
      ];
    }
    await createMutation.mutateAsync(body);
    setShowForm(false);
  }

  if (isInbox ? inboxLoading : isLoading) {
    return <Loading label="Loading..." />;
  }

  const items = isInbox ? [] : data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={paths.growth.hub}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Growth hub
          </Link>
        </Button>
      </div>

      <CompanyPageHeader
        icon={Sparkles}
        tone="violet"
        title={GROWTH_SECTION_LABELS[section]}
        description={`Manage ${GROWTH_SECTION_LABELS[section].toLowerCase()} for your workspace.`}
        action={
          !isInbox ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          ) : undefined
        }
      />

      {showForm && !isInbox && (
        <Card>
          <CardHeader><CardTitle>New {GROWTH_SECTION_LABELS[section]}</CardTitle></CardHeader>
          <CardContent>
            <form className="grid max-w-lg gap-4" onSubmit={handleSubmit}>
              {Object.keys(defaultFields)
                .filter((key) => {
                  if (section !== "workflows" || formState.triggerType === "LEAD_STATUS_CHANGED") {
                    return true;
                  }
                  return key !== "toStatus" && key !== "fromStatus";
                })
                .map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  {key === "body" || key === "description" || key === "reviewText" ? (
                    <Textarea
                      value={formState[key] ?? ""}
                      onChange={(e) => setFormState((s) => ({ ...s, [key]: e.target.value }))}
                    />
                  ) : key === "channel" ? (
                    <Select
                      value={formState.channel}
                      onChange={(e) => setFormState((s) => ({ ...s, channel: e.target.value }))}
                    >
                      <option value="SMS">SMS</option>
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </Select>
                  ) : key === "triggerType" ? (
                    <Select
                      value={formState.triggerType}
                      onChange={(e) => setFormState((s) => ({ ...s, triggerType: e.target.value }))}
                    >
                      <option value="LEAD_CREATED">Lead created</option>
                      <option value="LEAD_STATUS_CHANGED">Lead status changed</option>
                    </Select>
                  ) : (
                    <Input
                      value={formState[key] ?? ""}
                      onChange={(e) => setFormState((s) => ({ ...s, [key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isInbox ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {(inboxThreads as InboxThread[]).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No conversations yet.</CardContent></Card>
            ) : (
              (inboxThreads as InboxThread[]).map((thread) => (
                <Card
                  key={thread.key}
                  className={selectedThread?.key === thread.key ? "border-primary" : "cursor-pointer"}
                  onClick={() => setSelectedThread(thread)}
                >
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                    <div>
                      <p className="font-medium">{thread.customerName ?? thread.recipient}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{thread.channel} · {thread.lastMessage}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(thread.lastAt).toLocaleString()}</span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <Card className="flex min-h-[320px] flex-col">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedThread ? selectedThread.customerName ?? selectedThread.recipient : "Select a conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              {selectedThread ? (
                <>
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-64">
                    {threadLoading ? (
                      <p className="text-sm text-muted-foreground">Loading messages…</p>
                    ) : (
                      threadMessages?.map((msg) => (
                        <div
                          key={msg.uuid}
                          className={`rounded-lg px-3 py-2 text-sm ${
                            msg.direction === "inbound" ? "bg-muted" : "bg-primary/10 ml-8"
                          }`}
                        >
                          <p>{msg.body}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString()} · {msg.status}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!selectedThread || !replyBody.trim()) return;
                      inboxReply.mutate({
                        channel: selectedThread.channel,
                        recipient: selectedThread.recipient,
                        customerName: selectedThread.customerName ?? selectedThread.recipient,
                        leadUuid: selectedThread.leadUuid,
                        body: replyBody.trim(),
                      });
                      setReplyBody("");
                    }}
                  >
                    <Input
                      placeholder="Type a reply…"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                    />
                    <Button type="submit" disabled={inboxReply.isPending}>Send</Button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Choose a thread to view history and reply.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No items yet. Create one to get started.</CardContent></Card>
          ) : (
            items.map((item) => (
              <Card key={String(item.uuid)}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                  <div>
                    <p className="font-medium">
                      {String(item.name ?? item.title ?? item.reviewerName ?? item.uuid)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.channel ? String(item.channel) : null}
                      {item.status ? ` · ${String(item.status)}` : null}
                      {item.slug ? ` · /capture/${String(item.uuid)}` : null}
                    </p>
                  </div>
                  {section === "campaigns" && item.status !== "COMPLETED" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={runCampaign.isPending}
                      onClick={() => runCampaign.mutate(String(item.uuid))}
                    >
                      <Play className="mr-1 h-3 w-3" /> Run
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
