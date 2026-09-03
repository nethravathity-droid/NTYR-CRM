import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, UserRound } from "lucide-react";
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
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { PasswordField } from "@/components/shared/PasswordField";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      companyCode: "",
      loginId: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      const loginId = values.loginId.trim();

      await login({
        companyCode: values.companyCode.trim().toUpperCase(),
        password: values.password.trim(),
        username: loginId.toLowerCase(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Login failed. Please try again.",
      );
    }
  });

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in with your company code, username or employee code, and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyCode">Company Code</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="companyCode"
                placeholder="e.g. URC"
                className="pl-10 uppercase"
                autoCapitalize="characters"
                {...form.register("companyCode")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use your company code from the admin dashboard — not PLATFORM.
            </p>
            {form.formState.errors.companyCode ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.companyCode.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="loginId">Username or Employee Code</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="loginId"
                placeholder="e.g. john.doe or EMP001"
                className="pl-10"
                autoComplete="username"
                {...form.register("loginId")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the username or employee code shown when the account was created.
            </p>
            {form.formState.errors.loginId ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.loginId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordField
              id="password"
              label=""
              value={form.getValues("password")}
              onChange={(value) => form.setValue("password", value)}
              placeholder="Enter your password"
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
