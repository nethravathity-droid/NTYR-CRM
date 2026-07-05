import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
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
import { Loading } from "@/components/shared/Loading";
import { CompanyStatusBadge } from "@/features/companies/components/CompanyStatusBadge";
import { CompanyStatusSelect } from "@/features/companies/components/CompanyStatusSelect";
import { DeleteCompanyDialog } from "@/features/companies/components/DeleteCompanyDialog";
import {
  useCompany,
  useDeleteCompany,
  useUpdateCompanyStatus,
} from "@/features/companies/hooks/useCompanies";
import type { CompanyStatus } from "@/features/companies/types/company.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function CompanyDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("companies.update");
  const canDelete = hasPermission("companies.delete");

  const { data: company, isLoading, error } = useCompany(uuid);
  const updateStatus = useUpdateCompanyStatus();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={paths.companies.list} aria-label="Back to companies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {company.companyName}
              </h1>
              <CompanyStatusBadge status={company.status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              {company.companyCode} · Owned by {company.ownerName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canUpdate ? (
            <Button variant="outline" asChild>
              <Link to={paths.companies.edit(company.uuid)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          ) : null}

          {canDelete && !isPlatformCompany ? (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Overview
            </CardTitle>
            <CardDescription>Core business and compliance information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Control tenant access and lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canUpdate ? (
              <CompanyStatusSelect
                value={company.status}
                disabled={isPlatformCompany}
                isUpdating={updateStatus.isPending}
                onChange={(status) => void handleStatusChange(status)}
              />
            ) : (
              <CompanyStatusBadge status={company.status} />
            )}

            <DetailItem
              label="Active Flag"
              value={company.isActive ? "Yes" : "No"}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{company.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{company.phone}</span>
            </div>
            {company.alternatePhone ? (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{company.alternatePhone}</span>
              </div>
            ) : null}
            {company.website ? (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{company.addressLine1}</p>
            {company.addressLine2 ? <p>{company.addressLine2}</p> : null}
            <p>
              {company.city}, {company.state} {company.postalCode}
            </p>
            <p>{company.country}</p>
          </CardContent>
        </Card>
      </div>

      {company.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
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
