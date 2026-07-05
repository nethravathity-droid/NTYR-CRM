import { Building2, Eye, Mail, MapPin, Pencil, Phone, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CompanyStatusBadge } from "@/features/companies/components/CompanyStatusBadge";
import { IconBox } from "@/features/companies/components/IconBox";
import type { CompanyListItem } from "@/features/companies/types/company.types";
import { paths } from "@/routes/paths";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface CompanyTableProps {
  companies: CompanyListItem[];
  updatingUuid?: string | null;
  onDelete: (company: CompanyListItem) => void;
  onToggleActive: (company: CompanyListItem, isActive: boolean) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CompanyTable({
  companies,
  updatingUuid,
  onDelete,
  onToggleActive,
}: CompanyTableProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("companies.update");
  const canDelete = hasPermission("companies.delete");

  if (!companies.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
        <IconBox
          icon={Building2}
          tone="indigo"
          size="lg"
          className="mx-auto mb-4"
        />
        <p className="text-lg font-semibold">No companies found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or add a new company.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Company</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Access</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const isPlatform = company.companyCode === "PLATFORM";
            const isUpdating = updatingUuid === company.uuid;

            return (
              <TableRow key={company.uuid} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                        company.isActive
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {getInitials(company.companyName)}
                    </div>
                    <div>
                      <p className="font-semibold">{company.companyName}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {company.companyCode}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{company.ownerName}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {company.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {company.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {company.city}, {company.state}
                  </div>
                </TableCell>
                <TableCell>
                  <CompanyStatusBadge status={company.status} />
                </TableCell>
                <TableCell>
                  {canUpdate && !isPlatform ? (
                    <Switch
                      checked={company.isActive}
                      disabled={isUpdating}
                      onCheckedChange={(isActive) =>
                        onToggleActive(company, isActive)
                      }
                    />
                  ) : (
                    <Badge
                      variant="outline"
                      className={
                        company.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1 opacity-90 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
                      asChild
                    >
                      <Link
                        to={paths.companies.details(company.uuid)}
                        aria-label={`View ${company.companyName}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    {canUpdate ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950"
                        asChild
                      >
                        <Link
                          to={paths.companies.edit(company.uuid)}
                          aria-label={`Edit ${company.companyName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}

                    {canDelete && !isPlatform ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950"
                        onClick={() => onDelete(company)}
                        aria-label={`Delete ${company.companyName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
