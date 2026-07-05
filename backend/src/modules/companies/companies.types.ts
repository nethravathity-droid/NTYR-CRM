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
  createdAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  companyCode: string;
  companyName: string;
  legalName?: string | null;
  ownerName: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  reraNumber?: string | null;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  website?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  timezone?: string;
  currency?: string;
  status?: CompanyStatus;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  notes?: string | null;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {}

export interface ListCompaniesQuery {
  page: number;
  limit: number;
  search?: string;
  status?: CompanyStatus;
  sortBy: "created_at" | "company_name" | "company_code" | "status";
  sortOrder: "asc" | "desc";
}

export interface PaginatedCompaniesResult {
  companies: CompanyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CompanyRecord {
  id: number;
  uuid: string;
  company_code: string;
  company_name: string;
  legal_name: string | null;
  owner_name: string;
  gst_number: string | null;
  pan_number: string | null;
  rera_number: string | null;
  email: string;
  phone: string;
  alternate_phone: string | null;
  website: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  logo_url: string | null;
  favicon_url: string | null;
  timezone: string;
  currency: string;
  status: CompanyStatus;
  is_active: boolean;
  trial_start_date: string | null;
  trial_end_date: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
