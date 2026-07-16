import { bookingsService } from "@/features/bookings/services/bookings.service";
import { companiesService } from "@/features/companies/services/companies.service";
import { employeesService } from "@/features/employees/services/employees.service";
import { leadsService } from "@/features/leads/services/leads.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import { propertiesService } from "@/features/properties/services/properties.service";
import { visitsService } from "@/features/visits/services/visits.service";
import type { CommandItem } from "@/lib/rbac/command-items";
import { matchesQuery } from "@/lib/search/match-query";
import type { GlobalSearchPermissions, GlobalSearchResult } from "@/lib/search/global-search.types";
import { paths } from "@/routes/paths";

const SEARCH_LIMIT = 5;

export function filterNavigationItems(items: CommandItem[], query: string): GlobalSearchResult[] {
  const term = query.trim();
  if (!term) {
    return items.slice(0, 10).map((item) => ({
      id: `page-${item.id}`,
      type: "page",
      label: item.label,
      subtitle: item.group,
      href: item.href,
      group: "Pages",
    }));
  }

  return items
    .filter((item) => matchesQuery(`${item.label} ${item.group} ${item.keywords ?? ""}`, term))
    .map((item) => ({
      id: `page-${item.id}`,
      type: "page",
      label: item.label,
      subtitle: item.group,
      href: item.href,
      group: "Pages",
    }));
}

export async function searchRecords(
  query: string,
  permissions: GlobalSearchPermissions,
): Promise<GlobalSearchResult[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const tasks: Array<Promise<GlobalSearchResult[]>> = [];

  if (permissions.leads) {
    tasks.push(
      leadsService.list({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ leads }) =>
        leads.map((lead) => ({
          id: `lead-${lead.uuid}`,
          type: "lead" as const,
          label: lead.customerName,
          subtitle: `${lead.leadNumber} · ${lead.mobile}${lead.leadSource ? ` · ${lead.leadSource}` : ""}`,
          href: paths.leads.details(lead.uuid),
          group: "Leads",
        })),
      ),
    );
  }

  if (permissions.employees) {
    tasks.push(
      employeesService.list({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ users }) =>
        users.map((employee) => ({
          id: `employee-${employee.uuid}`,
          type: "employee" as const,
          label: employee.displayName ?? `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
          subtitle: `${employee.employeeCode} · ${employee.officialEmail ?? employee.mobile}`,
          href: paths.employees.details(employee.uuid),
          group: "Employees",
        })),
      ),
    );
  }

  if (permissions.bookings) {
    tasks.push(
      bookingsService.list({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ bookings }) =>
        bookings.map((booking) => ({
          id: `booking-${booking.uuid}`,
          type: "booking" as const,
          label: booking.customerName,
          subtitle: `${booking.bookingNumber} · ${booking.project.projectName}`,
          href: paths.bookings.details(booking.uuid),
          group: "Bookings",
        })),
      ),
    );
  }

  if (permissions.visits) {
    tasks.push(
      visitsService.list({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ visits }) =>
        visits.map((visit) => ({
          id: `visit-${visit.uuid}`,
          type: "visit" as const,
          label: visit.customerName,
          subtitle: `${visit.visitDate} · ${visit.status}`,
          href: paths.visits.details(visit.uuid),
          group: "Visits",
        })),
      ),
    );
  }

  if (permissions.projects) {
    tasks.push(
      propertiesService.listProjects({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ projects }) =>
        projects.map((project) => ({
          id: `project-${project.uuid}`,
          type: "project" as const,
          label: project.projectName,
          subtitle: `${project.projectCode} · ${project.city ?? "—"}`,
          href: paths.projects.details(project.uuid),
          group: "Projects",
        })),
      ),
    );
  }

  if (permissions.payments) {
    tasks.push(
      paymentsService.list({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ payments }) =>
        payments.map((payment) => ({
          id: `payment-${payment.uuid}`,
          type: "payment" as const,
          label: payment.customerName,
          subtitle: `${payment.paymentNumber} · ${payment.status}`,
          href: paths.payments.details(payment.uuid),
          group: "Payments",
        })),
      ),
    );
  }

  if (permissions.companies) {
    tasks.push(
      companiesService.list({ page: 1, limit: SEARCH_LIMIT, search: term }).then(({ companies }) =>
        companies.map((company) => ({
          id: `company-${company.uuid}`,
          type: "company" as const,
          label: company.companyName,
          subtitle: `${company.companyCode} · ${company.city}`,
          href: paths.companies.details(company.uuid),
          group: "Companies",
        })),
      ),
    );
  }

  const settled = await Promise.allSettled(tasks);
  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}
