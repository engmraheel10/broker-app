export type CustomerType = 'business' | 'individual';

export interface AssetLineItem {
  id: string;
  category: string;
  manufacturer: string;
  model: string;
  description: string;
  quantity: number;
  unitPrice: number;
  additionalCosts: number;
  assetType?: string;
  yearOfManufacture?: string | number;
  serialNumber?: string;
  supplierName?: string;
  supplierInvoiceRef?: string;
  tradeInAllowance?: number;
  locationAddress?: string;
  depositAllocated?: number;
}

export type FinanceType = 'hire_purchase' | 'finance_lease' | 'operating_lease' | 'contract_hire' | 'other';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually';

export interface FinanceDetails {
  financeType: FinanceType;
  deposit: number;
  depositType: 'amount' | 'percentage';
  termMonths: number;
  interestRate: number; // Annual %
  paymentFrequency: PaymentFrequency;
  balloonPayment: number;
  balloonType?: 'amount' | 'percentage';
  balloonCollection?: string;
  documentationFee: number;
  optionToPurchaseFee: number;
  annualAdminFee?: number;
  paymentMode?: 'Arrear' | 'Advance';
  rateType?: 'Nominal Rate' | 'Flat Rate' | 'Effective Rate';
  advancePayments?: number;
  commissionValue?: number;
  commissionType?: 'amount' | 'percentage';
  commissionAmount?: number;
  subsidy?: number;
  serviceAddOn?: number;
  nonVatableAmount?: number;
  calculateMode?: string;
  grossYield?: number;
  netYield?: number;
  apr?: number;
  flatRateExclComm?: number;
  flatRateInclComm?: number;
  upfrontPayment?: number;
  grossProfit?: number;
  productType?: string;
  assetType?: string;
  programName?: string;
  clientType?: string;
  creditTier?: string;
}

export type AssetCategoryType = 'hard' | 'soft';

export type QuotationStatus = 'draft' | 'saved' | 'converted' | 'expired';

export interface Quotation {
  id: string;
  reference: string;
  title?: string;
  assetCategoryType?: AssetCategoryType;
  assetQuantity?: number;
  assetCost?: number;
  vatAmount?: number;
  vatRate?: number;
  vatTreatment?: 'financed' | 'upfront' | 'zero' | 'deferred';
  loanAmount?: number;
  customerType?: CustomerType;
  customerName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  companyNumber?: string;
  dealerId?: string;
  dealerName?: string;
  salesRep?: string;
  assets: AssetLineItem[];
  financeDetails: FinanceDetails;
  status: QuotationStatus;
  notes?: string;
  convertedProposalId?: string;
  inventoryItemId?: string;
  productType?: string;
  assetType?: string;
  lenderName?: string;
  programName?: string;
  clientType?: string;
  creditTier?: string;
  serviceAddOn?: number;
  nonVatableAmount?: number;
  commissionValue?: number;
  commissionType?: 'amount' | 'percentage';
  commissionAmount?: number;
  rateType?: 'Nominal Rate' | 'Flat Rate' | 'Effective Rate';
  advancePayments?: number;
  regularPayments?: number;
  balloonCollection?: string;
  subsidy?: number;
  annualAdminFee?: number;
  paymentMode?: 'Arrear' | 'Advance';
  grossYield?: number;
  netYield?: number;
  apr?: number;
  flatRateExclComm?: number;
  flatRateInclComm?: number;
  upfrontPayment?: number;
  grossProfit?: number;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
}

export type ProposalStatus = 
  | 'draft'
  | 'incomplete'
  | 'ready_to_submit'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'submission_failed';

export interface SupportingDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  category: 'bank_statement' | 'management_accounts' | 'asset_invoice' | 'id_proof' | 'other';
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details?: string;
  badgeType?: 'default' | 'success' | 'warning' | 'info' | 'danger';
}

export interface DirectorDetail {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  nationality: string;
  homeownerStatus: string;
  timeAtAddress: string;
}

export interface ProposalAddress {
  id: string;
  type: 'registered' | 'trading' | 'director_residential' | 'other';
  buildingNameNumber: string;
  street: string;
  townCity: string;
  county?: string;
  postcode: string;
  country: string;
  timeAtAddress?: string;
}

