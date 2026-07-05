import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { CompanyStatusBadge } from "@/features/companies/components/CompanyStatusBadge";
import type { CompanyListItem } from "@/features/companies/types/company.types";
import { paths } from "@/routes/paths";
import { usePermissions } from "@/hooks/usePermissions";

interface CompanyTableProps {
  companies: CompanyListItem[];
  onDelete: (company: CompanyListItem) => void;
}

export function CompanyTable({ companies, onDelete }: CompanyTableProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("companies.update");
  const canDelete = hasPermission("companies.delete");

  if (!companies.length) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-lg font-medium">No companies found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or add a new company.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.uuid}>
              <TableCell className="font-medium">{company.companyCode}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{company.companyName}</p>
                  <p className="text-xs text-muted-foreground">{company.email}</p>
                </div>
              </TableCell>
              <TableCell>{company.ownerName}</TableCell>
              <TableCell>{company.phone}</TableCell>
              <TableCell>
                {company.city}, {company.state}
              </TableCell>
              <TableCell>
                <CompanyStatusBadge status={company.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      to={paths.companies.details(company.uuid)}
                      aria-label={`View ${company.companyName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  {canUpdate ? (
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        to={paths.companies.edit(company.uuid)}
                        aria-label={`Edit ${company.companyName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}

                  {canDelete && company.companyCode !== "PLATFORM" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(company)}
                      aria-label={`Delete ${company.companyName}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
