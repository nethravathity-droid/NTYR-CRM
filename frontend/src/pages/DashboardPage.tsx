import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";
import { getApiErrorMessage } from "@/lib/api/client";

function formatRevenue(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricText({
  isLoading,
  hasError,
  children,
}: {
  isLoading: boolean;
  hasError: boolean;
  children: string;
}) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading...
      </span>
    );
  }

  if (hasError) {
    return <>—</>;
  }

  return <>{children}</>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading, error } = useDashboardSummary();
  const hasError = Boolean(error);

  const displayName =
    user?.user.displayName ??
    `${user?.user.firstName ?? ""} ${user?.user.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {displayName}. Your workspace is ready.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Company</CardDescription>
            <CardTitle className="text-xl">{user?.company.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <MetricText isLoading={isLoading} hasError={hasError}>
              {`${summary?.totalCompanies ?? 0} companies · ${summary?.totalEmployees ?? 0} employees`}
            </MetricText>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Role</CardDescription>
            <CardTitle className="text-xl">{user?.role.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <MetricText isLoading={isLoading} hasError={hasError}>
              {`${summary?.totalLeads ?? 0} leads · ${summary?.totalBookings ?? 0} bookings`}
            </MetricText>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Branch</CardDescription>
            <CardTitle className="text-xl">{user?.branch.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Department: {user?.department.name}
            {" · "}
            <MetricText isLoading={isLoading} hasError={hasError}>
              {`${formatRevenue(summary?.totalRevenue ?? 0)} revenue · ${summary?.pendingFollowups ?? 0} follow-ups`}
            </MetricText>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-xl">{user?.user.status}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <MetricText isLoading={isLoading} hasError={hasError}>
              Multi-tenant session active
            </MetricText>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
