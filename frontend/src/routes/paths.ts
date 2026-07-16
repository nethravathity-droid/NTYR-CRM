import { getRoleDashboardPath, rolePath } from "@/lib/rbac/roles";

export { getRoleDashboardPath };

export const paths = {
  login: "/login",
  forbidden: "/forbidden",
  get dashboard() {
    return rolePath("/dashboard");
  },
  get settings() {
    return rolePath("/settings");
  },
  platform: {
    get subscriptions() {
      return rolePath("/subscriptions");
    },
    get activityLog() {
      return rolePath("/activity-log");
    },
    get analytics() {
      return rolePath("/analytics");
    },
  },
  companies: {
    get list() {
      return rolePath("/companies");
    },
    get create() {
      return rolePath("/companies/new");
    },
    details: (uuid: string) => rolePath(`/companies/${uuid}`),
    edit: (uuid: string) => rolePath(`/companies/${uuid}/edit`),
  },
  employees: {
    get list() {
      return rolePath("/employees");
    },
    get create() {
      return rolePath("/employees/new");
    },
    details: (uuid: string) => rolePath(`/employees/${uuid}`),
    edit: (uuid: string) => rolePath(`/employees/${uuid}/edit`),
  },
  leads: {
    get list() {
      return rolePath("/leads");
    },
    get create() {
      return rolePath("/leads/new");
    },
    get import() {
      return rolePath("/leads/import");
    },
    get assign() {
      return rolePath("/leads/assign");
    },
    details: (uuid: string) => rolePath(`/leads/${uuid}`),
    edit: (uuid: string) => rolePath(`/leads/${uuid}/edit`),
  },
  followups: {
    get list() {
      return rolePath("/followups");
    },
    get today() {
      return rolePath("/followups/today");
    },
    get create() {
      return rolePath("/followups/new");
    },
    edit: (uuid: string) => rolePath(`/followups/${uuid}/edit`),
    timeline: (uuid: string) => rolePath(`/followups/${uuid}/timeline`),
    get calendar() {
      return rolePath("/followups/calendar");
    },
  },
  projects: {
    get list() {
      return rolePath("/projects");
    },
    get create() {
      return rolePath("/projects/new");
    },
    get inventory() {
      return rolePath("/projects/inventory");
    },
    details: (uuid: string) => rolePath(`/projects/${uuid}`),
    edit: (uuid: string) => rolePath(`/projects/${uuid}/edit`),
    towers: (uuid: string) => rolePath(`/projects/${uuid}/towers`),
    units: (uuid?: string) =>
      uuid ? rolePath(`/projects/${uuid}/units`) : rolePath("/projects/units"),
  },
  visits: {
    get list() {
      return rolePath("/visits");
    },
    get create() {
      return rolePath("/visits/new");
    },
    details: (uuid: string) => rolePath(`/visits/${uuid}`),
    edit: (uuid: string) => rolePath(`/visits/${uuid}/edit`),
    get calendar() {
      return rolePath("/visits/calendar");
    },
  },
  bookings: {
    get list() {
      return rolePath("/bookings");
    },
    get create() {
      return rolePath("/bookings/new");
    },
    get approvals() {
      return rolePath("/bookings/approvals");
    },
    details: (uuid: string) => rolePath(`/bookings/${uuid}`),
    edit: (uuid: string) => rolePath(`/bookings/${uuid}/edit`),
    documents: (uuid: string) => rolePath(`/bookings/${uuid}/documents`),
  },
  payments: {
    get dashboard() {
      return rolePath("/payments");
    },
    get list() {
      return rolePath("/payments/list");
    },
    get create() {
      return rolePath("/payments/new");
    },
    get schedule() {
      return rolePath("/payments/schedule");
    },
    details: (uuid: string) => rolePath(`/payments/${uuid}`),
    edit: (uuid: string) => rolePath(`/payments/${uuid}/edit`),
    receipt: (uuid: string) => rolePath(`/payments/${uuid}/receipt`),
  },
  calls: {
    get dashboard() {
      return rolePath("/calls");
    },
    get list() {
      return rolePath("/calls/list");
    },
    get create() {
      return rolePath("/calls/new");
    },
    details: (uuid: string) => rolePath(`/calls/${uuid}`),
    edit: (uuid: string) => rolePath(`/calls/${uuid}/edit`),
  },
  reports: {
    get dashboard() {
      return rolePath("/reports");
    },
    get leads() {
      return rolePath("/reports/leads");
    },
    get sales() {
      return rolePath("/reports/sales");
    },
    get employees() {
      return rolePath("/reports/employees");
    },
    get followups() {
      return rolePath("/reports/followups");
    },
    get visits() {
      return rolePath("/reports/visits");
    },
    get bookings() {
      return rolePath("/reports/bookings");
    },
    get payments() {
      return rolePath("/reports/payments");
    },
  },
  notFound: "*",
} as const;
