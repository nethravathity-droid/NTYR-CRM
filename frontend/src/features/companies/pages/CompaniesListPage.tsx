import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { CompanySearchBar } from "@/features/companies/components/CompanySearchBar";
import { CompanyStatsRow } from "@/features/companies/components/CompanyStatsRow";
import { CompanyTable } from "@/features/companies/components/CompanyTable";
import { DeleteCompanyDialog } from "@/features/companies/components/DeleteCompanyDialog";
import {
  useCompanies,
  useDeleteCompany,
  useUpdateCompanyActive,
} from "@/features/companies/hooks/useCompanies";
import type {
  CompanyListItem,
  CompanyStatus,
} from "@/features/companies/types/company.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CompaniesListPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("companies.create");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "">("");
  const [companyToDelete, setCompanyToDelete] = useState<CompanyListItem | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [updatingUuid, setUpdatingUuid] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listParams = {
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    sortBy: "created_at" as const,
    sortOrder: "desc" as const,
  };

  const { data, isLoading, isFetching, error } = useCompanies(listParams);
  const { data: statsData } = useCompanies({
    page: 1,
    limit: 100,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const deleteCompany = useDeleteCompany();
  const updateActive = useUpdateCompanyActive();

  const handleStatusChange = (value: CompanyStatus | "") => {
    setStatus(value);
    setPage(1);
  };

  const handleToggleActive = async (
    company: CompanyListItem,
    isActive: boolean,
  ) => {
    setToggleError(null);
    setUpdatingUuid(company.uuid);

    try {
      await updateActive.mutateAsync({ uuid: company.uuid, isActive });
    } catch (toggleErr) {
      setToggleError(getApiErrorMessage(toggleErr));
    } finally {
      setUpdatingUuid(null);
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteCompany.mutateAsync(companyToDelete.uuid);
      setCompanyToDelete(null);
    } catch (deleteErr) {
      setDeleteError(getApiErrorMessage(deleteErr));
    }
  };

  const pagination = data?.pagination;
  const companies = data?.companies ?? [];

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Building2}
        tone="indigo"
        title="Companies"
        description="Manage tenant companies across the platform."
        action={
          canCreate ? (
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link to={paths.companies.create}>
                <Plus className="h-4 w-4" />
                Add Company
              </Link>
            </Button>
          ) : null
        }
      />

      {statsData ? (
        <CompanyStatsRow
          companies={statsData.companies}
          total={statsData.pagination.total}
        />
      ) : null}

      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle>Company Directory</CardTitle>
          <CardDescription>
            Search, filter, activate, and manage registered companies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CompanySearchBar
            search={searchInput}
            status={status}
            onSearchChange={setSearchInput}
            onStatusChange={handleStatusChange}
            onClear={() => {
              setSearchInput("");
              setSearch("");
              setStatus("");
              setPage(1);
            }}
          />

          {isLoading ? <Loading label="Loading companies..." /> : null}

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {getApiErrorMessage(error)}
            </div>
          ) : null}

          {toggleError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {toggleError}
            </div>
          ) : null}

          {!isLoading && !error ? (
            <>
              <CompanyTable
                companies={companies}
                updatingUuid={updatingUuid}
                onDelete={(company) => {
                  setDeleteError(null);
                  setCompanyToDelete(company);
                }}
                onToggleActive={(company, isActive) =>
                  void handleToggleActive(company, isActive)
                }
              />

              {pagination && pagination.totalPages > 1 ? (
                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.totalPages} ·{" "}
                    {pagination.total} total companies
                    {isFetching ? " · Updating..." : ""}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <DeleteCompanyDialog
        company={companyToDelete}
        open={Boolean(companyToDelete)}
        isDeleting={deleteCompany.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setCompanyToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />

      {deleteError ? (
        <p className="text-sm text-destructive">{deleteError}</p>
      ) : null}
    </div>
  );
}
