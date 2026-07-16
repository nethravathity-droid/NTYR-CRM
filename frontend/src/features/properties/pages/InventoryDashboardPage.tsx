import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useInventoryDashboard } from "@/features/properties/hooks/useProperties";
import { paths } from "@/routes/paths";

export function InventoryDashboardPage() {
  const { data, isLoading } = useInventoryDashboard();

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={LayoutDashboard} tone="violet" title="Inventory Dashboard" description="Overview of projects, units, and availability." action={<Button variant="outline" asChild><Link to={paths.projects.list}>All Projects</Link></Button>} />
      {isLoading ? <Loading label="Loading dashboard..." /> : null}
      {data ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Projects</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{data.totalProjects}</p><p className="text-sm text-muted-foreground">Upcoming {data.upcomingProjects} • Ongoing {data.ongoingProjects} • Completed {data.completedProjects}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Units</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{data.totalUnits}</p><p className="text-sm text-muted-foreground">Available {data.availableUnits} • Hold {data.holdUnits}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Bookings</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{data.bookedUnits + data.soldUnits}</p><p className="text-sm text-muted-foreground">Booked {data.bookedUnits} • Sold {data.soldUnits}</p></CardContent></Card>
        </div>
      ) : null}
    </div>
  );
}
