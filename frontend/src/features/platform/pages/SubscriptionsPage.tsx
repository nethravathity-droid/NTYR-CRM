import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import type { CompanyStatus } from "@/features/companies/types/company.types";
import { Loading } from "@/components/shared/Loading";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ label: string; value: CompanyStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Trial", value: "TRIAL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Suspended", value: "SUSPENDED" },
];

export function SubscriptionsPage() {
  const [status, setStatus] = useState<CompanyStatus | "ALL">("ALL");
  const { data, isLoading } = useCompanies({
    page: 1,
    limit: 50,
    status: status === "ALL" ? undefined : status,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const { data: allData } = useCompanies({ page: 1, limit: 100 });

  const companies = allData?.companies ?? [];
  const active = companies.filter((c) => c.status === "ACTIVE").length;
  const trial = companies.filter((c) => c.status === "TRIAL").length;
  const expired = companies.filter((c) => c.status === "EXPIRED" || c.status === "SUSPENDED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Tenant subscription status across the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Tenants" value={allData?.pagination.total ?? 0} icon={Building2} tone="indigo" />
        <KpiCard label="Active" value={active} icon={Building2} tone="emerald" />
        <KpiCard label="Trial" value={trial} icon={Building2} tone="amber" />
        <KpiCard label="Expired / Suspended" value={expired} icon={Building2} tone="rose" />
      </div>

      <GlassCard className="p-5">
        <SectionHeader title="Tenant Subscriptions" description="Filter companies by subscription status" />
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                status === tab.value ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/60",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Loading label="Loading subscriptions..." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.companies ?? []).map((company) => (
                <TableRow key={company.uuid}>
                  <TableCell>
                    <Link className="font-medium hover:underline" to={paths.companies.details(company.uuid)}>
                      {company.companyName}
                    </Link>
                  </TableCell>
                  <TableCell>{company.companyCode}</TableCell>
                  <TableCell><Badge variant="outline">{company.status}</Badge></TableCell>
                  <TableCell>{company.ownerName}</TableCell>
                  <TableCell>{company.city}</TableCell>
                  <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
}
