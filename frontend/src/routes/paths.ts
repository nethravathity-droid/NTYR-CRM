export const paths = {
  login: "/login",
  dashboard: "/",
  companies: {
    list: "/companies",
    create: "/companies/new",
    details: (uuid: string) => `/companies/${uuid}`,
    edit: (uuid: string) => `/companies/${uuid}/edit`,
  },
  leads: {
    list: "/leads",
    create: "/leads/new",
    import: "/leads/import",
    assign: "/leads/assign",
    details: (uuid: string) => `/leads/${uuid}`,
    edit: (uuid: string) => `/leads/${uuid}/edit`,
  },
  notFound: "*",
} as const;
