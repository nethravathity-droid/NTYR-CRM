import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, MapPin, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordField } from "@/components/shared/PasswordField";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import { COUNTRIES, STATES_BY_COUNTRY } from "@/features/companies/constants/countries";
import { getRoleDashboardPath } from "@/lib/rbac/roles";
import { paths } from "@/routes/paths";

function slugCompanyCode(name: string): string {
  const slug = name
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20)
    .toUpperCase();
  return slug.length >= 2 ? slug : "";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerWorkspace, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema) as Resolver<RegisterFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      companyCode: "",
      addressLine1: "",
      city: "",
      state: "Karnataka",
      country: "India",
      postalCode: "",
      username: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
      agreePrivacy: false,
    },
  });

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const companyName = form.watch("companyName");
  const companyCode = form.watch("companyCode");
  const country = form.watch("country");

  const stateOptions: Array<{ value: string; label: string }> = useMemo(
    () => [...(STATES_BY_COUNTRY[country as keyof typeof STATES_BY_COUNTRY] ?? [])],
    [country],
  );

  useEffect(() => {
    if (companyCode.trim()) return;
    const suggested = slugCompanyCode(companyName);
    if (suggested) {
      form.setValue("companyCode", suggested, { shouldValidate: false });
    }
  }, [companyName, companyCode, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      const ownerName = [values.firstName, values.lastName].filter(Boolean).join(" ");
      const normalizedCode = values.companyCode.trim().toUpperCase();
      const normalizedUsername = values.username.trim().toLowerCase();

      const result = await registerWorkspace({
        companyCode: normalizedCode,
        companyName: values.companyName.trim(),
        ownerName,
        email: values.email.trim(),
        phone: values.phone.trim(),
        addressLine1: values.addressLine1.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        country: values.country,
        postalCode: values.postalCode.trim(),
        username: normalizedUsername,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        displayName: ownerName || normalizedUsername,
      });

      navigate(getRoleDashboardPath(result.user.role.code), { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Please try again.",
      );
    }
  });

  return (
    <Card className="w-full border-border/60 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Start your free trial</CardTitle>
        <CardDescription>
          Create your company workspace and admin login in one step.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto pr-1">
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Personal information
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />
              {form.formState.errors.firstName ? (
                <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email *</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number *</Label>
            <Input id="phone" autoComplete="tel" placeholder="9876543210" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>

          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Company information
          </p>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name *</Label>
            <Input id="companyName" {...form.register("companyName")} placeholder="Namma Bengaluru Realty" />
            {form.formState.errors.companyName ? (
              <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyCode">Company code *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="companyCode"
                className="pl-10 uppercase"
                autoComplete="off"
                {...form.register("companyCode")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Employees use this code at login (e.g. URC). Letters, numbers, hyphen, underscore only.
            </p>
            {form.formState.errors.companyCode ? (
              <p className="text-sm text-destructive">{form.formState.errors.companyCode.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Office address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="addressLine1"
                className="pl-10"
                placeholder="Building, street, area"
                {...form.register("addressLine1")}
              />
            </div>
            {form.formState.errors.addressLine1 ? (
              <p className="text-sm text-destructive">{form.formState.errors.addressLine1.message}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...form.register("city")} placeholder="Bengaluru" />
              {form.formState.errors.city ? (
                <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">PIN / postal code *</Label>
              <Input id="postalCode" {...form.register("postalCode")} placeholder="560001" />
              {form.formState.errors.postalCode ? (
                <p className="text-sm text-destructive">{form.formState.errors.postalCode.message}</p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                id="country"
                value={country}
                onChange={(event) => {
                  const nextCountry = event.target.value;
                  form.setValue("country", nextCountry);
                  const states = STATES_BY_COUNTRY[nextCountry as keyof typeof STATES_BY_COUNTRY];
                  form.setValue("state", states?.[0]?.value ?? "");
                }}
              >
                {COUNTRIES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select id="state" {...form.register("state")}>
                {!stateOptions.length ? (
                  <option value="">Select state</option>
                ) : (
                  stateOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))
                )}
              </Select>
              {form.formState.errors.state ? (
                <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
              ) : null}
            </div>
          </div>

          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Admin account
          </p>
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                className="pl-10"
                autoComplete="username"
                {...form.register("username")}
              />
            </div>
            {form.formState.errors.username ? (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <PasswordField
              id="password"
              label="Password *"
              value={passwordValue}
              onChange={(value) => form.setValue("password", value, { shouldValidate: true })}
              placeholder="Create a strong password"
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <PasswordField
              id="confirmPassword"
              label="Confirm password *"
              value={confirmPasswordValue}
              onChange={(value) => form.setValue("confirmPassword", value, { shouldValidate: true })}
              placeholder="Repeat your password"
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border" {...form.register("agreeTerms")} />
              <span className="text-sm">
                I agree to the{" "}
                <Link to={paths.terms} className="text-primary hover:underline" target="_blank">
                  Terms & Conditions
                </Link>
              </span>
            </label>
            {form.formState.errors.agreeTerms ? (
              <p className="text-sm text-destructive">{form.formState.errors.agreeTerms.message}</p>
            ) : null}
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border" {...form.register("agreePrivacy")} />
              <span className="text-sm">
                I agree to the{" "}
                <Link to={paths.privacy} className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {form.formState.errors.agreePrivacy ? (
              <p className="text-sm text-destructive">{form.formState.errors.agreePrivacy.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || form.formState.isSubmitting}
          >
            {(isLoading || form.formState.isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating workspace...
              </>
            ) : (
              "Create free account"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to={paths.login} className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
