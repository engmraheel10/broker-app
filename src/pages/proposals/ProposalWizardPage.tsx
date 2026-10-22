import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  AssetLineItem,
  CustomerType,
  FinanceDetails,
  FinanceType,
  PaymentFrequency,
  Proposal,
  SupportingDoc,
  DirectorDetail,
  ProposalAddress,
  ServiceAddOnItem,
  BusinessPartnerDetails,
} from '../../types';
import { calculateFinance, formatCurrency, formatPercent } from '../../utils/calculations';
import { FinancialSummaryCard } from '../../components/common/FinancialSummaryCard';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Truck,
  Coins,
  Briefcase,
  FileCheck2,
  FileText,
  Landmark,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  ShieldCheck,
  Info,
  Clock,
  ArrowRight,
  Send,
  Building2,
  FileSpreadsheet,
  Search,
  Sparkles,
  BookOpen,
  DollarSign,
  Percent,
  CheckCircle2,
  ExternalLink,
  Layers,
  Wrench,
  HelpCircle,
  BadgeAlert
} from 'lucide-react';

export const ProposalWizardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const quotationId = searchParams.get('quotationId');
  const navigate = useNavigate();

  const {
    getQuotation,
    getProposal,
    saveProposal,
    submitProposal,
    dealers,
    brokers,
    lenders,
    customers,
    addToast,
    currentUser
  } = useApp();

  const isEditing = Boolean(id);
  const existingProposal = id ? getProposal(id) : undefined;
  const initialQuotation = quotationId ? getQuotation(quotationId) : undefined;

  // Active Tab (1: Proposal Details, 2: Additional Details, 3: Asset Details, 4: Services & Add-On, 5: Credit Documents, 6: Finance Details, 7: Summary)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Top Bar State
  const [proposalName, setProposalName] = useState<string>('Heavy Transport Facility - Ref 2026');
  const [preEligibilityScore, setPreEligibilityScore] = useState<number | null>(88);
  const [preEligibilityModalOpen, setPreEligibilityModalOpen] = useState<boolean>(false);
  const [diaryModalOpen, setDiaryModalOpen] = useState<boolean>(false);
  const [diaryNotes, setDiaryNotes] = useState<string>(
    'Underwriter pre-screened on Companies House. Credit tier Prime (Tier 1). Asset delivery slated for end of Q2.'
  );
  const [newDiaryEntry, setNewDiaryEntry] = useState<string>('');

  // Tab 1: Proposal Information
  const [lenderName, setLenderName] = useState<string>('Investec Asset Finance');
  const [programName, setProgramName] = useState<string>('Standard Commercial Asset Finance');
  const [dealerId, setDealerId] = useState<string>(dealers[0]?.id || 'dlr-1');
  const [dealerName, setDealerName] = useState<string>(dealers[0]?.name || 'Apex Commercial Vehicles');
  const [financeType, setFinanceType] = useState<FinanceType>('hire_purchase');
  const [productType, setProductType] = useState<string>('Non-Regulated');
  const [currency, setCurrency] = useState<string>('£');

  // Tab 1: Customer Details
  const [clientType, setClientType] = useState<string>('Limited Company (LTD)');
  const [customerType, setCustomerType] = useState<CustomerType>('business');
  const [customerName, setCustomerName] = useState<string>('Meridian Haulage & Logistics Ltd');
  const [creditTier, setCreditTier] = useState<string>('Tier 1 - Prime');
  const [companyNumber, setCompanyNumber] = useState<string>('08941203');
  const [email, setEmail] = useState<string>('accounts@meridianhaulage.co.uk');
  const [phone, setPhone] = useState<string>('07700 900821');
  const [landlineNumber, setLandlineNumber] = useState<string>('0121 496 0888');
  const [tradingAs, setTradingAs] = useState<string>('Meridian Express');
  const [natureOfBusiness, setNatureOfBusiness] = useState<string>('Freight transport by road & multimodal logistics');
  const [yearsBusinessEstablished, setYearsBusinessEstablished] = useState<string>('8');
  const [vatStatus, setVatStatus] = useState<string>('Registered');

  // Tab 1: Contact Person
  const [contactPerson, setContactPerson] = useState<string>('David Vance');
  const [contactEmail, setContactEmail] = useState<string>('d.vance@meridianhaulage.co.uk');
  const [contactPhone, setContactPhone] = useState<string>('07700 900821');

  // Tab 1: Directors Details
  const [directors, setDirectors] = useState<DirectorDetail[]>([
    {
      id: 'dir-1',
      fullName: 'David Vance',
      email: 'd.vance@meridianhaulage.co.uk',
      contactNumber: '07700 900821',
      dateOfBirth: '1978-04-12',
      nationality: 'British',
      homeownerStatus: 'Yes (Owner / Mortgaged)',
      timeAtAddress: '6 yrs 4 mos',
    },
    {
      id: 'dir-2',
      fullName: 'Sarah Jenkins-Vance',
      email: 's.jenkins@meridianhaulage.co.uk',
      contactNumber: '07700 900543',
      dateOfBirth: '1982-09-28',
      nationality: 'British',
      homeownerStatus: 'Yes (Owner / Mortgaged)',
      timeAtAddress: '6 yrs 4 mos',
    },
  ]);
  const [newDirectorModalOpen, setNewDirectorModalOpen] = useState(false);
  const [targetDirectorType, setTargetDirectorType] = useState<'main' | 'guarantor'>('main');
  const [dirForm, setDirForm] = useState<Omit<DirectorDetail, 'id'>>({
    fullName: '',
    email: '',
    contactNumber: '',
    dateOfBirth: '1985-01-01',
    nationality: 'British',
    homeownerStatus: 'Yes (Owner / Mortgaged)',
    timeAtAddress: '3 yrs',
  });

  // Tab 1: Company Addresses
  const [activeAddressTab, setActiveAddressTab] = useState<'registered' | 'trading' | 'operational'>('registered');
  const [addresses, setAddresses] = useState<ProposalAddress[]>([
    {
      id: 'addr-reg',
      type: 'registered',
      buildingNameNumber: 'Unit 4, Gateway Logistics Park',
      street: 'Tyburn Road',
      townCity: 'Birmingham',
      county: 'West Midlands',
      postcode: 'B24 9NY',
      country: 'United Kingdom',
      timeAtAddress: '8 yrs',
    },
    {
      id: 'addr-trad',
      type: 'trading',
      buildingNameNumber: 'Unit 4, Gateway Logistics Park',
      street: 'Tyburn Road',
      townCity: 'Birmingham',
      county: 'West Midlands',
      postcode: 'B24 9NY',
      country: 'United Kingdom',
      timeAtAddress: '8 yrs',
    },
    {
      id: 'addr-oper',
      type: 'other',
      buildingNameNumber: 'Hub 12, Kingsbury Freight Depot',
      street: 'Kingsbury Way',
      townCity: 'Tamworth',
      county: 'Staffordshire',
      postcode: 'B78 2EX',
      country: 'United Kingdom',
      timeAtAddress: '4 yrs',
    },
  ]);

  // Tab 2: Additional Details (Guarantor / Business Partner)
  const [businessPartner, setBusinessPartner] = useState<BusinessPartnerDetails>({
    enabled: true,
    role: 'Guarantor',
    clientType: 'Limited Company (LTD)',
    companyName: 'Vance Capital Holdings Ltd',
    creditTier: 'Tier 1 - Prime',
    companyRegistrationNumber: '09812401',
    emailAddress: 'holdings@meridiancapital.co.uk',
    contactNumber: '0121 496 0890',
    landlineNumber: '0121 496 0800',
    tradingAs: 'Vance Group',
    natureOfBusiness: 'Activities of head offices & management holding',
    yearsBusinessEstablished: '12',
    vatStatus: 'Registered',
    contactPerson: {
      fullName: 'David Vance',
      email: 'd.vance@meridianhaulage.co.uk',
      phone: '07700 900821',
    },
    directors: [
      {
        id: 'g-dir-1',
        fullName: 'David Vance',
        email: 'd.vance@meridianhaulage.co.uk',
        contactNumber: '07700 900821',
        dateOfBirth: '1978-04-12',
        nationality: 'British',
        homeownerStatus: 'Yes (Owner / Mortgaged)',
        timeAtAddress: '6 yrs 4 mos',
      },
    ],
    addresses: [
      {
        id: 'g-addr-1',
        type: 'registered',
        buildingNameNumber: 'Vance Manor, High Street',
        street: 'Barnt Green',
        townCity: 'Birmingham',
        county: 'Worcestershire',
        postcode: 'B45 8TP',
        country: 'United Kingdom',
        timeAtAddress: '6 yrs 4 mos',
      },
    ],
  });

  // Tab 3: Asset Details
  const [assets, setAssets] = useState<AssetLineItem[]>([
    {
      id: 'ast-wiz-1',
      category: 'Commercial Vehicles',
      assetType: 'Tractor Unit 6x2',
      manufacturer: 'Scania',
      model: 'R 500 V8 Highline 6x2',
      description: 'Euro 6 step E tractor unit, automated opticruise, retarder',
      yearOfManufacture: '2024',
      serialNumber: 'YS2R6X200028914',
      quantity: 1,
      unitPrice: 110000,
      additionalCosts: 2000,
      depositAllocated: 15000,
      supplierName: 'Keltruck Ltd (Authorized Scania Dealer)',
      supplierInvoiceRef: 'KT-991204',
      tradeInAllowance: 8000,
      locationAddress: 'Unit 4, Gateway Logistics Park, Birmingham B24 9NY',
    },
  ]);

  // Tab 4: Services & Add-On Items
  const [servicesAndAddOns, setServicesAndAddOns] = useState<ServiceAddOnItem[]>([
    {
      id: 'srv-1',
      serviceType: 'Warranty Package',
      description: 'Scania 3-Year Driveline & Full Maintenance Cover',
      receivableType: 'Commission Receivable',
      paymentFrequency: 'Single Upfront',
      applicationMethod: 'Financed in Facility',
      totalAmount: 3600,
      taxAmount: 720,
      insuranceCompany: 'Scania Protect / Allianz Insurance',
      contactNumber: '0800 800 660',
    },
    {
      id: 'srv-2',
      serviceType: 'GAP Insurance',
      description: 'Asset Total Loss Return to Invoice Protection (36 Months)',
      receivableType: 'Fee Income',
      paymentFrequency: 'Single Upfront',
      applicationMethod: 'Financed in Facility',
      totalAmount: 850,
      taxAmount: 170,
      insuranceCompany: 'AXA Commercial Asset Protection',
      contactNumber: '0345 600 7820',
    },
  ]);

  // Service form input state
  const [newService, setNewService] = useState<{
    serviceType: string;
    description: string;
    receivableType: string;
    paymentFrequency: string;
    applicationMethod: string;
    totalAmount: number;
    taxAmount: number;
    insuranceCompany: string;
    contactNumber: string;
  }>({
    serviceType: 'Warranty Package',
    description: '',
    receivableType: 'Commission Receivable',
    paymentFrequency: 'Single Upfront',
    applicationMethod: 'Financed in Facility',
    totalAmount: 1200,
    taxAmount: 240,
    insuranceCompany: 'Allianz Commercial',
    contactNumber: '0800 500 1234',
  });

  // Tab 5: Credit Documents
  const [documents, setDocuments] = useState<SupportingDoc[]>([
    {
      id: 'doc-init-1',
      name: 'Audited_Management_Accounts_2025.pdf',
      size: '2.8 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category: 'management_accounts',
    },
    {
      id: 'doc-init-2',
      name: 'Bank_Statements_Last_3_Months.pdf',
      size: '4.1 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category: 'bank_statement',
    },
    {
      id: 'doc-init-3',
      name: 'Keltruck_Scania_Proforma_Invoice.pdf',
      size: '1.2 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category: 'asset_invoice',
    },
  ]);

  // Tab 6: Financial Details
  const [deposit, setDeposit] = useState<number>(15000);
  const [depositType, setDepositType] = useState<'amount' | 'percentage'>('amount');
  const [termMonths, setTermMonths] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [balloonPayment, setBalloonPayment] = useState<number>(20000);
  const [documentationFee, setDocumentationFee] = useState<number>(295);
  const [optionToPurchaseFee, setOptionToPurchaseFee] = useState<number>(150);

  // Broker selection
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>(brokers[0]?.id || 'brk-1');
  const [selectedLenderId, setSelectedLenderId] = useState<string>('lnd-investec');

  // Modals for external integrations & submission
  const [lookupModal, setLookupModal] = useState<{ open: boolean; title: string; content: React.ReactNode }>({
    open: false,
    title: '',
    content: null,
  });
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [simulatedSubmitting, setSimulatedSubmitting] = useState(false);

  // Load existing proposal data if editing or prefill from quote
  useEffect(() => {
    if (existingProposal) {
      if (existingProposal.proposalName) setProposalName(existingProposal.proposalName);
      if (existingProposal.preEligibilityScore) setPreEligibilityScore(Number(existingProposal.preEligibilityScore));
      if (existingProposal.diaryNotes) setDiaryNotes(existingProposal.diaryNotes);
      if (existingProposal.programName) setProgramName(existingProposal.programName);
      if (existingProposal.productType) setProductType(existingProposal.productType);
      if (existingProposal.currency) setCurrency(existingProposal.currency);
      if (existingProposal.clientType) setClientType(existingProposal.clientType);
      if (existingProposal.creditTier) setCreditTier(existingProposal.creditTier);
      if (existingProposal.landlineNumber) setLandlineNumber(existingProposal.landlineNumber);
      if (existingProposal.tradingAs) setTradingAs(existingProposal.tradingAs);
      if (existingProposal.natureOfBusiness) setNatureOfBusiness(existingProposal.natureOfBusiness);
      if (existingProposal.yearsBusinessEstablished) setYearsBusinessEstablished(existingProposal.yearsBusinessEstablished);
      if (existingProposal.vatStatus) setVatStatus(existingProposal.vatStatus);

      setCustomerType(existingProposal.customerType);
      setCustomerName(existingProposal.customerName);
      setContactPerson(existingProposal.contactPerson);
      setEmail(existingProposal.email);
      setPhone(existingProposal.phone);
      setCompanyNumber(existingProposal.companyNumber || '');
      setDealerId(existingProposal.dealerId);
      setDealerName(existingProposal.dealerName);
      if (existingProposal.assets?.length) setAssets(existingProposal.assets);
      if (existingProposal.directors?.length) setDirectors(existingProposal.directors);
      if (existingProposal.addresses?.length) setAddresses(existingProposal.addresses);
      if (existingProposal.businessPartner) setBusinessPartner(existingProposal.businessPartner);
      if (existingProposal.servicesAndAddOns?.length) setServicesAndAddOns(existingProposal.servicesAndAddOns);

      const f = existingProposal.financeDetails;
      setFinanceType(f.financeType);
      setDeposit(f.deposit);
      setDepositType(f.depositType || 'amount');
      setTermMonths(f.termMonths);
      setInterestRate(f.interestRate);
      setPaymentFrequency(f.paymentFrequency);
      setBalloonPayment(f.balloonPayment);
      setDocumentationFee(f.documentationFee);
      setOptionToPurchaseFee(f.optionToPurchaseFee);

      setSelectedBrokerId(existingProposal.brokerId);
      setDocuments(existingProposal.documents);
      setSelectedLenderId(existingProposal.lenderId);
      setLenderName(existingProposal.lenderName);
    } else if (initialQuotation) {
      setCustomerType(initialQuotation.customerType || 'business');
      setCustomerName(initialQuotation.customerName || initialQuotation.title || 'Meridian Haulage Ltd');
      setContactPerson(initialQuotation.contactPerson || 'David Vance');
      setEmail(initialQuotation.email || 'accounts@meridianhaulage.co.uk');
      setPhone(initialQuotation.phone || '07700 900821');
      setCompanyNumber(initialQuotation.companyNumber || '08941203');
      setDealerId(initialQuotation.dealerId || dealers[0]?.id || 'dlr-1');
      setDealerName(initialQuotation.dealerName || dealers[0]?.name || 'Apex Commercial Vehicles');
      if (initialQuotation.assets && initialQuotation.assets.length > 0) {
        setAssets(initialQuotation.assets);
      }
      if (initialQuotation.productType) setProductType(initialQuotation.productType);
      if (initialQuotation.clientType) setClientType(initialQuotation.clientType);
      if (initialQuotation.creditTier) setCreditTier(initialQuotation.creditTier);
      if (initialQuotation.programName) setProgramName(initialQuotation.programName);

      const f = initialQuotation.financeDetails;
      setFinanceType(f.financeType);
      setDeposit(f.deposit);
      setDepositType(f.depositType || 'amount');
      setTermMonths(f.termMonths);
      setInterestRate(f.interestRate);
      setPaymentFrequency(f.paymentFrequency);
      setBalloonPayment(f.balloonPayment);
      setDocumentationFee(f.documentationFee);
      setOptionToPurchaseFee(f.optionToPurchaseFee);

      setProposalName(`Proposal for ${initialQuotation.customerName || initialQuotation.reference}`);
      addToast('Quotation Data Loaded', `Prefilled with data from quotation ${initialQuotation.reference}`, 'info');
    }
  }, [existingProposal, initialQuotation]);

  const currentFinanceDetails: FinanceDetails = {
    financeType,
    deposit,
    depositType,
    termMonths,
    interestRate,
    paymentFrequency,
    balloonPayment,
    documentationFee,
    optionToPurchaseFee,
  };

  const liveSummary = calculateFinance(assets, currentFinanceDetails);
  const selectedDealer = dealers.find(d => d.id === dealerId) || dealers[0];
  const selectedBroker = brokers.find(b => b.id === selectedBrokerId) || brokers[0];
  const selectedLender = lenders.find(l => l.id === selectedLenderId) || lenders[0];

  // 7 Tabs matching the reference screenshots
  const proposalTabs = [
    { id: 1, title: 'Proposal Details', badge: null, icon: FileText },
    { id: 2, title: 'Additional Details', badge: businessPartner.enabled ? '1 Partner' : null, icon: User },
    { id: 3, title: 'Asset Details', badge: `${assets.length} Assets`, icon: Truck },
    { id: 4, title: 'Services & Add-On', badge: `${servicesAndAddOns.length} Items`, icon: Wrench },
    { id: 5, title: 'Credit Documents', badge: `${documents.length} Files`, icon: FileCheck2 },
    { id: 6, title: 'Finance Details', badge: `${termMonths}m`, icon: Coins },
    { id: 7, title: 'Summary', badge: 'Review', icon: Landmark },
  ];

  // Quick lookup handler simulations
  const handleOpenBankLookup = () => {
    setLookupModal({
      open: true,
      title: 'Open Banking Real-Time Consent & Cashflow Verification',
      content: (
        <div className="space-y-4 text-xs">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Verified Commercial Bank Feed: Barclays Bank PLC
            </div>
            <p className="mt-1 text-xs text-emerald-700">Account Name: MERIDIAN HAULAGE & LOGISTICS LTD • Sort Code: 20-00-15 • Acc: *****409</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <span className="text-slate-500">Average Monthly Inflow</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">£142,850.00</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <span className="text-slate-500">Free Operating Cashflow</span>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">+£38,400.00 / mo</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <span className="text-slate-500">Returned Cheques / Unpaid BACS</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">0 (Nil past 24m)</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <span className="text-slate-500">Debt Service Coverage (DSCR)</span>
              <p className="text-sm font-bold text-brand-600 mt-0.5">2.41x (Strong)</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Automated Open Banking categorization confirms healthy operating liquidity to support monthly repayments.
          </p>
        </div>
      ),
    });
  };

  const handleCompaniesHouseLookup = () => {
    setLookupModal({
      open: true,
      title: 'UK Companies House Registry Live Sync',
      content: (
        <div className="space-y-4 text-xs">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3.5 text-blue-900">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">MERIDIAN HAULAGE & LOGISTICS LTD</span>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">ACTIVE</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">Company No: <strong>08941203</strong> • Incorporated: 14 March 2014 (12 Years Active)</p>
          </div>
          <div className="space-y-2 text-slate-700">
            <p><strong>Registered Office:</strong> Unit 4, Gateway Logistics Park, Tyburn Road, Birmingham B24 9NY</p>
            <p><strong>SIC Code:</strong> 49410 - Freight transport by road</p>
            <p><strong>Filing Status:</strong> Confirmation statement current (Next due: Oct 2026), Accounts filed: Dec 2025</p>
            <p><strong>Officers / PSC:</strong> David Vance (Director, 75%+ voting rights), Sarah Jenkins-Vance (Director, 25%)</p>
          </div>
          <button
            onClick={() => {
              setCustomerName('Meridian Haulage & Logistics Ltd');
              setCompanyNumber('08941203');
              setNatureOfBusiness('Freight transport by road & multimodal logistics');
              setYearsBusinessEstablished('12');
              setVatStatus('Registered');
              setLookupModal(prev => ({ ...prev, open: false }));
              addToast('Companies House Synced', 'Company registry data auto-filled into proposal form.', 'success');
            }}
            className="w-full rounded-lg bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 text-xs shadow-sm"
          >
            Auto-populate Proposal with Companies House Record
          </button>
        </div>
      ),
    });
  };

  const handleCreditScoreLookup = () => {
    setLookupModal({
      open: true,
      title: 'Commercial Credit Bureau Score (Experian / Creditsafe)',
      content: (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white">
            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">Commercial Risk Index</span>
              <div className="text-3xl font-extrabold text-emerald-400">86 / 100</div>
              <span className="text-xs text-emerald-300 font-medium">Very Low Delinquency Probability</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px]">Recommended Credit Limit</span>
              <p className="text-base font-bold text-white">£450,000</p>
              <span className="text-slate-400 text-[11px]">Tier: <strong>Tier 1 - Prime</strong></span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 space-y-2 text-slate-600">
            <div className="flex justify-between border-b pb-1">
              <span>Court Judgments (CCJs):</span>
              <strong className="text-emerald-700">0 Recorded (£0)</strong>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>Days Beyond Terms (DBT):</span>
              <strong className="text-slate-900">4 Days (Industry average: 18)</strong>
            </div>
            <div className="flex justify-between">
              <span>Tangible Net Worth:</span>
              <strong className="text-slate-900">£1,240,000</strong>
            </div>
          </div>
          <button
            onClick={() => {
              setCreditTier('Tier 1 - Prime');
              setPreEligibilityScore(92);
              setLookupModal(prev => ({ ...prev, open: false }));
              addToast('Credit Tier Updated', 'Updated to Tier 1 - Prime with 92% pre-eligibility rating.', 'success');
            }}
            className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 text-xs shadow-sm"
          >
            Apply Prime Credit Tier Rating
          </button>
        </div>
      ),
    });
  };

  const handlePreEligibilityCheck = () => {
    setPreEligibilityModalOpen(true);
  };

  // Add Director
  const handleOpenAddDirector = (type: 'main' | 'guarantor') => {
    setTargetDirectorType(type);
    setDirForm({
      fullName: '',
      email: '',
      contactNumber: '',
      dateOfBirth: '1985-01-01',
      nationality: 'British',
      homeownerStatus: 'Yes (Owner / Mortgaged)',
      timeAtAddress: '3 yrs',
    });
    setNewDirectorModalOpen(true);
  };

  const handleSaveDirector = () => {
    if (!dirForm.fullName.trim()) {
      addToast('Director Name Required', 'Please enter director full name.', 'warning');
      return;
    }
    const newDir: DirectorDetail = {
      id: `dir-${Date.now()}`,
      ...dirForm,
    };
    if (targetDirectorType === 'main') {
      setDirectors(prev => [...prev, newDir]);
    } else {
      setBusinessPartner(prev => ({
        ...prev,
        directors: [...(prev.directors || []), newDir],
      }));
    }
    setNewDirectorModalOpen(false);
    addToast('Director Added', `${dirForm.fullName} added successfully.`, 'success');
  };

  const handleDeleteDirector = (id: string, type: 'main' | 'guarantor') => {
    if (type === 'main') {
      setDirectors(prev => prev.filter(d => d.id !== id));
    } else {
      setBusinessPartner(prev => ({
        ...prev,
        directors: prev.directors?.filter(d => d.id !== id) || [],
      }));
    }
  };

  // Asset manipulations
  const handleAddAsset = () => {
    const newItem: AssetLineItem = {
      id: `ast-wiz-${Date.now()}`,
      category: 'Commercial Vehicles',
      assetType: 'Commercial Trailer / Rig',
      manufacturer: 'Schmitz Cargobull',
      model: 'S.CS Curtainsider Semi-Trailer',
      description: 'Tri-axle, galvanized chassis, air suspension',
      yearOfManufacture: '2025',
      serialNumber: '',
      quantity: 1,
      unitPrice: 38000,
      additionalCosts: 500,
      depositAllocated: 5000,
      supplierName: 'Schmitz Cargobull UK Ltd',
      supplierInvoiceRef: 'SCB-2026-11',
      tradeInAllowance: 0,
      locationAddress: 'Unit 4, Gateway Logistics Park, Birmingham B24 9NY',
    };
    setAssets(prev => [...prev, newItem]);
    addToast('Asset Added', 'Added new collateral item to proposal.', 'info');
  };

  const handleRemoveAsset = (assetId: string) => {
    if (assets.length === 1) {
      addToast('Asset Required', 'A proposal must contain at least one asset line item.', 'warning');
      return;
    }
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const handleUpdateAsset = (assetId: string, field: keyof AssetLineItem, value: any) => {
    setAssets(prev =>
      prev.map(a => {
        if (a.id === assetId) return { ...a, [field]: value };
        return a;
      })
    );
  };

  // Services & Add-Ons
  const handleAddService = () => {
    if (!newService.description.trim()) {
      addToast('Description Required', 'Please enter a description for this service item.', 'warning');
      return;
    }
    const item: ServiceAddOnItem = {
      id: `srv-${Date.now()}`,
      ...newService,
    };
    setServicesAndAddOns(prev => [...prev, item]);
    setNewService({
      serviceType: 'Warranty Package',
      description: '',
      receivableType: 'Commission Receivable',
      paymentFrequency: 'Single Upfront',
      applicationMethod: 'Financed in Facility',
      totalAmount: 1200,
      taxAmount: 240,
      insuranceCompany: 'Allianz Commercial',
      contactNumber: '0800 500 1234',
    });
    addToast('Service / Add-On Added', `${item.serviceType} added to proposal schedule.`);
  };

  const handleRemoveService = (serviceId: string) => {
    setServicesAndAddOns(prev => prev.filter(s => s.id !== serviceId));
  };

  // Document upload simulation
  const handleSimulatedUpload = (category: SupportingDoc['category'], title: string) => {
    const newDoc: SupportingDoc = {
      id: `doc-${Date.now()}`,
      name: `${title.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`,
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category,
    };
    setDocuments(prev => [...prev, newDoc]);
    addToast('Document Attached', `${newDoc.name} attached to credit submission.`, 'success');
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Add Diary Note
  const handleAddDiaryNote = () => {
    if (!newDiaryEntry.trim()) return;
    const timestamp = new Date().toLocaleString('en-GB');
    const formatted = `[${timestamp} - ${currentUser.name} (${currentUser.role})]: ${newDiaryEntry}\n\n${diaryNotes}`;
    setDiaryNotes(formatted);
    setNewDiaryEntry('');
    addToast('Diary Entry Added', 'Note logged to proposal underwriter audit log.', 'info');
  };

  // Save proposal draft
  const handleSaveDraft = () => {
    const pData: Partial<Proposal> & { id?: string } = {
      id: existingProposal?.id,
      quotationId: initialQuotation?.id,
      quotationReference: initialQuotation?.reference,
      proposalName,
      preEligibilityScore: preEligibilityScore || 85,
      diaryNotes,
      customerType,
      customerName: customerName || 'Draft Proposal Customer',
      contactPerson,
      email,
      phone,
      address: addresses[0]?.street ? `${addresses[0].buildingNameNumber}, ${addresses[0].street}, ${addresses[0].townCity} ${addresses[0].postcode}` : addresses[0]?.townCity || 'Birmingham',
      companyNumber,
      clientType,
      creditTier,
      landlineNumber,
      tradingAs,
      natureOfBusiness,
      yearsBusinessEstablished,
      vatStatus,
      dealerId: selectedDealer.id,
      dealerName: selectedDealer.name,
      brokerId: selectedBroker.id,
      brokerName: selectedBroker.name,
      brokerOrg: selectedBroker.organization,
      productType,
      programName,
      currency,
      directors,
      addresses,
      businessPartner,
      servicesAndAddOns,
      assets,
      financeDetails: currentFinanceDetails,
      documents,
      lenderId: selectedLender.id,
      lenderName: selectedLender.name,
      status: existingProposal?.status || 'draft',
    };
    const saved = saveProposal(pData);
    addToast('Proposal Saved', `Proposal ${saved.reference} saved successfully.`, 'success');
    navigate(`/proposals/${saved.id}`);
  };

  // Final submission simulation
  const handleFinalSubmit = () => {
    setSimulatedSubmitting(true);
    setTimeout(() => {
      const pData: Partial<Proposal> & { id?: string } = {
        id: existingProposal?.id,
        quotationId: initialQuotation?.id,
        quotationReference: initialQuotation?.reference,
        proposalName,
        preEligibilityScore: preEligibilityScore || 90,
        diaryNotes,
        customerType,
        customerName: customerName || 'Meridian Haulage Ltd',
        contactPerson,
        email,
        phone,
        address: addresses[0]?.street ? `${addresses[0].buildingNameNumber}, ${addresses[0].street}, ${addresses[0].townCity} ${addresses[0].postcode}` : 'Birmingham',
        companyNumber,
        clientType,
        creditTier,
        landlineNumber,
        tradingAs,
        natureOfBusiness,
        yearsBusinessEstablished,
        vatStatus,
        dealerId: selectedDealer.id,
        dealerName: selectedDealer.name,
        brokerId: selectedBroker.id,
        brokerName: selectedBroker.name,
        brokerOrg: selectedBroker.organization,
        productType,
        programName,
        currency,
        directors,
        addresses,
        businessPartner,
        servicesAndAddOns,
        assets,
        financeDetails: currentFinanceDetails,
        documents,
        lenderId: selectedLender.id,
        lenderName: selectedLender.name,
        status: 'submitted',
      };
      const saved = saveProposal(pData);
      const submitted = submitProposal(saved.id);
      setSimulatedSubmitting(false);
      setSubmissionModalOpen(false);
      navigate(`/proposals/${submitted.id}`);
    }, 1200);
  };

  // Address helper
  const currentAddress = addresses.find(a => a.type === (activeAddressTab === 'operational' ? 'other' : activeAddressTab)) || addresses[0];
  const updateCurrentAddress = (field: keyof ProposalAddress, val: string) => {
    setAddresses(prev =>
      prev.map(a => {
        const matches = (activeAddressTab === 'operational' && a.type === 'other') || a.type === activeAddressTab;
        if (matches) {
          return { ...a, [field]: val };
        }
        return a;
      })
    );
  };

  const copyRegToTradingAddress = () => {
    const reg = addresses.find(a => a.type === 'registered');
    if (!reg) return;
    setAddresses(prev =>
      prev.map(a => {
        if (a.type === 'trading') {
          return {
            ...a,
            buildingNameNumber: reg.buildingNameNumber,
            street: reg.street,
            townCity: reg.townCity,
            county: reg.county,
            postcode: reg.postcode,
            country: reg.country,
            timeAtAddress: reg.timeAtAddress,
          };
        }
        return a;
      })
    );
    addToast('Address Copied', 'Registered office address copied to trading address.', 'info');
  };

  // Totals for services
  const totalServiceFinanced = servicesAndAddOns.reduce((s, item) => s + (item.applicationMethod === 'Financed in Facility' ? item.totalAmount : 0), 0);
  const totalServiceTax = servicesAndAddOns.reduce((s, item) => s + item.taxAmount, 0);
  const totalReceivables = servicesAndAddOns.reduce((s, item) => s + (item.receivableType === 'Commission Receivable' || item.receivableType === 'Fee Income' ? item.totalAmount : 0), 0);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Action Header Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200 font-mono">
                {isEditing ? existingProposal?.reference : 'NEW PROPOSAL'}
              </span>
              <input
                type="text"
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
                placeholder="Enter Proposal Name / Facility Reference..."
                className="text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none transition-colors px-1 py-0.5 bg-transparent min-w-[280px]"
              />
              {preEligibilityScore !== null ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Pre-Eligibility Score: {preEligibilityScore}/100</span>
                </div>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Pre-Eligibility: Uncalculated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Commercial underwriting facility & asset schedule • Funder: <strong className="text-slate-800">{lenderName}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePreEligibilityCheck}
              className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Check Pre-Eligibility Score</span>
            </button>

            <button
              type="button"
              onClick={() => setDiaryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span>Diary</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/proposals')}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Proposal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7 Horizontal Workflow Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs overflow-x-auto">
        <nav className="flex space-x-1 p-1.5 min-w-max" aria-label="Proposal Tabs">
          {proposalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentStep === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentStep(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.title}</span>
                {tab.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-brand-700 text-brand-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Tab Content Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: PROPOSAL DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Proposal Information Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Proposal Information</h3>
                  <p className="text-xs text-slate-500">Facility structure, lender allocation, and regulated parameters</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Proposal Name *</label>
                    <input
                      type="text"
                      value={proposalName}
                      onChange={(e) => setProposalName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Lender Name *</label>
                    <select
                      value={lenderName}
                      onChange={(e) => {
                        setLenderName(e.target.value);
                        const match = lenders.find(l => l.name === e.target.value);
                        if (match) setSelectedLenderId(match.id);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-medium"
                    >
                      {lenders.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Program Name</label>
                    <select
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Standard Commercial Asset Finance">Standard Commercial Asset Finance</option>
                      <option value="Tier 1 Prime Facility">Tier 1 Prime Facility</option>
                      <option value="Commercial Transport Fleet Program">Commercial Transport Fleet Program</option>
                      <option value="Construction & Yellow Goods Line">Construction & Yellow Goods Line</option>
                      <option value="Clean Tech & Energy Efficiency Scheme">Clean Tech & Energy Efficiency Scheme</option>
                      <option value="Small Ticket Fast-Track (< £150k)">Small Ticket Fast-Track (&lt; £150k)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Dealer Name (Optional)</label>
                    <select
                      value={dealerId}
                      onChange={(e) => {
                        setDealerId(e.target.value);
                        const d = dealers.find(x => x.id === e.target.value);
                        if (d) setDealerName(d.name);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="">None / Direct Sourced</option>
                      {dealers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Finance Type *</label>
                    <select
                      value={financeType}
                      onChange={(e) => setFinanceType(e.target.value as FinanceType)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="hire_purchase">Hire Purchase (HP)</option>
                      <option value="finance_lease">Finance Lease</option>
                      <option value="operating_lease">Operating Lease</option>
                      <option value="contract_hire">Contract Hire</option>
                      <option value="other">Asset Refinance / Capital Release</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Product Type</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-medium"
                    >
                      <option value="Non-Regulated">Non-Regulated (Commercial / Corporate)</option>
                      <option value="Regulated">Regulated (Consumer Credit Act / Sole Trader &lt; £25k)</option>
                      <option value="Consumer Hire">Consumer Hire Agreement</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="mt-1 w-full sm:w-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-semibold"
                    >
                      <option value="£">£ GBP - British Pound Sterling</option>
                      <option value="$">$ USD - United States Dollar</option>
                      <option value="€">€ EUR - European Euro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Details Card with Quick Lookups Bar */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
                    <p className="text-xs text-slate-500">Legal entity information and business credit particulars</p>
                  </div>

                  {/* Quick Lookups Bar (Open Bank, Companies House, Salesforce, Credit Score, Business Partners) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Lookups:</span>
                    <button
                      type="button"
                      onClick={handleOpenBankLookup}
                      className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
                    >
                      Open Bank
                    </button>
                    <button
                      type="button"
                      onClick={handleCompaniesHouseLookup}
                      className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                    >
                      Companies House
                    </button>
                    <button
                      type="button"
                      onClick={() => addToast('Salesforce Connected', 'Synced borrower account with Salesforce CRM (ID: SF-99120).', 'info')}
                      className="rounded border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 transition-colors shadow-2xs"
                    >
                      Salesforce
                    </button>
                    <button
                      type="button"
                      onClick={handleCreditScoreLookup}
                      className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
                    >
                      Credit Score
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      Business Partners
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Client Type *</label>
                    <select
                      value={clientType}
                      onChange={(e) => {
                        setClientType(e.target.value);
                        setCustomerType(e.target.value.includes('Individual') || e.target.value.includes('Sole') ? 'individual' : 'business');
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Limited Company (LTD)">Limited Company (LTD)</option>
                      <option value="Public Limited Company (PLC)">Public Limited Company (PLC)</option>
                      <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                      <option value="Sole Trader">Sole Trader / Self-Employed</option>
                      <option value="Partnership">Ordinary Commercial Partnership</option>
                      <option value="Individual">Individual Consumer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Company Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Credit Tier</label>
                    <select
                      value={creditTier}
                      onChange={(e) => setCreditTier(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-medium"
                    >
                      <option value="Tier 1 - Prime">Tier 1 - Prime (Excellent Credit)</option>
                      <option value="Tier 2 - Near Prime">Tier 2 - Near Prime (Good Stability)</option>
                      <option value="Tier 3 - Sub-Prime">Tier 3 - Sub-Prime (Acceptable Risk)</option>
                      <option value="Tier 4 - Specialist">Tier 4 - Specialist / Adverse History</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Company Registration Number</label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        placeholder="e.g. 08941203"
                        value={companyNumber}
                        onChange={(e) => setCompanyNumber(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-16 text-xs text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCompaniesHouseLookup}
                        className="absolute right-1 top-1 bottom-1 px-2 text-[10px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded"
                      >
                        Verify
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Contact Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Landline Number (Optional)</label>
                    <input
                      type="tel"
                      value={landlineNumber}
                      onChange={(e) => setLandlineNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Trading As (Optional)</label>
                    <input
                      type="text"
                      value={tradingAs}
                      onChange={(e) => setTradingAs(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Nature of Business (Optional)</label>
                    <input
                      type="text"
                      value={natureOfBusiness}
                      onChange={(e) => setNatureOfBusiness(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Years Business Established (Optional)</label>
                    <input
                      type="text"
                      value={yearsBusinessEstablished}
                      onChange={(e) => setYearsBusinessEstablished(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">VAT Status</label>
                    <select
                      value={vatStatus}
                      onChange={(e) => setVatStatus(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Registered">Registered (Standard 20% VAT Returns)</option>
                      <option value="Exempt">Exempt from VAT</option>
                      <option value="Not Registered">Not Registered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Person Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Contact Person</h3>
                  <p className="text-xs text-slate-500">Authorized representative for correspondence and signatory mandate</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Contact Number *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Directors Details Table Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Directors Details</h3>
                    <p className="text-xs text-slate-500">Statutory directors, beneficial owners, and key principals</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddDirector('main')}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add New Director</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Contact Number</th>
                        <th className="py-2.5 px-3">DOB</th>
                        <th className="py-2.5 px-3">Nationality</th>
                        <th className="py-2.5 px-3">Homeowner Status</th>
                        <th className="py-2.5 px-3">Time At Address</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {directors.map((dir) => (
                        <tr key={dir.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-semibold text-slate-900">{dir.fullName}</td>
                          <td className="py-2 px-3 text-slate-600">{dir.email}</td>
                          <td className="py-2 px-3 font-mono text-[11px]">{dir.contactNumber}</td>
                          <td className="py-2 px-3">{dir.dateOfBirth}</td>
                          <td className="py-2 px-3">{dir.nationality}</td>
                          <td className="py-2 px-3">
                            <span className="rounded bg-emerald-50 text-emerald-800 px-1.5 py-0.5 text-[10px] font-semibold border border-emerald-200">
                              {dir.homeownerStatus}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500">{dir.timeAtAddress}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteDirector(dir.id, 'main')}
                              className="rounded p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Director"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {directors.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-4 text-center text-slate-400 italic">
                            No directors entered yet. Click "+ Add New Director" to record principal officers.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Company Address Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Company Address</h3>
                    <p className="text-xs text-slate-500">Registered office, principal trading headquarters, and operational sites</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyRegToTradingAddress}
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                      Copy Registered to Trading
                    </button>
                  </div>
                </div>

                {/* Sub-tabs for Address Types */}
                <div className="flex space-x-1 border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveAddressTab('registered')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      activeAddressTab === 'registered' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Registered Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAddressTab('trading')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      activeAddressTab === 'trading' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Trading Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAddressTab('operational')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      activeAddressTab === 'operational' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Operational Address
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Building Name / Number *</label>
                    <input
                      type="text"
                      value={currentAddress?.buildingNameNumber || ''}
                      onChange={(e) => updateCurrentAddress('buildingNameNumber', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Street Address *</label>
                    <input
                      type="text"
                      value={currentAddress?.street || ''}
                      onChange={(e) => updateCurrentAddress('street', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">City / Town *</label>
                    <input
                      type="text"
                      value={currentAddress?.townCity || ''}
                      onChange={(e) => updateCurrentAddress('townCity', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">County / Region</label>
                    <input
                      type="text"
                      value={currentAddress?.county || ''}
                      onChange={(e) => updateCurrentAddress('county', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Postcode *</label>
                    <input
                      type="text"
                      value={currentAddress?.postcode || ''}
                      onChange={(e) => updateCurrentAddress('postcode', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono uppercase focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Time at Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 yrs 2 mos"
                      value={currentAddress?.timeAtAddress || ''}
                      onChange={(e) => updateCurrentAddress('timeAtAddress', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ADDITIONAL DETAILS (Business Partner / Guarantor) */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Business Partner / Guarantor</h3>
                    <p className="text-xs text-slate-500">Corporate or personal cross-guarantee, co-applicant, or introducer details</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={businessPartner.enabled}
                        onChange={(e) => setBusinessPartner(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                      />
                      <span>Enable Business Partner / Guarantor</span>
                    </label>
                  </div>
                </div>

                {businessPartner.enabled ? (
                  <div className="space-y-6">
                    {/* Role & Quick Lookups */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Role:</label>
                        <select
                          value={businessPartner.role}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, role: e.target.value }))}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                        >
                          <option value="Guarantor">Guarantor</option>
                          <option value="Co-Applicant">Co-Applicant</option>
                          <option value="Introducer">Introducer</option>
                          <option value="Broker">Broker</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Partner Lookups:</span>
                        <button
                          type="button"
                          onClick={handleOpenBankLookup}
                          className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Open Bank
                        </button>
                        <button
                          type="button"
                          onClick={handleCompaniesHouseLookup}
                          className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Companies House
                        </button>
                        <button
                          type="button"
                          onClick={() => addToast('Salesforce Matched', 'Linked with parent holding account Vance Capital Holdings.', 'info')}
                          className="rounded border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
                        >
                          Salesforce
                        </button>
                        <button
                          type="button"
                          onClick={handleCreditScoreLookup}
                          className="rounded border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Credit Score
                        </button>
                      </div>
                    </div>

                    {/* Guarantor Entity Fields */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Client Type</label>
                        <select
                          value={businessPartner.clientType}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, clientType: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                        >
                          <option value="Limited Company (LTD)">Limited Company (LTD)</option>
                          <option value="Public Limited Company (PLC)">Public Limited Company (PLC)</option>
                          <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                          <option value="Sole Trader">Sole Trader / Self-Employed</option>
                          <option value="Individual">Individual Guarantor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Company Name / Entity</label>
                        <input
                          type="text"
                          value={businessPartner.companyName}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, companyName: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Credit Tier</label>
                        <select
                          value={businessPartner.creditTier}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, creditTier: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                        >
                          <option value="Tier 1 - Prime">Tier 1 - Prime</option>
                          <option value="Tier 2 - Near Prime">Tier 2 - Near Prime</option>
                          <option value="Tier 3 - Sub-Prime">Tier 3 - Sub-Prime</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Company Registration Number</label>
                        <input
                          type="text"
                          value={businessPartner.companyRegistrationNumber || ''}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, companyRegistrationNumber: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                        <input
                          type="email"
                          value={businessPartner.emailAddress}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, emailAddress: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Contact Number</label>
                        <input
                          type="tel"
                          value={businessPartner.contactNumber || ''}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, contactNumber: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Landline Number</label>
                        <input
                          type="tel"
                          value={businessPartner.landlineNumber || ''}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, landlineNumber: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Trading As</label>
                        <input
                          type="text"
                          value={businessPartner.tradingAs || ''}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, tradingAs: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Nature of Business</label>
                        <input
                          type="text"
                          value={businessPartner.natureOfBusiness || ''}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, natureOfBusiness: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Years Business Established</label>
                        <input
                          type="text"
                          value={businessPartner.yearsBusinessEstablished || ''}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, yearsBusinessEstablished: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700">VAT Status</label>
                        <select
                          value={businessPartner.vatStatus || 'Registered'}
                          onChange={(e) => setBusinessPartner(prev => ({ ...prev, vatStatus: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                        >
                          <option value="Registered">Registered</option>
                          <option value="Exempt">Exempt</option>
                          <option value="Not Registered">Not Registered</option>
                        </select>
                      </div>
                    </div>

                    {/* Guarantor Contact Person */}
                    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800">Guarantor Contact Person</h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600">Full Name</label>
                          <input
                            type="text"
                            value={businessPartner.contactPerson?.fullName || ''}
                            onChange={(e) =>
                              setBusinessPartner(prev => ({
                                ...prev,
                                contactPerson: { ...prev.contactPerson!, fullName: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600">Email Address</label>
                          <input
                            type="email"
                            value={businessPartner.contactPerson?.email || ''}
                            onChange={(e) =>
                              setBusinessPartner(prev => ({
                                ...prev,
                                contactPerson: { ...prev.contactPerson!, email: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600">Contact Number</label>
                          <input
                            type="tel"
                            value={businessPartner.contactPerson?.phone || ''}
                            onChange={(e) =>
                              setBusinessPartner(prev => ({
                                ...prev,
                                contactPerson: { ...prev.contactPerson!, phone: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guarantor Directors Details Table */}
                    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800">Guarantor Directors / Principals</h4>
                        <button
                          type="button"
                          onClick={() => handleOpenAddDirector('guarantor')}
                          className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Add New Director</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                              <th className="py-2 px-2.5">Full Name</th>
                              <th className="py-2 px-2.5">Email</th>
                              <th className="py-2 px-2.5">Phone</th>
                              <th className="py-2 px-2.5">DOB</th>
                              <th className="py-2 px-2.5">Homeowner</th>
                              <th className="py-2 px-2.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {businessPartner.directors?.map((dir) => (
                              <tr key={dir.id}>
                                <td className="py-1.5 px-2.5 font-semibold text-slate-900">{dir.fullName}</td>
                                <td className="py-1.5 px-2.5 text-slate-600">{dir.email}</td>
                                <td className="py-1.5 px-2.5 font-mono">{dir.contactNumber}</td>
                                <td className="py-1.5 px-2.5">{dir.dateOfBirth}</td>
                                <td className="py-1.5 px-2.5 text-emerald-700">{dir.homeownerStatus}</td>
                                <td className="py-1.5 px-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDirector(dir.id, 'guarantor')}
                                    className="text-slate-400 hover:text-rose-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
                    <User className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No Business Partner / Guarantor Required</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Check the box above if this facility requires an additional corporate guarantor or co-applicant.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ASSET DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Asset Collateral Schedule</h3>
                    <p className="text-xs text-slate-500">Detailed machinery, vehicle, and plant specifications pledged as facility security</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Additional Asset</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {assets.map((asset, index) => (
                    <div key={asset.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {asset.manufacturer ? `${asset.manufacturer} ${asset.model}` : `Asset #${index + 1}`}
                          </span>
                        </div>
                        {assets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove Asset</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Category *</label>
                          <select
                            value={asset.category}
                            onChange={(e) => handleUpdateAsset(asset.id, 'category', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          >
                            <option value="Commercial Vehicles">Commercial Vehicles (Trucks / Vans)</option>
                            <option value="Construction & Earthmoving">Construction & Earthmoving</option>
                            <option value="Engineering & CNC">Engineering & CNC Plant</option>
                            <option value="Agriculture">Agriculture & Farming</option>
                            <option value="Materials Handling">Materials Handling (Forklifts)</option>
                            <option value="Renewable Energy">Renewable Energy / EV Fleet</option>
                            <option value="Technology / IT">Technology & Server Hardware</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Asset Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Tractor Unit 6x2"
                            value={asset.assetType || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'assetType', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Manufacturer *</label>
                          <input
                            type="text"
                            value={asset.manufacturer}
                            onChange={(e) => handleUpdateAsset(asset.id, 'manufacturer', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Model *</label>
                          <input
                            type="text"
                            value={asset.model}
                            onChange={(e) => handleUpdateAsset(asset.id, 'model', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Year of Manufacture</label>
                          <input
                            type="text"
                            placeholder="e.g. 2024"
                            value={asset.yearOfManufacture || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'yearOfManufacture', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Serial Number / VIN</label>
                          <input
                            type="text"
                            placeholder="e.g. YS2R6X200028914"
                            value={asset.serialNumber || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'serialNumber', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600">Description / Features</label>
                          <input
                            type="text"
                            value={asset.description}
                            onChange={(e) => handleUpdateAsset(asset.id, 'description', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            value={asset.quantity}
                            onChange={(e) => handleUpdateAsset(asset.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Unit Price (£ excl. VAT) *</label>
                          <input
                            type="number"
                            min="0"
                            value={asset.unitPrice}
                            onChange={(e) => handleUpdateAsset(asset.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-bold text-brand-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Additional Costs / Delivery (£)</label>
                          <input
                            type="number"
                            min="0"
                            value={asset.additionalCosts}
                            onChange={(e) => handleUpdateAsset(asset.id, 'additionalCosts', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Trade-In Allowance (£)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={asset.tradeInAllowance || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'tradeInAllowance', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Supplying Dealer / Vendor</label>
                          <input
                            type="text"
                            placeholder="e.g. Keltruck Scania"
                            value={asset.supplierName || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'supplierName', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Pro-Forma / Invoice Ref</label>
                          <input
                            type="text"
                            placeholder="e.g. INV-88190"
                            value={asset.supplierInvoiceRef || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'supplierInvoiceRef', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600">Physical Asset Location Address</label>
                          <input
                            type="text"
                            placeholder="Site / Depot address where asset will be stationed"
                            value={asset.locationAddress || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'locationAddress', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SERVICES & ADD-ON (cb58c4fd-f874-4806-a5f3-05d887f5aa8e.JPG) */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Form to Add Service / Add-On */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Add Service & Add-On</h3>
                  <p className="text-xs text-slate-500">Configure secondary warranties, insurance policies, GAP cover, and broker fee receivables</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Service Type *</label>
                    <select
                      value={newService.serviceType}
                      onChange={(e) => setNewService(prev => ({ ...prev, serviceType: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Warranty Package">Warranty Package</option>
                      <option value="GAP Insurance">GAP Insurance</option>
                      <option value="Maintenance Agreement">Maintenance Agreement</option>
                      <option value="Telematics & Tracking">Telematics & Tracking</option>
                      <option value="Service Plan">Scheduled Service Plan</option>
                      <option value="Add-On Facility">General Add-On Facility</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Scania 3-Year Driveline & Full Maintenance"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Receivable Type *</label>
                    <select
                      value={newService.receivableType}
                      onChange={(e) => setNewService(prev => ({ ...prev, receivableType: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Commission Receivable">Commission Receivable</option>
                      <option value="Fee Income">Fee Income</option>
                      <option value="Lender Subvention">Lender Subvention</option>
                      <option value="Dealer Rebate">Dealer Rebate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Payment Frequency *</label>
                    <select
                      value={newService.paymentFrequency}
                      onChange={(e) => setNewService(prev => ({ ...prev, paymentFrequency: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Single Upfront">Single Upfront</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Application Method *</label>
                    <select
                      value={newService.applicationMethod}
                      onChange={(e) => setNewService(prev => ({ ...prev, applicationMethod: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Financed in Facility">Financed in Facility</option>
                      <option value="Paid Upfront">Paid Upfront</option>
                      <option value="Separate Invoice">Separate Invoice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Total Amount (£) *</label>
                    <input
                      type="number"
                      min="0"
                      value={newService.totalAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setNewService(prev => ({
                          ...prev,
                          totalAmount: val,
                          taxAmount: Math.round(val * 0.20 * 100) / 100,
                        }));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Tax Amount (£) *</label>
                    <input
                      type="number"
                      min="0"
                      value={newService.taxAmount}
                      onChange={(e) => setNewService(prev => ({ ...prev, taxAmount: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Insurance Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Allianz Commercial"
                      value={newService.insuranceCompany}
                      onChange={(e) => setNewService(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Contact Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0800 800 660"
                      value={newService.contactNumber}
                      onChange={(e) => setNewService(prev => ({ ...prev, contactNumber: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Add Service / Add-On</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of Services & Add-Ons */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Configured Services & Add-Ons ({servicesAndAddOns.length})</h3>
                  <div className="flex gap-4 text-xs font-semibold">
                    <span className="text-slate-500">Total Financed: <strong className="text-slate-900">{formatCurrency(totalServiceFinanced)}</strong></span>
                    <span className="text-slate-500">Broker Receivables: <strong className="text-emerald-700">{formatCurrency(totalReceivables)}</strong></span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Receivable Type</th>
                        <th className="py-2.5 px-3">Application Method</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Tax</th>
                        <th className="py-2.5 px-3">Underwriter</th>
                        <th className="py-2.5 px-3">Contact</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {servicesAndAddOns.map((srv) => (
                        <tr key={srv.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{srv.serviceType}</td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">{srv.description}</td>
                          <td className="py-2.5 px-3">
                            <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[10px] font-semibold border border-indigo-200">
                              {srv.receivableType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{srv.applicationMethod}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{formatCurrency(srv.totalAmount)}</td>
                          <td className="py-2.5 px-3 text-slate-500">{formatCurrency(srv.taxAmount)}</td>
                          <td className="py-2.5 px-3 text-slate-600">{srv.insuranceCompany || '—'}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{srv.contactNumber || '—'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveService(srv.id)}
                              className="rounded p-1 text-slate-400 hover:text-rose-600"
                              title="Delete Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {servicesAndAddOns.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-4 text-center text-slate-400 italic">
                            No add-on services configured. Use the form above to add insurance, warranties, or broker fee packages.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CREDIT DOCUMENTS */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Supporting Verification Documents</h3>
                <p className="text-xs text-slate-500">Underwriting exhibits and KYC documentation required by {selectedLender.name}</p>
              </div>

              {/* Lender Requirements Checklist */}
              <div className="rounded-lg bg-blue-50/70 p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span>Mandatory Submission Checklist for {selectedLender.name}:</span>
                </div>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs text-blue-800">
                  {selectedLender.requiredDocuments.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upload Dropzone */}
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-brand-400 bg-slate-50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-800">Simulate Document Upload</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click any document type below to attach simulated verification files</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('bank_statement', 'Bank_Statements_Last_90_Days')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    + Bank Statements (90 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('management_accounts', 'Audited_Management_Accounts')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    + Latest Filed Accounts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('asset_invoice', 'Dealer_Proforma_Invoice')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    + Dealer Pro-Forma Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('id_proof', 'Director_Passport_Photo_ID')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    + Director Photo ID
                  </button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Attached Files ({documents.length})
                </h4>
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No files attached yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white text-xs">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-brand-600" />
                          <div>
                            <p className="font-semibold text-slate-900">{doc.name}</p>
                            <p className="text-[10px] text-slate-400">{doc.size} • Category: {doc.category}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: FINANCE DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Facility Terms & Amortization</h3>
                <p className="text-xs text-slate-500">Refine loan duration, upfront customer deposit, and repayment frequency</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Facility Structure</label>
                  <select
                    value={financeType}
                    onChange={(e) => setFinanceType(e.target.value as FinanceType)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="hire_purchase">Hire Purchase (HP)</option>
                    <option value="finance_lease">Finance Lease</option>
                    <option value="operating_lease">Operating Lease</option>
                    <option value="contract_hire">Contract Hire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Deposit / Upfront (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Term (Months)</label>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(parseInt(e.target.value) || 48)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-semibold"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                    <option value={72}>72 Months (6 Years)</option>
                    <option value={84}>84 Months (7 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Indicative Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Frequency</label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="monthly">Monthly in Advance</option>
                    <option value="quarterly">Quarterly in Advance</option>
                    <option value="annually">Annual in Advance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Balloon Payment (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={balloonPayment}
                    onChange={(e) => setBalloonPayment(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Documentation Fee (£)</label>
                  <input
                    type="number"
                    min="0"
                    value={documentationFee}
                    onChange={(e) => setDocumentationFee(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Option to Purchase Fee (£)</label>
                  <input
                    type="number"
                    min="0"
                    value={optionToPurchaseFee}
                    onChange={(e) => setOptionToPurchaseFee(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Repayment Breakdown Banner */}
              <div className="rounded-xl bg-slate-900 p-5 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-semibold">Estimated Monthly Payment</span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                      {formatCurrency(liveSummary.estimatedRepayment)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {termMonths} monthly instalments • Balloon: {formatCurrency(balloonPayment)} • APR: {formatPercent(interestRate)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-800 p-3 text-xs space-y-1 text-slate-300">
                    <p>Asset Subtotal: <strong>{formatCurrency(liveSummary.assetSubtotal)}</strong></p>
                    <p>Net Financed: <strong className="text-white">{formatCurrency(liveSummary.financeAmount)}</strong></p>
                    <p>Deposit Paid: <strong>{formatCurrency(liveSummary.depositAmount)}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: SUMMARY & SUBMISSION */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Comprehensive Proposal Summary & Submission</h3>
                  <p className="text-xs text-slate-500">Verify all borrower details, collateral inventory, and documents before transmitting to the credit desk</p>
                </div>

                {/* 1. Customer & Proposal Info */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">1. Proposal Information & Customer</span>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Proposal Name: <strong>{proposalName}</strong></div>
                    <div>Lender: <strong className="text-brand-700">{lenderName}</strong></div>
                    <div>Borrowing Entity: <strong>{customerName}</strong> ({clientType})</div>
                    <div>Credit Tier: <strong className="text-emerald-700">{creditTier}</strong></div>
                    <div>Companies House No: <span className="font-mono">{companyNumber}</span></div>
                    <div>Pre-Eligibility Rating: <strong className="text-purple-700">{preEligibilityScore}/100</strong></div>
                  </div>
                </div>

                {/* 2. Directors & Guarantors */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">2. Principals & Guarantors</span>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-xs space-y-1">
                    <p>Borrower Directors: <strong>{directors.map(d => d.fullName).join(', ') || 'None'}</strong></p>
                    <p>
                      Business Partner / Guarantor: {businessPartner.enabled ? (
                        <strong>{businessPartner.companyName} ({businessPartner.role})</strong>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 3. Assets & Collateral */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">3. Collateral Assets ({assets.length} items)</span>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {assets.map((a, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                        <span>{a.quantity}x {a.manufacturer} {a.model} {a.serialNumber ? `(VIN: ${a.serialNumber})` : ''}</span>
                        <strong className="text-slate-900">{formatCurrency((a.quantity * a.unitPrice) + a.additionalCosts)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Services & Add-Ons */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">4. Services & Add-Ons ({servicesAndAddOns.length} items)</span>
                    <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    {servicesAndAddOns.map((s, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{s.serviceType}: {s.description}</span>
                        <strong>{formatCurrency(s.totalAmount)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Documents & Final Facility */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">5. Facility Terms & Supporting Documents</span>
                    <button type="button" onClick={() => setCurrentStep(6)} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Facility Type: <strong className="capitalize">{financeType.replace(/_/g, ' ')}</strong></div>
                    <div>Term: <strong>{termMonths} Months</strong></div>
                    <div>Deposit: <strong>{formatCurrency(liveSummary.depositAmount)}</strong></div>
                    <div>Net Financed: <strong className="text-brand-600">{formatCurrency(liveSummary.financeAmount)}</strong></div>
                    <div>Monthly Payment: <strong className="text-emerald-700">{formatCurrency(liveSummary.estimatedRepayment)}</strong></div>
                    <div>Attached Documents: <strong>{documents.length} files</strong></div>
                  </div>
                </div>

                {/* Final Submission Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Proposal to {lenderName}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Tab</span>
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-xs"
              >
                <span>Continue to {proposalTabs[currentStep]?.title || 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Right 1 Col: Live Financial Summary */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <FinancialSummaryCard
              summary={liveSummary}
              financeDetails={currentFinanceDetails}
              showRepaymentBreakdown={true}
            />

            {/* Quick Underwriter Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-slate-900">Application Routing</h4>
              <div className="space-y-2 text-slate-600 text-[11px]">
                <div className="flex justify-between border-b pb-1.5">
                  <span>Selected Funder:</span>
                  <span className="font-semibold text-slate-900">{lenderName}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Authorized Intermediary:</span>
                  <span className="font-semibold text-slate-900">{selectedBroker.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Current Tab:</span>
                  <span className="font-bold text-brand-600">0{currentStep} - {proposalTabs[currentStep - 1]?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pre-Eligibility Status:</span>
                  <span className="font-bold text-emerald-600">{preEligibilityScore ? `${preEligibilityScore}/100 Prime` : 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIARY MODAL */}
      <Modal
        isOpen={diaryModalOpen}
        onClose={() => setDiaryModalOpen(false)}
        title="Proposal Diary & Underwriter Commentary"
        description="Chronological audit log of notes, phone logs, and underwriter stipulations"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 max-h-60 overflow-y-auto whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-xs">
            {diaryNotes || 'No diary entries logged yet.'}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Add New Diary Note</label>
            <textarea
              rows={3}
              value={newDiaryEntry}
              onChange={(e) => setNewDiaryEntry(e.target.value)}
              placeholder="Record phone call note, credit question, or document request..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddDiaryNote}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs"
              >
                Log Entry
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* PRE-ELIGIBILITY SCORE MODAL */}
      <Modal
        isOpen={preEligibilityModalOpen}
        onClose={() => setPreEligibilityModalOpen(false)}
        title="Automated Pre-Eligibility & Risk Assessment"
        description="Real-time multi-lender scoring matrix based on borrower financial profile and asset collateral"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white">
            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">Composite Score</span>
              <div className="text-3xl font-extrabold text-emerald-400">{preEligibilityScore}/100</div>
              <span className="text-xs text-emerald-300 font-medium">Eligible for Automated Underwriter Pass</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px]">Primary Funder Match</span>
              <p className="text-sm font-bold text-white">{lenderName}</p>
              <span className="text-emerald-400 text-[11px] font-bold">96% Acceptance Confidence</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Underwriting Risk Factors:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 bg-slate-50">
                <span>Credit Bureau Score (Experian 86/100)</span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">EXCELLENT</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 bg-slate-50">
                <span>Time in Business ({yearsBusinessEstablished} Years Trading)</span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">ESTABLISHED</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 bg-slate-50">
                <span>Collateral Asset Quality (Tier 1 Commercial Vehicle)</span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">HIGH LIQUIDITY</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 bg-slate-50">
                <span>Director Homeowner Status (Homeowners Verified)</span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">STRONG</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ADD DIRECTOR MODAL */}
      <Modal
        isOpen={newDirectorModalOpen}
        onClose={() => setNewDirectorModalOpen(false)}
        title={`Add New Director (${targetDirectorType === 'main' ? customerName : businessPartner.companyName})`}
        description="Enter statutory director details for Companies House and identity verification"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setNewDirectorModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDirector}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Save Director
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
            <input
              type="text"
              value={dirForm.fullName}
              onChange={(e) => setDirForm(prev => ({ ...prev, fullName: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-200 px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={dirForm.email}
                onChange={(e) => setDirForm(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Contact Number</label>
              <input
                type="tel"
                value={dirForm.contactNumber}
                onChange={(e) => setDirForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dirForm.dateOfBirth}
                onChange={(e) => setDirForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Nationality</label>
              <input
                type="text"
                value={dirForm.nationality}
                onChange={(e) => setDirForm(prev => ({ ...prev, nationality: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Homeowner Status</label>
              <select
                value={dirForm.homeownerStatus}
                onChange={(e) => setDirForm(prev => ({ ...prev, homeownerStatus: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs"
              >
                <option value="Yes (Owner / Mortgaged)">Yes (Owner / Mortgaged)</option>
                <option value="Yes (Outright Owner)">Yes (Outright Owner)</option>
                <option value="Tenant / Rented">Tenant / Rented</option>
                <option value="Living with Parents">Living with Parents</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Time At Address</label>
              <input
                type="text"
                placeholder="e.g. 4 yrs 2 mos"
                value={dirForm.timeAtAddress}
                onChange={(e) => setDirForm(prev => ({ ...prev, timeAtAddress: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* QUICK LOOKUP MODAL */}
      <Modal
        isOpen={lookupModal.open}
        onClose={() => setLookupModal(prev => ({ ...prev, open: false }))}
        title={lookupModal.title}
        maxWidth="md"
      >
        {lookupModal.content}
      </Modal>

      {/* FINAL SUBMISSION CONFIRMATION MODAL */}
      <Modal
        isOpen={submissionModalOpen}
        onClose={() => !simulatedSubmitting && setSubmissionModalOpen(false)}
        title="Confirm Proposal Submission"
        description="Dispatch formal financing application to lender credit underwriting desk."
        maxWidth="lg"
        footer={
          <div className="flex gap-2">
            <button
              disabled={simulatedSubmitting}
              onClick={() => setSubmissionModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={simulatedSubmitting}
              onClick={handleFinalSubmit}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {simulatedSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Submitting to {lenderName}...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm & Transmit Application</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            You are about to transmit a credit application for <strong>{customerName}</strong> requesting{' '}
            <strong className="text-brand-600">{formatCurrency(liveSummary.financeAmount)}</strong> to{' '}
            <strong>{lenderName}</strong>.
          </p>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 space-y-1 text-[11px]">
            <p><strong>Funder Gateway:</strong> {lenderName} (Direct Underwriting API)</p>
            <p><strong>Authorized Broker:</strong> {selectedBroker.name} ({selectedBroker.organization})</p>
            <p><strong>Pledged Assets:</strong> {assets.length} items ({formatCurrency(liveSummary.totalCostIncVAT)})</p>
            <p><strong>Services & Add-Ons:</strong> {servicesAndAddOns.length} items ({formatCurrency(totalServiceFinanced)})</p>
            <p><strong>Documents:</strong> {documents.length} verified attachments</p>
          </div>

          <p className="text-[11px] text-slate-500">
            Upon confirmation, the proposal status will update to <strong>Submitted</strong> and log a real-time entry in your audit and activity feeds.
          </p>
        </div>
      </Modal>
    </div>
  );
};