export interface ServiceAddOnItem {
  id: string;
  serviceType: string;
  description: string;
  receivableType: string;
  paymentFrequency: string;
  applicationMethod: string;
  totalAmount: number;
  taxAmount: number;
  insuranceCompany?: string;
  contactNumber?: string;
}

export interface BusinessPartnerDetails {
  enabled: boolean;
  role: string;
  clientType: string;
  companyName: string;
  creditTier: string;
  companyRegistrationNumber?: string;
  emailAddress: string;
  contactNumber?: string;
  landlineNumber?: string;
  tradingAs?: string;
  natureOfBusiness?: string;
  yearsBusinessEstablished?: string;
  vatStatus?: string;
  contactPerson?: {
    fullName: string;
    email: string;
    phone: string;
  };
  directors?: DirectorDetail[];
  addresses?: ProposalAddress[];
}

export interface Proposal {
  id: string;
  reference: string;
  quotationId?: string;
  quotationReference?: string;
  proposalName?: string;
  preEligibilityScore?: string | number;
  diaryNotes?: string;
  customerType: CustomerType;
  customerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  companyNumber?: string;
  clientType?: string;
  creditTier?: string;
  landlineNumber?: string;
  tradingAs?: string;
  natureOfBusiness?: string;
  yearsBusinessEstablished?: string;
  vatStatus?: string;
  dealerId: string;
  dealerName: string;
  brokerId: string;
  brokerName: string;
  brokerOrg: string;
  productType?: string;
  programName?: string;
  currency?: string;
  directors?: DirectorDetail[];
  addresses?: ProposalAddress[];
  businessPartner?: BusinessPartnerDetails;
  servicesAndAddOns?: ServiceAddOnItem[];
  assets: AssetLineItem[];
  financeDetails: FinanceDetails;
  documents: SupportingDoc[];
  lenderId: string;
  lenderName: string;
  status: ProposalStatus;
  submittedAt?: string;
  decisionAt?: string;
  decisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  activityHistory: ActivityItem[];
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  companyNumber?: string;
  activeQuotationsCount: number;
  activeProposalsCount: number;
  totalFinanceRequested: number;
  creditRating?: string;
  status: 'active' | 'pending' | 'dormant';
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  year?: number;
  value: number;
  dealerName: string;
  customerName: string;
  quotationRef?: string;
  proposalRef?: string;
  status: 'quoted' | 'proposed' | 'financed' | 'delivered';
}

export interface InventoryItem {
  id: string;
  dealerId: string;
  dealerName: string;
  title: string;
  imageUrl?: string;
  categoryType: AssetCategoryType;
  categoryName: string;
  manufacturer: string;
  model: string;
  year?: number;
  vinOrSerial?: string;
  price: number;
  quantity: number;
  status: 'in_stock' | 'reserved' | 'sold';
  description?: string;
  specifications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Broker {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  fcaNumber: string;
  status: 'active' | 'pending_review' | 'inactive';
  proposalsCount: number;
  approvalRate: number;
  commissionTier: string;
  region: string;
}

export interface Dealer {
  id: string;
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  activeQuotationsCount: number;
  activeProposalsCount: number;
  totalVolumeYTD: number;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Standard';
  status: 'active' | 'suspended';
}

export interface Lender {
  id: string;
  name: string;
  code: string;
  tagline: string;
  logoColor: string;
  supportedProducts: string[];
  supportedAssetCategories: string[];
  maxLTV: number;
  minFinance: number;
  maxFinance: number;
  minTerm: number;
  maxTerm: number;
  status: 'connected' | 'demo_active' | 'api_maintenance';
  avgDecisionTime: string;
  requiredDocuments: string[];
}

export type UserRole = 
  | 'Tenant Admin'
  | 'Broker Admin'
  | 'Broker User'
  | 'Dealer Admin'
  | 'Dealer User';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarInitials: string;
  status: 'active' | 'invited' | 'disabled';
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entityType: string;
  entityReference: string;
  ipAddress: string;
  details: string;
}

export interface FinancialCalculationResult {
  assetSubtotal: number;
  additionalCosts: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  totalCostIncVAT: number;
  depositAmount: number;
  financeAmount: number;
  estimatedRepayment: number;
  totalRepayable: number;
  totalInterest: number;
}
