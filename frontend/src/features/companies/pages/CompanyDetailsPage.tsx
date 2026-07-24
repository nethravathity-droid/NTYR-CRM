import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/shared/Loading";
import { CompanyActiveSwitch } from "@/features/companies/components/CompanyActiveSwitch";
import { CompanyStatusBadge } from "@/features/companies/components/CompanyStatusBadge";
import { CompanyStatusSelect } from "@/features/companies/components/CompanyStatusSelect";
import { DeleteCompanyDialog } from "@/features/companies/components/DeleteCompanyDialog";
import { CompanyLoginSetupCard } from "@/features/companies/components/CompanyLoginSetupCard";
import { IconBox } from "@/features/companies/components/IconBox";
import {
  useCompany,
  useDeleteCompany,
  useUpdateCompanyActive,
  useUpdateCompanyStatus,
} from "@/features/companies/hooks/useCompanies";
import type { InitialAdminLogin } from "@/features/companies/types/company.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value || "—"}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  value,
  href,
  tone,
}: {
  icon: typeof Mail;
  value: string;
  href?: string;
  tone: "blue" | "emerald" | "violet" | "cyan";
}) {
  const content = href ? (
    <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
      {value}
    </a>
  ) : (
    value
  );

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background/80 p-3">
      <IconBox icon={Icon} tone={tone} size="sm" />
      <span className="text-sm font-medium">{content}</span>
    </div>
  );
}

export function CompanyDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("companies.update");
  const canDelete = hasPermission("companies.delete");

  const flashLogin = location.state as
    | (InitialAdminLogin & { password?: string })
    | undefined;

  const { data: company, isLoading, error } = useCompany(uuid);
  const updateStatus = useUpdateCompanyStatus();
  const updateActive = useUpdateCompanyActive();
  const deleteCompany = useDeleteCompany();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isPlatformCompany = company?.companyCode === "PLATFORM";

  const handleStatusChange = async (status: CompanyStatus) => {
    if (!uuid || !company || company.status === status) {
      return;
    }

    setActionError(null);

    try {
      await updateStatus.mutateAsync({ uuid, status });
    } catch (statusError) {
      setActionError(getApiErrorMessage(statusError));
    }
  };

  const handleActiveChange = async (isActive: boolean) => {
    if (!uuid || !company || company.isActive === isActive) {
      return;
    }

    setActionError(null);

    try {
      await updateActive.mutateAsync({ uuid, isActive });
    } catch (activeError) {
      setActionError(getApiErrorMessage(activeError));
    }
  };

  const handleDelete = async () => {
    if (!uuid) {
      return;
    }

    setActionError(null);

    try {
      await deleteCompany.mutateAsync(uuid);
      navigate(paths.companies.list);
    } catch (deleteError) {
      setActionError(getApiErrorMessage(deleteError));
    }
  };

  if (isLoading) {
    return <Loading label="Loading company details..." />;
  }

  if (error || !company) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error ? getApiErrorMessage(error) : "Company not found"}
      </div>
    );
  }

  const initials = company.companyName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              asChild
            >
              <Link to={paths.companies.list} aria-label="Back to companies">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {company.companyName}
                  </h1>
                  <CompanyStatusBadge status={company.status} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-white/30 bg-white/10 text-white",
                      !company.isActive && "bg-rose-500/20",
                    )}
                  >
                    {company.isActive ? "Access Enabled" : "Access Disabled"}
                  </Badge>
                </div>
                <p className="mt-1 text-indigo-100">
                  {company.companyCode} · Owned by {company.ownerName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <Button
                variant="secondary"
                className="bg-white text-indigo-700 hover:bg-indigo-50"
                asChild
              >
                <Link to={paths.companies.edit(company.uuid)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            ) : null}

            {canDelete && !isPlatformCompany ? (
              <Button
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      {!isPlatformCompany && uuid ? (
        <CompanyLoginSetupCard
          companyUuid={uuid}
          companyCode={company.companyCode}
          canManage={canUpdate}
          flashLogin={flashLogin}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-border/60 lg:col-span-2">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={Building2} tone="indigo" />
              <div>
                <CardTitle>Company Overview</CardTitle>
                <CardDescription>
                  Core business and compliance information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <DetailItem label="Company Code" value={company.companyCode} />
            <DetailItem label="Legal Name" value={company.legalName} />
            <DetailItem label="Owner" value={company.ownerName} />
            <DetailItem label="GST Number" value={company.gstNumber} />
            <DetailItem label="PAN Number" value={company.panNumber} />
            <DetailItem label="RERA Number" value={company.reraNumber} />
            <DetailItem label="Timezone" value={company.timezone} />
            <DetailItem label="Currency" value={company.currency} />
            <DetailItem
              label="Trial Period"
              value={
                company.trialStartDate || company.trialEndDate
                  ? `${company.trialStartDate ?? "—"} to ${company.trialEndDate ?? "—"}`
                  : null
              }
            />
            <DetailItem
              label="Created"
              value={new Date(company.createdAt).toLocaleDateString()}
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={CalendarDays} tone="amber" />
              <div>
                <CardTitle>Status & Access</CardTitle>
                <CardDescription>Control tenant lifecycle.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {canUpdate ? (
              <>
                <CompanyStatusSelect
                  value={company.status}
                  disabled={isPlatformCompany}
                  isUpdating={updateStatus.isPending}
                  onChange={(status) => void handleStatusChange(status)}
                />

                <CompanyActiveSwitch
                  checked={company.isActive}
                  disabled={isPlatformCompany}
                  isUpdating={updateActive.isPending}
                  onCheckedChange={(isActive) => void handleActiveChange(isActive)}
                />
              </>
            ) : (
              <>
                <CompanyStatusBadge status={company.status} />
                <DetailItem
                  label="Active Flag"
                  value={company.isActive ? "Yes" : "No"}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={Phone} tone="emerald" />
              <CardTitle>Contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <ContactRow icon={Mail} value={company.email} tone="blue" />
            <ContactRow icon={Phone} value={company.phone} tone="emerald" />
            {company.alternatePhone ? (
              <ContactRow
                icon={Phone}
                value={company.alternatePhone}
                tone="violet"
              />
            ) : null}
            {company.website ? (
              <ContactRow
                icon={Globe}
                value={company.website}
                href={company.website}
                tone="cyan"
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={MapPin} tone="rose" />
              <CardTitle>Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-6 text-sm">
            <p className="font-medium">{company.addressLine1}</p>
            {company.addressLine2 ? <p>{company.addressLine2}</p> : null}
            <p className="text-muted-foreground">
              {company.city}, {company.state} {company.postalCode}
            </p>
            <p className="text-muted-foreground">{company.country}</p>
          </CardContent>
        </Card>
      </div>

      {company.notes ? (
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <IconBox icon={Receipt} tone="violet" />
              <CardTitle>Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {company.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <DeleteCompanyDialog
        company={{
          id: company.id,
          uuid: company.uuid,
          companyCode: company.companyCode,
          companyName: company.companyName,
          ownerName: company.ownerName,
          email: company.email,
          phone: company.phone,
          city: company.city,
          state: company.state,
          country: company.country,
          status: company.status,
          isActive: company.isActive,
          createdAt: company.createdAt,
        }}
        open={showDeleteDialog}
        isDeleting={deleteCompany.isPending}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
