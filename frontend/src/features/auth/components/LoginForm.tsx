import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, KeyRound, Loader2, UserRound } from "lucide-react";
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

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      companyCode: "",
      loginType: "username",
      username: "",
      employeeCode: "",
      password: "",
    },
  });

  const loginType = form.watch("loginType");

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      const payload =
        values.loginType === "username"
          ? {
              companyCode: values.companyCode.trim().toUpperCase(),
              password: values.password,
              username: values.username?.trim(),
            }
          : {
              companyCode: values.companyCode.trim().toUpperCase(),
              password: values.password,
              employeeCode: values.employeeCode?.trim().toUpperCase(),
            };

      await login(payload);
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
          Sign in to your company workspace to continue
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
                placeholder="e.g. ACME"
                className="pl-10"
                {...form.register("companyCode")}
              />
            </div>
            {form.formState.errors.companyCode && (
              <p className="text-sm text-destructive">
                {form.formState.errors.companyCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Login with</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={loginType === "username" ? "default" : "outline"}
                onClick={() => form.setValue("loginType", "username")}
              >
                Username
              </Button>
              <Button
                type="button"
                variant={loginType === "employeeCode" ? "default" : "outline"}
                onClick={() => form.setValue("loginType", "employeeCode")}
              >
                Employee Code
              </Button>
            </div>
          </div>

          {loginType === "username" ? (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  className="pl-10"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="employeeCode"
                  placeholder="e.g. EMP001"
                  className="pl-10"
                  {...form.register("employeeCode")}
                />
              </div>
              {form.formState.errors.employeeCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.employeeCode.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10"
                {...form.register("password")}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
