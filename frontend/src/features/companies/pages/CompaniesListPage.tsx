import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanySearchBar } from "@/features/companies/components/CompanySearchBar";
import { CompanyTable } from "@/features/companies/components/CompanyTable";
import { DeleteCompanyDialog } from "@/features/companies/components/DeleteCompanyDialog";
import {
  useCompanies,
  useDeleteCompany,
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, error } = useCompanies({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const deleteCompany = useDeleteCompany();

  const handleStatusChange = (value: CompanyStatus | "") => {
    setStatus(value);
    setPage(1);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage tenant companies across the platform.
          </p>
        </div>

        {canCreate ? (
          <Button asChild>
            <Link to={paths.companies.create}>
              <Plus className="h-4 w-4" />
              Add Company
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Directory</CardTitle>
          <CardDescription>
            Search, filter, and manage registered companies.
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

          {!isLoading && !error ? (
            <>
              <CompanyTable
                companies={companies}
                onDelete={(company) => {
                  setDeleteError(null);
                  setCompanyToDelete(company);
                }}
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
