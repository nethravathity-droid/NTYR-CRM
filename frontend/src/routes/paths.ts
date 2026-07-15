export const paths = {
  login: "/login",
  dashboard: "/",
  companies: {
    list: "/companies",
    create: "/companies/new",
    details: (uuid: string) => `/companies/${uuid}`,
    edit: (uuid: string) => `/companies/${uuid}/edit`,
  },
  employees: {
    list: "/employees",
    create: "/employees/new",
    details: (uuid: string) => `/employees/${uuid}`,
    edit: (uuid: string) => `/employees/${uuid}/edit`,
  },
  leads: {
    list: "/leads",
    create: "/leads/new",
    import: "/leads/import",
    assign: "/leads/assign",
    details: (uuid: string) => `/leads/${uuid}`,
    edit: (uuid: string) => `/leads/${uuid}/edit`,
  },
  followups: {
    list: "/followups",
    create: "/followups/new",
    edit: (uuid: string) => `/followups/${uuid}/edit`,
    timeline: (uuid: string) => `/followups/${uuid}/timeline`,
    calendar: "/followups/calendar",
  },
  notFound: "*",
} as const;
