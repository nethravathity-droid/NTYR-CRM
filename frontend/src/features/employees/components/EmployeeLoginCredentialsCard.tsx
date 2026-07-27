import { Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBox } from "@/features/companies/components/IconBox";

export type EmployeeLoginCredentials = {
  companyCode: string;
  username: string;
  employeeCode: string;
  password?: string;
  displayName?: string;
  roleName?: string;
};

function copyText(value: string) {
  void navigator.clipboard.writeText(value);
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background/80 px-3 py-2">
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 shrink-0"
        onClick={() => copyText(value)}
      >
        <Copy className="mr-1 h-3.5 w-3.5" />
        Copy
      </Button>
    </li>
  );
}

interface EmployeeLoginCredentialsCardProps {
  credentials: EmployeeLoginCredentials;
  title?: string;
  description?: string;
  showPasswordWarning?: boolean;
}

export function EmployeeLoginCredentialsCard({
  credentials,
  title = "Employee login credentials",
  description = "Each employee has a separate username and password. Share these for sign-in on the main login page.",
  showPasswordWarning = true,
}: EmployeeLoginCredentialsCardProps) {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500/20">
      <CardHeader className="border-b border-emerald-500/20 pb-4">
        <div className="flex items-start gap-3">
          <IconBox icon={KeyRound} tone="emerald" />
          <div>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {credentials.displayName ? (
          <p className="text-sm font-medium">
            {credentials.displayName}
            {credentials.roleName ? (
              <span className="ml-2 font-normal text-muted-foreground">
                · {credentials.roleName}
              </span>
            ) : null}
          </p>
        ) : null}

        <ul className="space-y-2 text-sm">
          <CredentialRow label="Company code" value={credentials.companyCode} />
          <CredentialRow label="Username" value={credentials.username} />
          <CredentialRow label="Employee code" value={credentials.employeeCode} />
          {credentials.password ? (
            <CredentialRow label="Password" value={credentials.password} />
          ) : null}
        </ul>

        {showPasswordWarning && credentials.password ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Save this password now. It cannot be viewed again. Use Reset Password on the employee
            profile if needed.
          </p>
        ) : null}

        {!credentials.password ? (
          <p className="text-xs text-muted-foreground">
            Password is hidden for security. Set a new password with Reset Password if the employee
            forgot theirs.
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Login page: company code + username (or employee code) + password.
        </p>
      </CardContent>
    </Card>
  );
}
