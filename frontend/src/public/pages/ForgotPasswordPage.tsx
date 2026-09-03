import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authService } from "@/features/auth/services/auth.service";

const forgotPasswordSchema = z.object({
  companyCode: z.string().trim().min(1, "Company code is required").max(50),
  email: z.string().trim().email("Enter a valid email").max(255),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      companyCode: "",
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSubmitted(false);

    try {
      await authService.forgotPassword(values);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Request failed. Please try again.",
      );
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10">
        <Card className="w-full max-w-md border-border/60 shadow-xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Forgot password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your company code and email to receive a reset link.
            </p>
          </div>
          <div className="border-t" />
          <div className="p-6">
            {submitted ? (
              <div className="text-center">
                <p className="text-lg font-medium">Check your email</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account exists, you will receive a password reset link.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyCode">Company Code</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="companyCode"
                      className="pl-10 uppercase"
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
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {(form.formState.isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Reset Link
                </Button>
              </form>
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
