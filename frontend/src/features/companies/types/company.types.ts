export type CompanyStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

export interface CompanyListItem {
  id: number;
  uuid: string;
  companyCode: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  status: CompanyStatus;
  isActive: boolean;
  createdAt: string;
}

export interface CompanyDetail {
  id: number;
  uuid: string;
  companyCode: string;
  companyName: string;
  legalName: string | null;
  ownerName: string;
  gstNumber: string | null;
  panNumber: string | null;
  reraNumber: string | null;
  email: string;
  phone: string;
  alternatePhone: string | null;
  website: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  timezone: string;
  currency: string;
  status: CompanyStatus;
  isActive: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCompanies {
  companies: CompanyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CompanyStatus;
  sortBy?: "created_at" | "company_name" | "company_code" | "status";
  sortOrder?: "asc" | "desc";
}

export type CompanyFormValues = {
  companyCode: string;
  companyName: string;
  legalName?: string;
  ownerName: string;
  gstNumber?: string;
  panNumber?: string;
  reraNumber?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string;
  faviconUrl?: string;
  timezone: string;
  currency: string;
  status: CompanyStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  notes?: string;
};
