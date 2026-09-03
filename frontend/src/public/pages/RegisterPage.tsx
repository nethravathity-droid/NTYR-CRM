import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/auth.service";
import { paths } from "@/routes/paths";

const registerSchema = z.object({
  firstName: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  lastName: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  companyName: z.string().trim().min(2, "Company name is required").max(200),
  companyCode: z
    .string()
    .trim()
    .min(2, "Company code must be at least 2 characters")
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid username format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
  agreePrivacy: z.boolean().refine((v) => v === true, "You must agree to the privacy policy"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ companyCode: string; companyName: string; email: string } | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      companyCode: "",
      username: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
      agreePrivacy: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);

    try {
      const { confirmPassword: _confirmPassword, agreeTerms: _agreeTerms, agreePrivacy: _agreePrivacy, ...payload } = values;
      
      const result = await authService.register({
        companyCode: payload.companyCode,
        companyName: payload.companyName,
        ownerName: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || payload.email,
        email: payload.email,
        phone: payload.phone,
        city: "",
        state: "",
        postalCode: "",
        addressLine1: "",
        username: payload.username,
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        displayName: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || payload.username,
      });

      await login({
        companyCode: payload.companyCode,
        username: payload.username,
        password: payload.password,
      });

      setResult({
        companyCode: result.user.company.code,
        companyName: result.user.company.name,
        email: result.user.user.officialEmail || payload.email,
      });
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Please try again.",
      );
    }
  });

  if (success && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10">
          <Card className="w-full max-w-md p-8 text-center">
            <h2 className="text-2xl font-bold">Your workspace is ready</h2>
            <p className="mt-2 text-muted-foreground">
              You can now sign in to your CRM dashboard.
            </p>
            <div className="mt-6 space-y-2 text-left">
              <p className="text-sm"><span className="font-medium">Workspace:</span> {result.companyName}</p>
              <p className="text-sm"><span className="font-medium">Code:</span> {result.companyCode}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {result.email}</p>
            </div>
            <Button className="mt-6 w-full" asChild>
              <a href={paths.dashboard}>Continue to CRM</a>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10 lg:flex-row lg:justify-between">
        <div className="max-w-xl space-y-4 text-center lg:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            All-in-One CRM
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Start your free trial
          </h1>
          <p className="text-lg text-muted-foreground">
            Create your workspace in just a few minutes.
          </p>
        </div>
        <Card className="w-full max-w-md border-border/60 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                PERSONAL INFORMATION
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...form.register("firstName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...form.register("lastName")} />
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <p className="text-sm font-medium text-muted-foreground pt-4">
                COMPANY INFORMATION
              </p>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...form.register("companyName")} />
                {form.formState.errors.companyName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>
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

              <p className="text-sm font-medium text-muted-foreground pt-4">
                ACCOUNT INFORMATION
              </p>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="username" className="pl-10" {...form.register("username")} />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
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

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register("agreeTerms")}
                    className="h-4 w-4 rounded border"
                  />
                  <span className="text-sm">
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline" target="_blank">
                      Terms & Conditions
                    </a>
                  </span>
                </label>
                {form.formState.errors.agreeTerms && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.agreeTerms.message}
                  </p>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register("agreePrivacy")}
                    className="h-4 w-4 rounded border"
                  />
                  <span className="text-sm">
                    I agree to the{" "}
                    <a href="/privacy" className="text-primary hover:underline" target="_blank">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {form.formState.errors.agreePrivacy && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.agreePrivacy.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
                {(isLoading || form.formState.isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Free Account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Log in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
