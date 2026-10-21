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
  documentationFee: number;
  optionToPurchaseFee: number;
}

export type QuotationStatus = 'draft' | 'saved' | 'converted' | 'expired';

export interface Quotation {
  id: string;
  reference: string;
  customerType: CustomerType;
  customerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  companyNumber?: string;
  dealerId: string;
  dealerName: string;
  salesRep: string;
  assets: AssetLineItem[];
  financeDetails: FinanceDetails;
  status: QuotationStatus;
  notes?: string;
  convertedProposalId?: string;
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

export interface Proposal {
  id: string;
  reference: string;
  quotationId?: string;
  quotationReference?: string;
  customerType: CustomerType;
  customerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  companyNumber?: string;
  dealerId: string;
  dealerName: string;
  brokerId: string;
  brokerName: string;
  brokerOrg: string;
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
