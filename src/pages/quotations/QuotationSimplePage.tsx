import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FinanceType, PaymentFrequency, AssetCategoryType, Quotation, InventoryItem } from '../../types';
import {
  formatCurrency,
  formatPercent,
  formatDate,
  generateAmortizationSchedule,
  generateRef,
  calculateQuoteBreakdown,
  QuoteCalculationInput
} from '../../utils/calculations';
import { exportQuotationRepaymentPDF, PDFQuotationData } from '../../utils/pdfGenerator';
import {
  Calculator,
  Save,
  ArrowRight,
  RotateCcw,
  Layers,
  FolderKanban,
  Check,
  ShieldAlert,
  Download,
  Printer,
  Package,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Calendar,
  Pencil,
  Info,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  X,
  FileText
} from 'lucide-react';

const PRODUCT_TABS = [
  { id: 'personal_contract_purchase', label: 'Personal Contract Purchase' },
  { id: 'hire_purchase', label: 'Hire Purchase' },
  { id: 'finance_lease', label: 'Finance Lease' },
  { id: 'operating_lease', label: 'Operating Lease' },
  { id: 'contract_hire', label: 'Contract Hire' },
  { id: 'commercial_loan', label: 'Commercial Loan' },
];

export const QuotationSimplePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveQuotation, addToast, currentUser, inventory } = useApp();

  const isDealer = currentUser.role === 'Dealer Admin' || currentUser.role === 'Dealer User';
  const dealerInventory = useMemo(() => {
    return isDealer
      ? inventory.filter(i => i.dealerName === currentUser.organization || i.dealerId === 'dlr-1')
      : inventory;
  }, [inventory, isDealer, currentUser.organization]);

  // Initial quotation reference
  const [quotationRef] = useState(() => generateRef('QT'));

  // 1. Top Bar State
  const [quotationName, setQuotationName] = useState('');
  const [productType, setProductType] = useState('Un Regulated');
  const [assetType, setAssetType] = useState('Hard Asset - Waste - Scrap & Recycling');
  const [lenderName, setLenderName] = useState('Ultimate Finance');
  const [programName, setProgramName] = useState('Program Name');
  const [clientType, setClientType] = useState('PLC');
  const [creditTier, setCreditTier] = useState('Credit Tier');

  // Active product pill
  const [selectedProduct, setSelectedProduct] = useState('hire_purchase');
  const [calculateMode, setCalculateMode] = useState('Periodic Payment');

  // 2. Left Column: Input Fields
  const [quoteDate, setQuoteDate] = useState('22/10/2026');
  const [assetCost, setAssetCost] = useState<number>(1000.0);
  const [serviceAddOn, setServiceAddOn] = useState<number>(0.0);
  const [nonVatableAmount, setNonVatableAmount] = useState<number>(0.0);

  const [depositValue, setDepositValue] = useState<number>(0.0);
  const [depositType, setDepositType] = useState<'amount' | 'percentage'>('amount');

  const [commissionValue, setCommissionValue] = useState<number>(3.0);
  const [commissionType, setCommissionType] = useState<'amount' | 'percentage'>('percentage');

  const [rate, setRate] = useState<number>(8.0);
  const [rateType, setRateType] = useState<'Nominal Rate' | 'Flat Rate' | 'Effective Rate'>('Nominal Rate');

  const [advancePayments, setAdvancePayments] = useState<number>(0);
  const [regularPayments, setRegularPayments] = useState<number>(12);

  const [balloonValue, setBalloonValue] = useState<number>(0.0);
  const [balloonType, setBalloonType] = useState<'amount' | 'percentage'>('amount');
  const [balloonCollection, setBalloonCollection] = useState('With Last Payment');

  const [subsidy, setSubsidy] = useState<number>(0.0);

  // VAT Treatment
  const [vatTreatment, setVatTreatment] = useState<'upfront' | 'deferred'>('upfront');
  const [customVatAmount, setCustomVatAmount] = useState<string>('0.00');

  // Advanced toggles
  const [irregularPaymentsActive, setIrregularPaymentsActive] = useState(false);
  const [stepPaymentsActive, setStepPaymentsActive] = useState(false);
  const [stepStructureActive, setStepStructureActive] = useState(false);

  // 3. Right Column: Rates & Information
  const [documentFee, setDocumentFee] = useState<number>(195.0);
  const [otpFee, setOtpFee] = useState<number>(200.0);
  const [annualAdminFee, setAnnualAdminFee] = useState<number>(35.0);
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [paymentMode, setPaymentMode] = useState<'Arrear' | 'Advance'>('Arrear');

  // UI accordion / collapsible states
  const [upfrontGroupOpen, setUpfrontGroupOpen] = useState(true);
  const [informationOpen, setInformationOpen] = useState(true);
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rateCardsModalOpen, setRateCardsModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Selected Dealer Inventory Item (if selected from stock)
  const initialInventoryId = searchParams.get('inventoryId');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(() => {
    if (initialInventoryId) {
      return inventory.find(i => i.id === initialInventoryId) || null;
    }
    return null;
  });

  // When an inventory item is picked
  useEffect(() => {
    if (selectedInventoryItem) {
      setQuotationName(selectedInventoryItem.title);
      setAssetCost(selectedInventoryItem.price);
      setAssetType(
        selectedInventoryItem.categoryType === 'hard'
          ? `Hard Asset - ${selectedInventoryItem.categoryName}`
          : `Soft Asset - ${selectedInventoryItem.categoryName}`
      );
    }
  }, [selectedInventoryItem]);

  // Live Calculations using calculateQuoteBreakdown
  const calcOutput = useMemo(() => {
    const input: QuoteCalculationInput = {
      assetCost,
      serviceAddOn,
      nonVatableAmount,
      vatTreatment,
      customVatAmount: customVatAmount === '' ? undefined : parseFloat(customVatAmount),
      depositValue,
      depositType,
      subsidy,
      commissionValue,
      commissionType,
      rate,
      rateType,
      advancePayments,
      regularPayments,
      balloonValue,
      balloonType,
      balloonCollection,
      documentFee,
      otpFee,
      annualAdminFee,
      paymentFrequency,
      paymentMode,
    };
    return calculateQuoteBreakdown(input);
  }, [
    assetCost,
    serviceAddOn,
    nonVatableAmount,
    vatTreatment,
    customVatAmount,
    depositValue,
    depositType,
    subsidy,
    commissionValue,
    commissionType,
    rate,
    rateType,
    advancePayments,
    regularPayments,
    balloonValue,
    balloonType,
    balloonCollection,
    documentFee,
    otpFee,
    annualAdminFee,
    paymentFrequency,
    paymentMode,
  ]);

  // Auto calculate VAT helper button
  const handleCalculateVAT = () => {
    const vatable = Math.max(0, assetCost - nonVatableAmount);
    const standardVat = Math.round(vatable * 0.20 * 100) / 100;
    setCustomVatAmount(standardVat.toFixed(2));
    addToast('VAT Calculated', `Standard 20% VAT applied: ${formatCurrency(standardVat)}`, 'info');
  };

  // Month-by-month Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    return generateAmortizationSchedule(
      calcOutput.financeAmount,
      rate,
      regularPayments,
      calcOutput.balloonAmount,
      documentFee,
      selectedProduct === 'hire_purchase' ? otpFee : 0
    );
  }, [calcOutput.financeAmount, rate, regularPayments, calcOutput.balloonAmount, documentFee, otpFee, selectedProduct]);

  // Download PDF Handler
  const handleDownloadPDF = () => {
    const pdfData: PDFQuotationData = {
      reference: quotationRef,
      title: quotationName || 'Asset Finance Quotation',
      dealerName: currentUser.organization,
      userName: currentUser.name,
      userRole: currentUser.role,
      assetType,
      assetCost,
      vatTreatment,
      vatAmount: calcOutput.vatAmount,
      financeType: selectedProduct,
      deposit: calcOutput.depositAmount,
      loanAmount: calcOutput.financeAmount,
      termMonths: regularPayments,
      interestRate: rate,
      paymentFrequency,
      balloonPayment: calcOutput.balloonAmount,
      documentationFee: documentFee,
      optionToPurchaseFee: otpFee,
      estimatedRepayment: calcOutput.periodicPayment,
      totalInterest: calcOutput.totalInterest,
      totalRepayable: calcOutput.totalRepayable,
      productType,
      lenderName,
      programName,
      clientType,
      creditTier,
      commissionAmount: calcOutput.commissionAmount,
      grossProfit: calcOutput.grossProfit,
      upfrontPayment: calcOutput.upfrontPayment,
      grossYield: calcOutput.grossYield,
      netYield: calcOutput.netYield,
      apr: calcOutput.apr,
      flatRateExclComm: calcOutput.flatRateExclComm,
      flatRateInclComm: calcOutput.flatRateInclComm,
      annualAdminFee,
      paymentMode,
      rateType,
      serviceAddOn,
      nonVatableAmount,
      subsidy,
      advancePayments,
      balloonCollection,
      createdAt: new Date().toISOString(),
    };

    exportQuotationRepaymentPDF(pdfData, amortizationSchedule);
    addToast('PDF Downloaded', `Official quotation & schedule for ${quotationRef} downloaded.`, 'success');
  };

  // Reset Handler
  const handleReset = () => {
    setQuotationName('');
    setAssetCost(1000.0);
    setServiceAddOn(0.0);
    setNonVatableAmount(0.0);
    setDepositValue(0.0);
    setDepositType('amount');
    setCommissionValue(3.0);
    setCommissionType('percentage');
    setRate(8.0);
    setRateType('Nominal Rate');
    setAdvancePayments(0);
    setRegularPayments(12);
    setBalloonValue(0.0);
    setBalloonType('amount');
    setBalloonCollection('With Last Payment');
    setSubsidy(0.0);
    setVatTreatment('upfront');
    setCustomVatAmount('0.00');
    setDocumentFee(195.0);
    setOtpFee(200.0);
    setAnnualAdminFee(35.0);
    setPaymentFrequency('monthly');
    setPaymentMode('Arrear');
    setSelectedInventoryItem(null);
    addToast('Calculator Reset', 'All financial fields reset to initial defaults.', 'info');
  };

  // Save Quotation Handler
  const handleSaveQuotation = () => {
    const q: Partial<Quotation> = {
      reference: quotationRef,
      title: quotationName || 'Commercial Finance Quote',
      customerName: quotationName || 'Commercial Client',
      productType,
      assetType,
      lenderName,
      programName,
      clientType,
      creditTier,
      assetCategoryType: assetType.toLowerCase().includes('soft') ? 'soft' : 'hard',
      assetQuantity: 1,
      assetCost,
      serviceAddOn,
      nonVatableAmount,
      vatAmount: calcOutput.vatAmount,
      vatTreatment,
      loanAmount: calcOutput.financeAmount,
      dealerId: selectedInventoryItem?.dealerId || 'dlr-1',
      dealerName: currentUser.organization || 'Atlas Plant & Machinery Ltd',
      inventoryItemId: selectedInventoryItem?.id,
      assets: [
        {
          id: `ast-${Date.now()}`,
          category: assetType,
          manufacturer: selectedInventoryItem?.manufacturer || 'Asset Manufacturer',
          model: selectedInventoryItem?.model || quotationName || 'Commercial Equipment',
          description: selectedInventoryItem?.description || `Quoted facility under ${lenderName}`,
          quantity: 1,
          unitPrice: assetCost,
          additionalCosts: serviceAddOn,
        },
      ],
      financeDetails: {
        financeType: selectedProduct as FinanceType,
        deposit: calcOutput.depositAmount,
        depositType,
        termMonths: regularPayments,
        interestRate: rate,
        paymentFrequency,
        balloonPayment: calcOutput.balloonAmount,
        balloonType,
        balloonCollection,
        documentationFee: documentFee,
        optionToPurchaseFee: otpFee,
        annualAdminFee,
        paymentMode,
        rateType,
        advancePayments,
        commissionValue,
        commissionType,
        commissionAmount: calcOutput.commissionAmount,
        subsidy,
        serviceAddOn,
        nonVatableAmount,
        calculateMode,
        grossYield: calcOutput.grossYield,
        netYield: calcOutput.netYield,
        apr: calcOutput.apr,
        flatRateExclComm: calcOutput.flatRateExclComm,
        flatRateInclComm: calcOutput.flatRateInclComm,
        upfrontPayment: calcOutput.upfrontPayment,
        grossProfit: calcOutput.grossProfit,
      },
      status: 'saved',
    };

    saveQuotation(q);
    addToast('Quotation Saved', `Quotation ${quotationRef} saved to Workspace.`, 'success');
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-4 px-2 sm:px-4">
        {/* TOP BAR: Quotation Name and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Enter Quotation Name..."
              value={quotationName}
              onChange={(e) => setQuotationName(e.target.value)}
              className="w-full bg-transparent text-lg font-semibold text-slate-800 placeholder:text-slate-400 border-b border-transparent hover:border-slate-300 focus:border-brand-600 focus:outline-none transition-colors px-1 py-1"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Dealer Inventory Quick Button */}
            {isDealer && (
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-xs transition-colors"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Stock Inventory ({dealerInventory.length})</span>
              </button>
            )}

            {/* Three dots menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                title="View Full Amortization Schedule & PDF"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Get Rates Button */}
            <button
              type="button"
              onClick={() => setRateCardsModalOpen(true)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              Get Rates
            </button>

            {/* Save Quotation Button */}
            <button
              type="button"
              onClick={handleSaveQuotation}
              className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 shadow-xs transition-colors"
            >
              Save Quotation
            </button>
          </div>
        </div>

        {/* TOP FILTER STRIP (6 Select Boxes + Settings Icon) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2.5 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          {/* Product Type */}
          <div className="relative">
            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Product Type
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
            >
              <option value="Un Regulated">Un Regulated</option>
              <option value="Regulated">Regulated</option>
              <option value="Corporate Exempt">Corporate Exempt</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-6 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Asset Type */}
          <div className="relative">
            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Asset Type
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full appearance-none truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
            >
              <option value="Hard Asset - Waste - Scrap & Recycling">Hard Asset - Waste - S..</option>
              <option value="Hard Asset - Commercial Vehicles">Hard Asset - Vehicles</option>
              <option value="Hard Asset - Construction & Plant">Hard Asset - Plant</option>
              <option value="Hard Asset - Engineering & CNC">Hard Asset - CNC</option>
              <option value="Soft Asset - Technology / Software">Soft Asset - Software</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-6 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Lender Name */}
          <div className="relative">
            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Lender Name
            </label>
            <select
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
            >
              <option value="Ultimate Finance">Ultimate Finance</option>
              <option value="Investec Asset Finance">Investec Finance</option>
              <option value="Close Brothers">Close Brothers</option>
              <option value="Lombard">Lombard</option>
              <option value="Internal Syndication">Internal Syndication</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-6 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Program Name */}
          <div className="relative">
            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Program Name
            </label>
            <select
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
            >
              <option value="Program Name">Program Name</option>
              <option value="Prime Standard">Prime Standard</option>
              <option value="Near Prime">Near Prime</option>
              <option value="Sub-Prime Commercial">Sub-Prime Commercial</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-6 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Client Type */}
          <div className="relative">
            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Client Type
            </label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
            >
              <option value="PLC">PLC</option>
              <option value="LTD">Limited (LTD)</option>
              <option value="Sole Trader">Sole Trader</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">LLP</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-6 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Credit Tier */}
          <div className="relative">
            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Credit Tier
            </label>
            <select
              value={creditTier}
              onChange={(e) => setCreditTier(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
            >
              <option value="Credit Tier">Credit Tier</option>
              <option value="Tier A (Prime)">Tier A (Prime)</option>
              <option value="Tier B (Standard)">Tier B (Standard)</option>
              <option value="Tier C (Sub-Prime)">Tier C (Sub-Prime)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-6 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Settings / Sliders Icon Button */}
          <div className="flex items-end justify-center pt-3 sm:pt-0">
            <button
              type="button"
              onClick={() => setRateCardsModalOpen(true)}
              title="Configure Rate & Underwriting Matrix"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ================= COLUMN 1: FINANCING INPUTS & VAT (5 cols) ================= */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            {/* Product Type Tabs / Carousel */}
            <div className="flex items-center gap-1 border-b border-slate-100 pb-3">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
                {PRODUCT_TABS.slice(0, 3).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedProduct(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                      selectedProduct === tab.id
                        ? 'bg-white text-slate-900 font-bold border border-slate-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calculate Mode Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Calculate:</span>
              <div className="relative">
                <select
                  value={calculateMode}
                  onChange={(e) => setCalculateMode(e.target.value)}
                  className="appearance-none rounded-md bg-transparent font-bold text-slate-900 pr-5 focus:outline-none cursor-pointer"
                >
                  <option value="Periodic Payment">Periodic Payment</option>
                  <option value="Loan Amount">Loan Amount</option>
                  <option value="Asset Cost">Asset Cost</option>
                  <option value="Term">Term (Months)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-0.5 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            {/* 2-Column Inputs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Row 1: Date & Asset Cost */}
              <div className="relative">
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Quote Date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Asset Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-medium text-slate-500">£</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={assetCost}
                    onChange={(e) => setAssetCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Service/Add-On & Non Vatable Amount */}
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Service/Add-On</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-medium text-slate-500">£</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={serviceAddOn}
                    onChange={(e) => setServiceAddOn(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Non Vatable Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-medium text-slate-500">£</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={nonVatableAmount}
                    onChange={(e) => setNonVatableAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Deposit & Commission */}
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Deposit</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:border-brand-500">
                  <span className="px-2.5 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-r border-slate-200">
                    £
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={depositValue}
                    onChange={(e) => setDepositValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  <select
                    value={depositType}
                    onChange={(e) => setDepositType(e.target.value as any)}
                    className="px-2 py-2 text-[11px] font-bold text-slate-600 bg-slate-50 border-l border-slate-200 focus:outline-none"
                  >
                    <option value="amount">£</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Commission</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:border-brand-500">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  <select
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value as any)}
                    className="px-2 py-2 text-[11px] font-bold text-slate-600 bg-slate-50 border-l border-slate-200 focus:outline-none"
                  >
                    <option value="percentage">%</option>
                    <option value="amount">£</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Rate & Rate Type */}
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Rate</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:border-brand-500">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                  <span className="px-2.5 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-l border-slate-200">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Rate Type</label>
                <div className="relative">
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as any)}
                    className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Nominal Rate">Nominal Rate</option>
                    <option value="Flat Rate">Flat Rate</option>
                    <option value="Effective Rate">Effective Rate</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Row 5: Advance Payments & Regular Payments */}
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Advance Payments</label>
                <input
                  type="number"
                  min="0"
                  value={advancePayments}
                  onChange={(e) => setAdvancePayments(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Regular Payments</label>
                <input
                  type="number"
                  min="1"
                  value={regularPayments}
                  onChange={(e) => setRegularPayments(Math.max(1, parseInt(e.target.value) || 12))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Row 6: Balloon Payment & Balloon Collection */}
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Balloon Payment</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:border-brand-500">
                  <span className="px-2.5 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-r border-slate-200">
                    £
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={balloonValue}
                    onChange={(e) => setBalloonValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  <select
                    value={balloonType}
                    onChange={(e) => setBalloonType(e.target.value as any)}
                    className="px-2 py-2 text-[11px] font-bold text-slate-600 bg-slate-50 border-l border-slate-200 focus:outline-none"
                  >
                    <option value="amount">£</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Balloon Collection</label>
                <div className="relative">
                  <select
                    value={balloonCollection}
                    onChange={(e) => setBalloonCollection(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 pr-7 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="With Last Payment">With Last Payment</option>
                    <option value="Separate Invoice">Separate Invoice</option>
                    <option value="Direct Debit">Direct Debit</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Row 7: Subsidy */}
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">Subsidy</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-medium text-slate-500">£</span>
                  <input
                    type="number"
                    min="0"
                    value={subsidy}
                    onChange={(e) => setSubsidy(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* VAT Treatment Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">VAT Treatment</span>
                <button
                  type="button"
                  onClick={handleCalculateVAT}
                  className="text-xs font-medium text-slate-600 hover:text-brand-600 hover:underline"
                >
                  Calculate VAT
                </button>
              </div>

              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setVatTreatment('upfront')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                    vatTreatment === 'upfront'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  VAT Upfront
                </button>
                <button
                  type="button"
                  onClick={() => setVatTreatment('deferred')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                    vatTreatment === 'deferred'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  VAT Deferred
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">VAT Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-medium text-slate-500">£</span>
                  <input
                    type="text"
                    value={customVatAmount}
                    onChange={(e) => setCustomVatAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Structure Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Irregular Payments (0)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={irregularPaymentsActive}
                    onChange={() => setIrregularPaymentsActive(!irregularPaymentsActive)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Step Payments</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepPaymentsActive}
                    onChange={() => setStepPaymentsActive(!stepPaymentsActive)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Step Payments Structure (0)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepStructureActive}
                    onChange={() => setStepStructureActive(!stepStructureActive)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: RESULTS & ACTIONS (4 cols) ================= */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[580px]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3">Results</h2>

              {/* Subheader row: From-To | Amount (W/O VAT) */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">
                <span>From-To</span>
                <span>Amount (W/O VAT)</span>
              </div>

              {/* Calculated Periodic Payment Row */}
              {calcOutput.periodicPayment > 0 && (
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 font-bold text-slate-900 bg-slate-50/60 px-1 rounded">
                  <span>
                    Months 1 - {regularPayments}
                  </span>
                  <span>{formatCurrency(calcOutput.periodicPayment)}</span>
                </div>
              )}

              {/* Summary Items */}
              <div className="space-y-3 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Finance Amount:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(calcOutput.financeAmount)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Commission Amount:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(calcOutput.commissionAmount)}</span>
                </div>

                {/* Collapsible Upfront Payment Group */}
                <div className="border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={() => setUpfrontGroupOpen(!upfrontGroupOpen)}
                    className="flex w-full items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1">
                      Upfront Payment:
                      {upfrontGroupOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </span>
                    <span>{formatCurrency(calcOutput.upfrontPayment)}</span>
                  </button>

                  {upfrontGroupOpen && (
                    <div className="pl-3 pr-1 pt-2 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Advance Rentals:</span>
                        <span className="font-medium text-slate-700">{formatCurrency(calcOutput.advanceRentals)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deposit:</span>
                        <span className="font-medium text-slate-700">{formatCurrency(calcOutput.depositAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Services:</span>
                        <span className="font-medium text-slate-700">{formatCurrency(serviceAddOn)}</span>
                      </div>
                      {vatTreatment === 'upfront' && calcOutput.vatAmount > 0 && (
                        <div className="flex justify-between text-amber-700">
                          <span>Upfront VAT (20%):</span>
                          <span>{formatCurrency(calcOutput.vatAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold">
                  <span className="text-slate-800">Gross Profit:</span>
                  <span className="text-slate-900">{formatCurrency(calcOutput.grossProfit)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addToast('Calculation Updated', 'Recalculated facility parameters.', 'success');
                  }}
                  className="flex-1 rounded-lg bg-black text-white px-4 py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Calculate
                </button>

                <button
                  type="button"
                  onClick={() => setComparisonModalOpen(true)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  Create Comparison
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset All Parameters"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* View Schedule & PDF Download trigger */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>View Monthly Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-navy-900 py-2 text-xs font-bold text-white hover:bg-navy-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-brand-400" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3: RATES & INFORMATION (3 cols) ================= */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            {/* Rates Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3">Rates</h2>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Gross Yield:</span>
                  <span className="font-semibold text-slate-900">{formatPercent(calcOutput.grossYield)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Net Yield:</span>
                  <span className="font-semibold text-slate-900">{formatPercent(calcOutput.netYield)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">APR:</span>
                  <span className="font-bold text-brand-700">{formatPercent(calcOutput.apr)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Flat Rate Excl. Commission:</span>
                  <span className="font-semibold text-slate-900">{formatPercent(calcOutput.flatRateExclComm)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Flat Rate Incl. Commission:</span>
                  <span className="font-semibold text-slate-900">{formatPercent(calcOutput.flatRateInclComm)}</span>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInformationOpen(!informationOpen)}
                  className="flex items-center gap-1 text-sm font-bold text-slate-900"
                >
                  {informationOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                  <span>Information</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRateCardsModalOpen(true)}
                  className="text-xs font-medium text-slate-600 hover:text-brand-600 hover:underline"
                >
                  View Rate Cards
                </button>
              </div>

              {informationOpen && (
                <div className="space-y-3 text-xs pt-1">
                  {/* Document Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Document Fee</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {editingFee === 'doc' ? (
                        <input
                          type="number"
                          autoFocus
                          onBlur={() => setEditingFee(null)}
                          value={documentFee}
                          onChange={(e) => setDocumentFee(parseFloat(e.target.value) || 0)}
                          className="w-20 px-1 py-0.5 text-xs font-bold border border-brand-500 rounded text-right focus:outline-none"
                        />
                      ) : (
                        <span>{formatCurrency(documentFee)}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingFee(editingFee === 'doc' ? null : 'doc')}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* OTP Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">OTP Fee</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {editingFee === 'otp' ? (
                        <input
                          type="number"
                          autoFocus
                          onBlur={() => setEditingFee(null)}
                          value={otpFee}
                          onChange={(e) => setOtpFee(parseFloat(e.target.value) || 0)}
                          className="w-20 px-1 py-0.5 text-xs font-bold border border-brand-500 rounded text-right focus:outline-none"
                        />
                      ) : (
                        <span>{formatCurrency(otpFee)}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingFee(editingFee === 'otp' ? null : 'otp')}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Annual Admin Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Annual Admin Fee</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {editingFee === 'admin' ? (
                        <input
                          type="number"
                          autoFocus
                          onBlur={() => setEditingFee(null)}
                          value={annualAdminFee}
                          onChange={(e) => setAnnualAdminFee(parseFloat(e.target.value) || 0)}
                          className="w-20 px-1 py-0.5 text-xs font-bold border border-brand-500 rounded text-right focus:outline-none"
                        />
                      ) : (
                        <span>{formatCurrency(annualAdminFee)}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingFee(editingFee === 'admin' ? null : 'admin')}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Payment Frequency */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Payment Frequency:</span>
                    <select
                      value={paymentFrequency}
                      onChange={(e) => setPaymentFrequency(e.target.value as any)}
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  {/* Payment Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Payment Mode:</span>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Arrear">Arrear</option>
                      <option value="Advance">Advance</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL MONTH-BY-MONTH AMORTIZATION SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Month-by-Month Repayment Schedule & Amortization Plan
                </h3>
                <p className="text-xs text-slate-500">
                  {quotationRef} • {regularPayments} Monthly Repayments • Loan: {formatCurrency(calcOutput.financeAmount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-800 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-brand-400" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              {/* Summary Cards Strip */}
              <div className="grid grid-cols-4 gap-3 text-center border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Payment</span>
                  <p className="text-base font-extrabold text-slate-900">{formatCurrency(calcOutput.periodicPayment)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Capital</span>
                  <p className="text-base font-extrabold text-slate-900">{formatCurrency(calcOutput.financeAmount)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Interest</span>
                  <p className="text-base font-extrabold text-amber-700">{formatCurrency(calcOutput.totalInterest)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Repayable</span>
                  <p className="text-base font-extrabold text-brand-700">{formatCurrency(calcOutput.totalRepayable)}</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Period</th>
                      <th className="px-4 py-2.5 text-right">Payment Due</th>
                      <th className="px-4 py-2.5 text-right">Principal</th>
                      <th className="px-4 py-2.5 text-right">Interest</th>
                      <th className="px-4 py-2.5 text-right">Balance</th>
                      <th className="px-4 py-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {amortizationSchedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2 font-semibold text-slate-800">{row.periodLabel}</td>
                        <td className="px-4 py-2 text-right font-extrabold text-slate-900">{formatCurrency(row.payment)}</td>
                        <td className="px-4 py-2 text-right text-emerald-700">{formatCurrency(row.principal)}</td>
                        <td className="px-4 py-2 text-right text-amber-700">{formatCurrency(row.interest)}</td>
                        <td className="px-4 py-2 text-right font-mono text-slate-800">{formatCurrency(row.remainingBalance)}</td>
                        <td className="px-4 py-2 text-[11px] text-slate-500">{row.notes || 'Standard payment'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RATE CARDS MODAL */}
      {rateCardsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Lender Rate Cards & Matrix</h3>
              <button
                type="button"
                onClick={() => setRateCardsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900">Ultimate Finance - Hard Asset Tier 1</p>
                  <p className="text-[11px] text-slate-500">Nominal 7.50% - 8.25% | Max Term 60m</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLenderName('Ultimate Finance');
                    setRate(7.75);
                    setRateCardsModalOpen(false);
                    addToast('Rate Applied', 'Ultimate Finance 7.75% applied.', 'success');
                  }}
                  className="rounded-md bg-brand-600 text-white font-semibold px-3 py-1.5 hover:bg-brand-700"
                >
                  Apply 7.75%
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900">Investec Asset Finance - Prime Machinery</p>
                  <p className="text-[11px] text-slate-500">Nominal 6.75% - 7.50% | Min £50k facility</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLenderName('Investec Asset Finance');
                    setRate(6.95);
                    setRateCardsModalOpen(false);
                    addToast('Rate Applied', 'Investec 6.95% applied.', 'success');
                  }}
                  className="rounded-md bg-brand-600 text-white font-semibold px-3 py-1.5 hover:bg-brand-700"
                >
                  Apply 6.95%
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900">Close Brothers - Construction & Transport</p>
                  <p className="text-[11px] text-slate-500">Nominal 7.15% - 8.50% | Balloon allowed</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLenderName('Close Brothers');
                    setRate(7.25);
                    setRateCardsModalOpen(false);
                    addToast('Rate Applied', 'Close Brothers 7.25% applied.', 'success');
                  }}
                  className="rounded-md bg-brand-600 text-white font-semibold px-3 py-1.5 hover:bg-brand-700"
                >
                  Apply 7.25%
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COMPARISON MODAL */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Compare Financing Quotes</h3>
              <button
                type="button"
                onClick={() => setComparisonModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Compare current quote ({regularPayments} months @ {rate}%) against alternative loan terms:
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 border-2 border-brand-500 bg-brand-50/50 rounded-xl">
                  <span className="font-bold text-slate-800">Current (Option A)</span>
                  <p className="text-xs text-slate-500 mt-1">{regularPayments} Months • {rate}%</p>
                  <p className="text-base font-extrabold text-brand-700 mt-2">{formatCurrency(calcOutput.periodicPayment)}/mo</p>
                  <p className="text-[11px] text-slate-500 mt-1">Total: {formatCurrency(calcOutput.totalRepayable)}</p>
                </div>
                <div className="p-3 border border-slate-200 bg-white rounded-xl">
                  <span className="font-bold text-slate-800">Option B (36 Mo)</span>
                  <p className="text-xs text-slate-500 mt-1">36 Months • 7.50%</p>
                  <p className="text-base font-extrabold text-slate-900 mt-2">
                    {formatCurrency((calcOutput.financeAmount * 1.075) / 36)}/mo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Faster payback</p>
                </div>
                <div className="p-3 border border-slate-200 bg-white rounded-xl">
                  <span className="font-bold text-slate-800">Option C (60 Mo)</span>
                  <p className="text-xs text-slate-500 mt-1">60 Months • 8.50%</p>
                  <p className="text-base font-extrabold text-slate-900 mt-2">
                    {formatCurrency((calcOutput.financeAmount * 1.15) / 60)}/mo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Lowest monthly cost</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
