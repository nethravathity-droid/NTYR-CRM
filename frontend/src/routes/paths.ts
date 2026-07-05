export const paths = {
  login: "/login",
  dashboard: "/",
  companies: {
    list: "/companies",
    create: "/companies/new",
    details: (uuid: string) => `/companies/${uuid}`,
    edit: (uuid: string) => `/companies/${uuid}/edit`,
  },
  notFound: "*",
} as const;
