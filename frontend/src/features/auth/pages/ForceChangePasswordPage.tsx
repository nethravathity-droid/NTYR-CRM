import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/auth.service";
import { getApiErrorMessage } from "@/lib/api/client";
import { getRoleDashboardPath } from "@/lib/rbac/roles";

const passwordPolicy = new RegExp(
  "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,128}$",
);

/**
 * Full-screen gate shown right after login when the backend flags
 * `mustChangePassword` on the user. Blocks the whole app until the
 * password is changed via the existing /auth/change-password endpoint.
 */
export function ForceChangePasswordPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordPolicy.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
      );
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      await refreshUser();
      navigate(getRoleDashboardPath(user?.role.code), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Change your password</CardTitle>
          <CardDescription>
            Your account uses a temporary password. Set a new password to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Temporary password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Set new password and continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
