import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Company</CardDescription>
            <CardTitle className="text-xl">{user?.company.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Code: {user?.company.code}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Role</CardDescription>
            <CardTitle className="text-xl">{user?.role.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {user?.permissions.length ?? 0} permissions assigned
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Branch</CardDescription>
            <CardTitle className="text-xl">{user?.branch.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Department: {user?.department.name}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-xl">{user?.user.status}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Multi-tenant session active
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
