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
  notFound: "*",
} as const;
