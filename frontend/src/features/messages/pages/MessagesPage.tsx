import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Plus, Search } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/shared/Loading";
import { useCalls } from "@/features/calls/hooks/useCalls";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export function MessagesPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreateCall = hasPermission("calls.create");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: employeesData, isLoading: employeesLoading } = useEmployees({
    page: 1,
    limit: 50,
    search: search || undefined,
    status: "ACTIVE",
  });

  const { data: callsData, isLoading: callsLoading } = useCalls({
    page: 1,
    limit: 20,
    assignedUserId: selectedUserId ?? undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const employees = employeesData?.users ?? [];
  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedUserId) ?? null,
    [employees, selectedUserId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Messages</h1>
          <p className="text-muted-foreground">Internal communication log tied to team call activity.</p>
        </div>
        {canCreateCall ? (
          <Button onClick={() => navigate(paths.calls.create)} className="rounded-[14px] bg-[#2563EB]">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <GlassCard className="p-4">
          <SectionHeader title="Team" description="Select a teammate" />
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className="pl-9"
            />
          </div>
          {employeesLoading ? <Loading label="Loading team..." /> : (
            <div className="max-h-[520px] space-y-1 overflow-y-auto">
              {employees.map((employee) => (
                <button
                  key={employee.uuid}
                  type="button"
                  onClick={() => setSelectedUserId(employee.id)}
                  className={`flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-left text-sm transition hover:bg-muted/40 ${
                    selectedUserId === employee.id ? "border-[#2563EB]/40 bg-[#2563EB]/5" : ""
                  }`}
                >
                  <MessageSquare className="h-4 w-4 text-[#2563EB]" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{employee.displayName ?? employee.employeeCode}</p>
                    <p className="truncate text-xs text-muted-foreground">{employee.designation.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader
            title={selectedEmployee ? `${selectedEmployee.displayName ?? selectedEmployee.employeeCode}'s Activity` : "Conversation"}
            description={selectedEmployee ? "Recent customer communication logs" : "Select a team member to view messages"}
          />
          {!selectedEmployee ? (
            <p className="text-sm text-muted-foreground">Choose an employee from the team list to view their communication history.</p>
          ) : callsLoading ? (
            <Loading label="Loading messages..." />
          ) : (callsData?.calls.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No communication logs yet for this team member.</p>
          ) : (
            <div className="space-y-3">
              {callsData?.calls.map((call) => (
                <Link
                  key={call.uuid}
                  to={paths.calls.details(call.uuid)}
                  className="block rounded-[14px] border p-4 transition hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{call.customerName}</p>
                      <p className="text-sm text-muted-foreground">{call.callDate} · {call.callTime.slice(0, 5)} · {call.direction}</p>
                      {call.notes ? <p className="mt-2 text-sm">{call.notes}</p> : null}
                    </div>
                    <span className="text-xs text-muted-foreground">{call.callStatus}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
