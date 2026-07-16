import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName =
    user.user.displayName ??
    `${user.user.firstName} ${user.user.lastName ?? ""}`.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Your profile, workspace, and application preferences.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader title="Profile" description="Your account details" />
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{displayName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-medium">{user.user.username}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Employee Code</dt>
              <dd className="font-medium">{user.user.employeeCode}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.user.officialEmail ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Mobile</dt>
              <dd className="font-medium">{user.user.mobile}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd><Badge variant="outline">{user.user.status}</Badge></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Last Login</dt>
              <dd className="font-medium">
                {user.user.lastLoginAt ? new Date(user.user.lastLoginAt).toLocaleString() : "—"}
              </dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Workspace" description="Company and role context" />
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Company</dt>
              <dd className="font-medium">{user.company.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Company Code</dt>
              <dd className="font-medium">{user.company.code}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Company Status</dt>
              <dd><Badge variant="outline">{user.company.status}</Badge></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{user.role.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Branch</dt>
              <dd className="font-medium">{user.branch.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Department</dt>
              <dd className="font-medium">{user.department.name}</dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Appearance" description="Theme and display preferences" />
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-medium">Color Theme</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Permissions" description="Capabilities granted to your role" />
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission) => (
              <Badge key={permission} variant="secondary">{permission}</Badge>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
