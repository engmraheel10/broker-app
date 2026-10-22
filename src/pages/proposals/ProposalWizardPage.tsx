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
  FileSpreadsheet
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

  // Wizard Step (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Customer Data
  const [customerType, setCustomerType] = useState<CustomerType>('business');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [dealerId, setDealerId] = useState('dlr-1');

  // Step 2: Assets
  const [assets, setAssets] = useState<AssetLineItem[]>([
    {
      id: 'ast-wiz-1',
      category: 'Commercial Vehicles',
      manufacturer: 'Scania',
      model: 'R 500 V8 Highline 6x2',
      description: 'Euro 6 step E tractor unit',
      quantity: 1,
      unitPrice: 110000,
      additionalCosts: 2000,
    },
  ]);

  // Step 3: Financials
  const [financeType, setFinanceType] = useState<FinanceType>('hire_purchase');
  const [deposit, setDeposit] = useState<number>(15000);
  const [depositType, setDepositType] = useState<'amount' | 'percentage'>('amount');
  const [termMonths, setTermMonths] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [balloonPayment, setBalloonPayment] = useState<number>(20000);
  const [documentationFee, setDocumentationFee] = useState<number>(295);
  const [optionToPurchaseFee, setOptionToPurchaseFee] = useState<number>(150);

  // Step 4: Broker Selection
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>(brokers[0]?.id || 'brk-1');
  const [brokerSearch, setBrokerSearch] = useState('');

  // Step 5: Supporting Documents
  const [documents, setDocuments] = useState<SupportingDoc[]>([
    {
      id: 'doc-init-1',
      name: 'Audited_Management_Accounts_2025.pdf',
      size: '2.8 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category: 'management_accounts',
    },
  ]);

  // Step 7: Lender Selection
  const [selectedLenderId, setSelectedLenderId] = useState<string>('lnd-investec');
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [simulatedSubmitting, setSimulatedSubmitting] = useState(false);

  // Load existing proposal data if editing
  useEffect(() => {
    if (existingProposal) {
      setCustomerType(existingProposal.customerType);
      setCustomerName(existingProposal.customerName);
      setContactPerson(existingProposal.contactPerson);
      setEmail(existingProposal.email);
      setPhone(existingProposal.phone);
      setAddress(existingProposal.address);
      setCompanyNumber(existingProposal.companyNumber || '');
      setDealerId(existingProposal.dealerId);
      setAssets(existingProposal.assets);

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
    } else if (initialQuotation) {
      // Prefill from quotation!
      setCustomerType(initialQuotation.customerType || 'business');
      setCustomerName(initialQuotation.customerName || initialQuotation.title || '');
      setContactPerson(initialQuotation.contactPerson || '');
      setEmail(initialQuotation.email || '');
      setPhone(initialQuotation.phone || '');
      setAddress(initialQuotation.address || '');
      setCompanyNumber(initialQuotation.companyNumber || '');
      setDealerId(initialQuotation.dealerId || '');
      if (initialQuotation.assets && initialQuotation.assets.length > 0) {
        setAssets(initialQuotation.assets);
      }

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

  const steps = [
    { number: 1, title: 'Customer', icon: User },
    { number: 2, title: 'Assets', icon: Truck },
    { number: 3, title: 'Financials', icon: Coins },
    { number: 4, title: 'Broker', icon: Briefcase },
    { number: 5, title: 'Documents', icon: FileCheck2 },
    { number: 6, title: 'Summary', icon: FileText },
    { number: 7, title: 'Lender & Submit', icon: Landmark },
  ];

  // Asset manipulations
  const handleAddAsset = () => {
    const newItem: AssetLineItem = {
      id: `ast-wiz-${Date.now()}`,
      category: 'Commercial Vehicles',
      manufacturer: '',
      model: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      additionalCosts: 0,
    };
    setAssets(prev => [...prev, newItem]);
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

  // Document upload simulation
  const handleSimulatedUpload = (category: SupportingDoc['category']) => {
    const mockFiles = [
      { name: 'Bank_Statements_Last_3_Months.pdf', size: '3.6 MB' },
      { name: 'Supplier_Final_Proforma_Invoice.pdf', size: '1.4 MB' },
      { name: 'Director_Photo_ID_Passport.pdf', size: '920 KB' },
      { name: 'VAT_Return_Summary_Q4.pdf', size: '1.1 MB' },
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    const newDoc: SupportingDoc = {
      id: `doc-${Date.now()}`,
      name: picked.name,
      size: picked.size,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category,
    };
    setDocuments(prev => [...prev, newDoc]);
    addToast('Document Attached', `${picked.name} added to proposal package.`);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Validation per step
  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!customerName.trim()) {
        addToast('Customer Name Required', 'Please enter a company or individual name.', 'error');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        addToast('Valid Email Required', 'Please enter a valid customer email address.', 'error');
        return false;
      }
    }
    if (currentStep === 2) {
      if (assets.some(a => !a.manufacturer.trim() || !a.model.trim() || a.unitPrice <= 0)) {
        addToast('Incomplete Asset Details', 'All assets must have manufacturer, model, and positive price.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(7, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save proposal draft
  const handleSaveDraft = () => {
    const pData: Partial<Proposal> & { id?: string } = {
      id: existingProposal?.id,
      quotationId: initialQuotation?.id,
      quotationReference: initialQuotation?.reference,
      customerType,
      customerName: customerName || 'Draft Proposal Customer',
      contactPerson,
      email,
      phone,
      address,
      companyNumber,
      dealerId: selectedDealer.id,
      dealerName: selectedDealer.name,
      brokerId: selectedBroker.id,
      brokerName: selectedBroker.name,
      brokerOrg: selectedBroker.organization,
      assets,
      financeDetails: currentFinanceDetails,
      documents,
      lenderId: selectedLender.id,
      lenderName: selectedLender.name,
      status: 'draft',
    };
    const saved = saveProposal(pData);
    navigate(`/proposals/${saved.id}`);
  };

  // Final submission simulation
  const handleFinalSubmit = () => {
    setSimulatedSubmitting(true);
    setTimeout(() => {
      // 1. Save proposal
      const pData: Partial<Proposal> & { id?: string } = {
        id: existingProposal?.id,
        quotationId: initialQuotation?.id,
        quotationReference: initialQuotation?.reference,
        customerType,
        customerName: customerName || 'Customer Ltd',
        contactPerson,
        email,
        phone,
        address,
        companyNumber,
        dealerId: selectedDealer.id,
        dealerName: selectedDealer.name,
        brokerId: selectedBroker.id,
        brokerName: selectedBroker.name,
        brokerOrg: selectedBroker.organization,
        assets,
        financeDetails: currentFinanceDetails,
        documents,
        lenderId: selectedLender.id,
        lenderName: selectedLender.name,
        status: 'submitted',
      };
      const saved = saveProposal(pData);
      // 2. Mark submitted in store
      const submitted = submitProposal(saved.id);
      setSimulatedSubmitting(false);
      setSubmissionModalOpen(false);
      navigate(`/proposals/${submitted.id}`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditing ? `Edit Proposal: ${existingProposal?.reference}` : 'Create Credit Proposal'}
            </h1>
            {initialQuotation && (
              <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                From {initialQuotation.reference}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Multi-step lender underwriting wizard with live compliance checks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/proposals')}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-lg border border-brand-300 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 shadow-sm"
          >
            Save as Draft
          </button>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = s.number < currentStep;
            const isCurrent = s.number === currentStep;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < currentStep || validateCurrentStep()) {
                    setCurrentStep(s.number);
                  }
                }}
                className={`flex items-center gap-2.5 rounded-lg p-2 text-left transition-all ${
                  isCurrent
                    ? 'bg-brand-50 border border-brand-300 shadow-xs'
                    : isCompleted
                    ? 'hover:bg-slate-50'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : s.number}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Step 0{s.number}</p>
                  <p className={`truncate text-xs font-medium ${isCurrent ? 'text-brand-900 font-bold' : 'text-slate-700'}`}>
                    {s.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Current Step Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Customer Information */}
          {currentStep === 1 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 1: Customer Information</h3>
                <p className="text-xs text-slate-500">
                  Review and amend the borrowing entity's legal and contact particulars
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-700">Borrower Type:</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="customerTypeWiz"
                      checked={customerType === 'business'}
                      onChange={() => setCustomerType('business')}
                      className="text-brand-600"
                    />
                    <span>Limited Company / Corporate</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="customerTypeWiz"
                      checked={customerType === 'individual'}
                      onChange={() => setCustomerType('individual')}
                      className="text-brand-600"
                    />
                    <span>Individual / Sole Trader</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    {customerType === 'business' ? 'Company Name *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {customerType === 'business' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Companies House Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 08941203"
                      value={companyNumber}
                      onChange={(e) => setCompanyNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700">Principal Contact</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Telephone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Supplying Dealer</label>
                  <select
                    value={dealerId}
                    onChange={(e) => setDealerId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  >
                    {dealers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Registered Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Asset Information */}
          {currentStep === 2 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 2: Asset Schedule</h3>
                  <p className="text-xs text-slate-500">
                    Specify the commercial machinery or equipment to be pledged as collateral
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Additional Asset
                </button>
              </div>

              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <div key={asset.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                      <span className="text-xs font-bold text-slate-800">Asset Item #{index + 1}</span>
                      {assets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Category</label>
                        <select
                          value={asset.category}
                          onChange={(e) => handleUpdateAsset(asset.id, 'category', e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        >
                          <option value="Commercial Vehicles">Commercial Vehicles</option>
                          <option value="Construction & Earthmoving">Construction & Earthmoving</option>
                          <option value="Engineering / CNC">Engineering / CNC</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Materials Handling">Materials Handling</option>
                          <option value="Other Commercial Assets">Other Commercial Assets</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Manufacturer *</label>
                        <input
                          type="text"
                          value={asset.manufacturer}
                          onChange={(e) => handleUpdateAsset(asset.id, 'manufacturer', e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Model *</label>
                        <input
                          type="text"
                          value={asset.model}
                          onChange={(e) => handleUpdateAsset(asset.id, 'model', e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-600">Specification & Features</label>
                        <input
                          type="text"
                          value={asset.description}
                          onChange={(e) => handleUpdateAsset(asset.id, 'description', e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={asset.quantity}
                          onChange={(e) => handleUpdateAsset(asset.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Unit Price (£ excl. VAT) *</label>
                        <input
                          type="number"
                          min="0"
                          value={asset.unitPrice}
                          onChange={(e) => handleUpdateAsset(asset.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Delivery / Extras (£)</label>
                        <input
                          type="number"
                          min="0"
                          value={asset.additionalCosts}
                          onChange={(e) => handleUpdateAsset(asset.id, 'additionalCosts', parseFloat(e.target.value) || 0)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Financial Details */}
          {currentStep === 3 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 3: Facility Terms & Amortization</h3>
                <p className="text-xs text-slate-500">
                  Refine requested facility duration, upfront deposit, and repayment frequency
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Product Structure</label>
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
                  <label className="block text-xs font-medium text-slate-700">Deposit / Upfront (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Term (Months)</label>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(parseInt(e.target.value) || 48)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                    <option value={36}>36 Months</option>
                    <option value={48}>48 Months</option>
                    <option value={60}>60 Months</option>
                    <option value={72}>72 Months</option>
                    <option value={84}>84 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Indicative Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Payment Frequency</label>
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
                  <label className="block text-xs font-medium text-slate-700">Balloon Payment (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={balloonPayment}
                    onChange={(e) => setBalloonPayment(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Broker Selection */}
          {currentStep === 4 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 4: Broker Selection</h3>
                  <p className="text-xs text-slate-500">
                    Assign an authorized intermediary broker to manage this application with the credit panel
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {brokers.map((broker) => {
                  const isSelected = broker.id === selectedBrokerId;
                  return (
                    <div
                      key={broker.id}
                      onClick={() => setSelectedBrokerId(broker.id)}
                      className={`flex items-start justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{broker.name}</span>
                            <span className="rounded bg-slate-100 px-2 py-0.2 text-[10px] font-mono text-slate-600">
                              {broker.fcaNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{broker.organization}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{broker.email} • {broker.phone}</p>
                          <div className="mt-2 flex items-center gap-3 text-[11px]">
                            <span className="text-slate-500">Region: <strong>{broker.region}</strong></span>
                            <span className="text-emerald-700 font-medium">Lender Approval: {broker.approvalRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          {broker.commissionTier}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Supporting Documents */}
          {currentStep === 5 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 5: Supporting Verification Documents</h3>
                <p className="text-xs text-slate-500">
                  Attach compliance and KYC documents required by {selectedLender.name}
                </p>
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
                <p className="text-[11px] text-slate-500 mt-0.5">Click any button below to simulate uploading verification documents</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('bank_statement')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    + Bank Statements (90 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('management_accounts')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    + Latest Filed Accounts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('asset_invoice')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    + Dealer Pro-Forma Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedUpload('id_proof')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
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

          {/* STEP 6: Proposal Summary (Review with clickable Edit links!) */}
          {currentStep === 6 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 6: Comprehensive Proposal Summary</h3>
                <p className="text-xs text-slate-500">
                  Review all transaction parameters before final lender selection and submission
                </p>
              </div>

              {/* Review Section 1: Customer */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-800">1. Customer & Supplying Dealer</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Edit Step
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Customer:</span>{' '}
                    <strong className="text-slate-900">{customerName}</strong> ({customerType})
                  </div>
                  <div>
                    <span className="text-slate-500">Contact:</span> {contactPerson} ({email})
                  </div>
                  <div>
                    <span className="text-slate-500">Supplying Dealer:</span>{' '}
                    <strong className="text-slate-900">{selectedDealer.name}</strong>
                  </div>
                  {companyNumber && (
                    <div>
                      <span className="text-slate-500">Company No:</span>{' '}
                      <span className="font-mono">{companyNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section 2: Assets */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-800">2. Asset Inventory ({assets.length} items)</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Edit Step
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  {assets.map((a, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                      <span>{a.quantity}x {a.manufacturer} {a.model} ({a.category})</span>
                      <strong className="text-slate-900">{formatCurrency((a.quantity * a.unitPrice) + a.additionalCosts)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Section 3: Financial Details */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-800">3. Finance Structure</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Edit Step
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Facility Type: <strong className="capitalize">{financeType.replace(/_/g, ' ')}</strong></div>
                  <div>Duration: <strong>{termMonths} Months</strong></div>
                  <div>Upfront Deposit: <strong>{formatCurrency(liveSummary.depositAmount)}</strong></div>
                  <div>Finance Requested: <strong className="text-brand-600">{formatCurrency(liveSummary.financeAmount)}</strong></div>
                  <div>Estimated {paymentFrequency} Payment: <strong>{formatCurrency(liveSummary.estimatedRepayment)}</strong></div>
                  <div>Balloon: <strong>{formatCurrency(balloonPayment)}</strong></div>
                </div>
              </div>

              {/* Review Section 4: Broker & Documents */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-800">4. Broker & Document Verification</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Edit Step
                  </button>
                </div>
                <div className="text-xs space-y-1">
                  <p>Broker: <strong>{selectedBroker.name}</strong> ({selectedBroker.organization})</p>
                  <p>FCA License: <span className="font-mono">{selectedBroker.fcaNumber}</span></p>
                  <p>Attached Compliance Documents: <strong>{documents.length} files</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Lender Selection & Final Submission */}
          {currentStep === 7 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 7: Credit Panel Selection & Submission</h3>
                <p className="text-xs text-slate-500">
                  Select your target funder from the integrated panel and submit for automated preliminary underwriting
                </p>
              </div>

              {/* Lender Selection Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {lenders.map((lender) => {
                  const isSelected = lender.id === selectedLenderId;
                  return (
                    <div
                      key={lender.id}
                      onClick={() => setSelectedLenderId(lender.id)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 shadow-md ring-1 ring-brand-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: lender.logoColor }}
                          />
                          <h4 className="text-xs font-bold text-slate-900">{lender.name}</h4>
                        </div>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          {lender.status === 'connected' ? 'API Connected' : 'Demo Active'}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500">{lender.tagline}</p>

                      <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Max LTV:</span>
                          <span className="font-semibold text-slate-900">{lender.maxLTV}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Facility Range:</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(lender.minFinance)} - {formatCurrency(lender.maxFinance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Decision Velocity:</span>
                          <span className="font-semibold text-slate-900">{lender.avgDecisionTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pre-submission Verification Checklist */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pre-Submission Validation Checklist
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Customer details and trading address verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Collateral machinery specification validated with supplier</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Broker authorization active ({selectedBroker.name} • {selectedBroker.fcaNumber})</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{documents.length} Supporting documents attached</span>
                  </div>
                </div>
              </div>

              {/* Submission Notice Banner */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Simulated Lender Submission Prototype</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    Clicking "Submit to {selectedLender.name}" will simulate a complete API submission payload in local frontend state. No actual third-party credit check or lender call will be made.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Proposal to {selectedLender.name}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevious}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Step
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                <span>Continue to Step 0{currentStep + 1}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Right 1 Col: Dynamic Live Financial Summary */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <FinancialSummaryCard
              summary={liveSummary}
              financeDetails={currentFinanceDetails}
              showRepaymentBreakdown={true}
            />

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-slate-900">Application Routing</h4>
              <div className="space-y-2 text-slate-600 text-[11px]">
                <div className="flex justify-between border-b pb-1.5">
                  <span>Selected Intermediary:</span>
                  <span className="font-semibold text-slate-900">{selectedBroker.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Selected Funder:</span>
                  <span className="font-semibold text-slate-900">{selectedLender.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span>Current Step:</span>
                  <span className="font-bold text-brand-600">0{currentStep} of 07</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Submission Confirmation Dialog */}
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
                  <span>Submitting to {selectedLender.name}...</span>
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
            <strong>{selectedLender.name}</strong>.
          </p>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 space-y-1 text-[11px]">
            <p><strong>Funder Gateway:</strong> {selectedLender.name} (Direct Portal / API)</p>
            <p><strong>Authorized Broker:</strong> {selectedBroker.name} ({selectedBroker.organization})</p>
            <p><strong>Pledged Assets:</strong> {assets.length} items ({formatCurrency(liveSummary.totalCostIncVAT)})</p>
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
