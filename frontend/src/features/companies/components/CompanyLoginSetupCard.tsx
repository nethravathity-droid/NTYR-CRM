import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { IconBox } from "@/features/companies/components/IconBox";
import {
  useCompanyLoginSetup,
  useProvisionInitialAdmin,
} from "@/features/companies/hooks/useCompanies";
import type { InitialAdminLogin } from "@/features/companies/types/company.types";
import { getApiErrorMessage } from "@/lib/api/client";

function LoginCredentialsBox({
  companyCode,
  login,
  passwordHint,
}: {
  companyCode: string;
  login: InitialAdminLogin;
  passwordHint?: string;
}) {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
      <p className="font-medium text-emerald-800 dark:text-emerald-200">Login credentials</p>
      <ul className="mt-2 space-y-1 font-mono text-xs sm:text-sm">
        <li>
          <span className="text-muted-foreground">Company code:</span> {companyCode}
        </li>
        <li>
          <span className="text-muted-foreground">Username:</span> {login.username}
        </li>
        <li>
          <span className="text-muted-foreground">Employee code:</span> {login.employeeCode}
        </li>
        {passwordHint ? (
          <li>
            <span className="text-muted-foreground">Password:</span> {passwordHint}
          </li>
        ) : null}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Use these on the main login page (log out of super admin first). Company code is not case
        sensitive.
      </p>
    </div>
  );
}

interface CompanyLoginSetupCardProps {
  companyUuid: string;
  companyCode: string;
  canManage: boolean;
  flashLogin?: InitialAdminLogin & { password?: string };
}

export function CompanyLoginSetupCard({
  companyUuid,
  companyCode,
  canManage,
  flashLogin,
}: CompanyLoginSetupCardProps) {
  const { data: setup, isLoading } = useCompanyLoginSetup(companyUuid);
  const provision = useProvisionInitialAdmin(companyUuid);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [employeeCode, setEmployeeCode] = useState("ADM001");
  const [createdLogin, setCreatedLogin] = useState<InitialAdminLogin | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProvision = async () => {
    setError(null);
    try {
      const result = await provision.mutateAsync({
        username,
        password,
        employeeCode: employeeCode || "ADM001",
      });
      setCreatedLogin(result.initialAdmin);
      setPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Checking login setup..." />;
  }

  const hasAdmin = setup?.hasAdminUser ?? false;
  const displayCode = setup?.companyCode ?? companyCode;

  if (flashLogin && flashLogin.companyCode === displayCode) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <IconBox icon={KeyRound} tone="violet" />
            <div>
              <CardTitle>Tenant login</CardTitle>
              <CardDescription>Share these with the company admin.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <LoginCredentialsBox
            companyCode={flashLogin.companyCode}
            login={flashLogin}
            passwordHint={flashLogin.password ? "(password you set at creation)" : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  if (createdLogin) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Tenant login created</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <LoginCredentialsBox
            companyCode={displayCode}
            login={createdLogin}
            passwordHint="(password you just set)"
          />
        </CardContent>
      </Card>
    );
  }

  if (hasAdmin) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <IconBox icon={KeyRound} tone="violet" />
            <div>
              <CardTitle>Tenant login</CardTitle>
              <CardDescription>A company admin account exists for this tenant.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <p className="text-sm">
            <span className="text-muted-foreground">Company code:</span>{" "}
            <span className="font-mono font-semibold">{displayCode}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Users sign in with company code + username (or employee code) + password. If credentials
            were lost, reset the admin password from Employees after logging in as that company, or
            create a new admin user below only if none exists.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canManage) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm ring-1 ring-amber-500/30">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <IconBox icon={KeyRound} tone="amber" />
          <div>
            <CardTitle>Create tenant login</CardTitle>
            <CardDescription>
              No company admin yet. Set username and password so they can log in with company code{" "}
              <span className="font-mono">{displayCode}</span>.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="provision-username">Username</Label>
            <Input
              id="provision-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provision-password">Password</Label>
            <Input
              id="provision-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provision-employee-code">Employee code</Label>
            <Input
              id="provision-employee-code"
              value={employeeCode}
              onChange={(event) => setEmployeeCode(event.target.value)}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          type="button"
          onClick={() => void handleProvision()}
          disabled={provision.isPending || password.length < 8}
        >
          Create company admin login
        </Button>
      </CardContent>
    </Card>
  );
}
