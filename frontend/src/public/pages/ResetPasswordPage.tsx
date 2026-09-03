import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authService } from "@/features/auth/services/auth.service";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalid, setInvalid] = useState(!token);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setInvalid(true);
    }
  }, [token]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);

    if (!token) {
      setInvalid(true);
      return;
    }

    try {
      await authService.resetPassword({
        token,
        password: values.password,
      });

      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Reset failed. Please try again.",
      );
    }
  });

  if (invalid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10">
          <Card className="w-full max-w-md p-8 text-center">
            <h2 className="text-2xl font-bold">Invalid or expired link</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
            <Button className="mt-6 w-full" asChild>
              <a href="/forgot-password">Request a new link</a>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10">
        <Card className="w-full max-w-md border-border/60 shadow-xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>
          <div className="border-t" />
          <div className="p-6">
            {success ? (
              <div className="text-center">
                <p className="text-lg font-medium">Password reset successful</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
                <Button className="mt-6 w-full" asChild>
                  <a href="/login">Sign in</a>
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Reset Password
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
