import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FinanceType, PaymentFrequency, AssetCategoryType, Quotation, InventoryItem } from '../../types';
import { formatCurrency, formatPercent, formatDate, generateAmortizationSchedule, generateRef } from '../../utils/calculations';
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
  Sparkles,
  ExternalLink,
  Calendar,
  DollarSign,
  Info,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

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

  // Initial reference ID
  const [quotationRef] = useState(() => generateRef('QT'));

  // Selected Inventory Item (for Dealer Admin selection)
  const initialInventoryId = searchParams.get('inventoryId');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(() => {
    if (initialInventoryId) {
      return inventory.find(i => i.id === initialInventoryId) || null;
    }
    // Default to first dealer inventory item if dealer
    if (isDealer && dealerInventory.length > 0) {
      return dealerInventory[0];
    }
    return null;
  });

  const [inventoryPickerOpen, setInventoryPickerOpen] = useState(false);

  // Quotation identifier / reference
  const [title, setTitle] = useState(selectedInventoryItem ? selectedInventoryItem.title : 'New Asset Finance Quote');

  // Asset Classification
  const [assetCategoryType, setAssetCategoryType] = useState<AssetCategoryType>(
    selectedInventoryItem ? selectedInventoryItem.categoryType : 'hard'
  );
  const [assetQuantity, setAssetQuantity] = useState<number>(1);
  const [assetCost, setAssetCost] = useState<number>(
    selectedInventoryItem ? selectedInventoryItem.price : 50000
  );

  // Sync when selected inventory item changes
  useEffect(() => {
    if (selectedInventoryItem) {
      setTitle(selectedInventoryItem.title);
      setAssetCategoryType(selectedInventoryItem.categoryType);
      setAssetCost(selectedInventoryItem.price);
    }
  }, [selectedInventoryItem]);

  // If user role changes to dealer and nothing selected, select first inventory item
  useEffect(() => {
    if (isDealer && !selectedInventoryItem && dealerInventory.length > 0) {
      setSelectedInventoryItem(dealerInventory[0]);
    }
  }, [isDealer, dealerInventory, selectedInventoryItem]);

  // VAT Treatment
  const [vatTreatment, setVatTreatment] = useState<'financed' | 'upfront' | 'zero'>('financed');
  const [vatRate, setVatRate] = useState<number>(20);

  // Deposit
  const [depositType, setDepositType] = useState<'amount' | 'percentage'>('amount');
  const [depositValue, setDepositValue] = useState<number>(10000);

  // Finance Terms
  const [financeType, setFinanceType] = useState<FinanceType>('hire_purchase');
  const [termMonths, setTermMonths] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [balloonPayment, setBalloonPayment] = useState<number>(0);
  const [documentationFee, setDocumentationFee] = useState<number>(295);
  const [optionToPurchaseFee, setOptionToPurchaseFee] = useState<number>(150);
  const [notes, setNotes] = useState<string>('');

  // UI state for repayment schedule view
  const [showAllScheduleMonths, setShowAllScheduleMonths] = useState(false);

  // Calculations
  const totalNetAssetCost = (Number(assetQuantity) || 1) * (Number(assetCost) || 0);

  const vatAmount =
    vatTreatment === 'zero'
      ? 0
      : Math.round(totalNetAssetCost * (vatRate / 100) * 100) / 100;

  const totalCostIncVAT = totalNetAssetCost + vatAmount;

  // Deposit calculation
  let depositAmount = Number(depositValue) || 0;
  if (depositType === 'percentage') {
    const base = vatTreatment === 'financed' ? totalCostIncVAT : totalNetAssetCost;
    depositAmount = Math.round(((base * depositAmount) / 100) * 100) / 100;
  }

  // Loan Amount
  const baseToFinance = vatTreatment === 'financed' ? totalCostIncVAT : totalNetAssetCost;
  const loanAmount = Math.max(0, baseToFinance - depositAmount);

  // Repayment Calculation (standard amortized formula with optional balloon)
  const monthlyRate = (interestRate / 100) / 12;
  const n = Math.max(1, termMonths);
  const balloon = Number(balloonPayment) || 0;

  let monthlyRepayment = 0;
  if (monthlyRate === 0) {
    monthlyRepayment = (loanAmount - balloon) / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, -n);
    monthlyRepayment = (loanAmount - balloon * factor) * (monthlyRate / (1 - factor));
  }

  let freqMultiplier = 1;
  if (paymentFrequency === 'quarterly') freqMultiplier = 3;
  if (paymentFrequency === 'annually') freqMultiplier = 12;

  const periodicRepayment = Math.max(0, Math.round(monthlyRepayment * freqMultiplier * 100) / 100);
  const totalPayments = (termMonths / freqMultiplier) * periodicRepayment;
  const docFees = Number(documentationFee || 0) + (financeType === 'hire_purchase' ? Number(optionToPurchaseFee || 0) : 0);
  const totalRepayable = totalPayments + depositAmount + balloon + docFees;
  const totalInterest = Math.max(0, totalRepayable - baseToFinance);

  // Full Month-by-Month Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    return generateAmortizationSchedule(
      loanAmount,
      interestRate,
      termMonths,
      balloon,
      documentationFee,
      financeType === 'hire_purchase' ? optionToPurchaseFee : 0
    );
  }, [loanAmount, interestRate, termMonths, balloon, documentationFee, optionToPurchaseFee, financeType]);

  // Export PDF Handler
  const handleDownloadPDF = () => {
    const pdfData: PDFQuotationData = {
      reference: quotationRef,
      title: title || (selectedInventoryItem ? selectedInventoryItem.title : 'Asset Finance Quotation'),
      dealerName: currentUser.organization,
      userName: currentUser.name,
      userRole: currentUser.role,
      assetCategoryType,
      assetQuantity,
      assetCost: totalNetAssetCost,
      vatTreatment,
      vatAmount,
      vatRate,
      totalCostIncVAT,
      financeType,
      deposit: depositAmount,
      loanAmount,
      termMonths,
      interestRate,
      paymentFrequency,
      balloonPayment: balloon,
      documentationFee,
      optionToPurchaseFee: financeType === 'hire_purchase' ? optionToPurchaseFee : 0,
      estimatedRepayment: periodicRepayment,
      totalInterest,
      totalRepayable,
      createdAt: new Date().toISOString(),
    };

    exportQuotationRepaymentPDF(pdfData, amortizationSchedule);
    addToast('PDF Downloaded', `Repayment schedule for ${quotationRef} downloaded successfully.`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (isDealer && dealerInventory.length > 0) {
      setSelectedInventoryItem(dealerInventory[0]);
    } else {
      setSelectedInventoryItem(null);
      setTitle('New Asset Finance Quote');
      setAssetCategoryType('hard');
      setAssetCost(50000);
    }
    setAssetQuantity(1);
    setVatTreatment('financed');
    setVatRate(20);
    setDepositType('amount');
    setDepositValue(10000);
    setFinanceType('hire_purchase');
    setTermMonths(48);
    setInterestRate(6.5);
    setPaymentFrequency('monthly');
    setBalloonPayment(0);
    setDocumentationFee(295);
    setOptionToPurchaseFee(150);
    setNotes('');
  };

  const handleSave = () => {
    const newQuotation: Partial<Quotation> = {
      reference: quotationRef,
      title,
      assetCategoryType,
      assetQuantity,
      assetCost: totalNetAssetCost,
      vatAmount,
      vatRate,
      vatTreatment,
      loanAmount,
      customerName: title,
      dealerId: selectedInventoryItem?.dealerId || 'dlr-1',
      dealerName: currentUser.organization || 'Atlas Plant & Machinery Ltd',
      inventoryItemId: selectedInventoryItem?.id,
      assets: [
        {
          id: `ast-${Date.now()}`,
          category: assetCategoryType === 'hard' ? 'Hard Machinery / Commercial Equipment' : 'Soft Asset / Technology',
          manufacturer: selectedInventoryItem?.manufacturer || 'Asset Line',
          model: selectedInventoryItem?.model || title,
          description: selectedInventoryItem?.description || `${assetCategoryType.toUpperCase()} Asset (${assetQuantity} unit${assetQuantity > 1 ? 's' : ''})`,
          quantity: assetQuantity,
          unitPrice: assetCost,
          additionalCosts: 0,
        },
      ],
      financeDetails: {
        financeType,
        deposit: depositAmount,
        depositType,
        termMonths,
        interestRate,
        paymentFrequency,
        balloonPayment,
        documentationFee,
        optionToPurchaseFee,
      },
      status: 'saved',
      notes,
    };

    const saved = saveQuotation(newQuotation);
    addToast('Quotation Saved', `Quotation ${saved.reference} is now available in your Workspace.`, 'success');
    navigate('/workspace');
  };

  const handleConvertToProposal = () => {
    const newQuotation: Partial<Quotation> = {
      reference: quotationRef,
      title,
      assetCategoryType,
      assetQuantity,
      assetCost: totalNetAssetCost,
      vatAmount,
      vatRate,
      vatTreatment,
      loanAmount,
      customerName: title,
      dealerId: selectedInventoryItem?.dealerId || 'dlr-1',
      dealerName: currentUser.organization || 'Atlas Plant & Machinery Ltd',
      inventoryItemId: selectedInventoryItem?.id,
      assets: [
        {
          id: `ast-${Date.now()}`,
          category: assetCategoryType === 'hard' ? 'Hard Machinery' : 'Soft Asset',
          manufacturer: selectedInventoryItem?.manufacturer || 'Commercial Supplier',
          model: selectedInventoryItem?.model || title,
          description: selectedInventoryItem?.description || `${assetCategoryType.toUpperCase()} asset quoted for finance`,
          quantity: assetQuantity,
          unitPrice: assetCost,
          additionalCosts: 0,
        },
      ],
      financeDetails: {
        financeType,
        deposit: depositAmount,
        depositType,
        termMonths,
        interestRate,
        paymentFrequency,
        balloonPayment,
        documentationFee,
        optionToPurchaseFee,
      },
      status: 'converted',
      notes,
    };

    const saved = saveQuotation(newQuotation);
    navigate(`/proposals/new?quotationId=${saved.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Finance Quotation & Amortization</h1>
            <span className="rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700 px-2 py-0.5 border border-slate-200">
              {quotationRef}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculate loan amounts, view month-by-month repayment schedules, and export official PDF quotations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-brand-400" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <FolderKanban className="h-3.5 w-3.5 text-slate-500" />
            <span>Workspace</span>
          </button>
        </div>
      </div>

      {/* Main Single Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Financial Inputs Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Asset Selection / Classification */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                  1
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isDealer ? 'Dealer Stock Asset Selection' : 'Asset Classification'}
                </h2>
              </div>

              {isDealer && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Dealer Inventory Locked
                </span>
              )}
            </div>

            {/* DEALER ADMIN INVENTORY SELECTION */}
            {isDealer ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Select Asset from Dealership Stock *
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="text-[11px] font-medium text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <span>Manage Inventory</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Selected Asset Display Card */}
                {selectedInventoryItem ? (
                  <div className="rounded-xl border-2 border-brand-200 bg-brand-50/30 p-3.5 relative transition-all">
                    <div className="flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedInventoryItem.imageUrl ? (
                          <img
                            src={selectedInventoryItem.imageUrl}
                            alt={selectedInventoryItem.title}
                            className="h-16 w-20 rounded-lg object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                selectedInventoryItem.categoryType === 'hard'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {selectedInventoryItem.categoryType === 'hard' ? 'Hard Asset' : 'Soft Asset'}
                            </span>
                            <span className="text-[11px] text-slate-500">{selectedInventoryItem.categoryName}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                            {selectedInventoryItem.title}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            {selectedInventoryItem.manufacturer} {selectedInventoryItem.model} • Stock:{' '}
                            <strong className="text-slate-800">{selectedInventoryItem.quantity} Available</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Inventory Unit Price</span>
                        <p className="text-lg font-extrabold text-slate-900 leading-tight">
                          {formatCurrency(selectedInventoryItem.price)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setInventoryPickerOpen(!inventoryPickerOpen)}
                          className="mt-1 text-xs font-semibold text-brand-600 hover:text-brand-800 underline block sm:inline"
                        >
                          Change Asset...
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-brand-100/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Lock className="h-3 w-3 text-slate-400" />
                        Asset specifics locked from verified inventory
                      </span>
                      <span className="font-mono text-slate-500">
                        VIN: {selectedInventoryItem.vinOrSerial || 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center bg-slate-50">
                    <Package className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-xs font-semibold text-slate-800">No Inventory Item Selected</p>
                    <button
                      type="button"
                      onClick={() => setInventoryPickerOpen(true)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
                    >
                      Select from Stock
                    </button>
                  </div>
                )}

                {/* Dropdown Inventory Selector Modal / Drawer */}
                {inventoryPickerOpen && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                      <span className="text-xs font-bold text-slate-900">Choose from Available Stock:</span>
                      <button
                        type="button"
                        onClick={() => setInventoryPickerOpen(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {dealerInventory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedInventoryItem(item);
                            setInventoryPickerOpen(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                            selectedInventoryItem?.id === item.id
                              ? 'border-brand-500 bg-brand-50/50'
                              : 'border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-9 w-12 rounded object-cover border border-slate-200"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{item.title}</p>
                              <p className="text-[10px] text-slate-500">
                                {item.categoryName} • {item.quantity} in stock
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Calculated Net Cost for Dealer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Quantity to Quote (Max in stock: {selectedInventoryItem?.quantity || 1})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedInventoryItem?.quantity || 99}
                      value={assetQuantity}
                      onChange={(e) => setAssetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Total Net Asset Cost
                    </label>
                    <div className="w-full rounded-md bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900">
                      {formatCurrency(totalNetAssetCost)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* NON-DEALER (TENANT ADMIN / BROKER) REGULAR FORM */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Quotation / Facility Reference Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scania Tractor Unit 48m HP"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Asset Type: Hard vs Soft */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Asset Type Classification *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAssetCategoryType('hard')}
                        className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium transition-all ${
                          assetCategoryType === 'hard'
                            ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Hard Asset</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">(Machinery, Vehicles, Plant)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetCategoryType('soft')}
                        className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium transition-all ${
                          assetCategoryType === 'soft'
                            ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Soft Asset</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">(IT, Software, Fit-out)</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Asset Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={assetQuantity}
                      onChange={(e) => setAssetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                    />
                  </div>

                  {/* Net Unit Price / Cost */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Unit Cost (£ excl. VAT) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={assetCost}
                      onChange={(e) => setAssetCost(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-brand-600 focus:outline-none"
                    />
                  </div>

                  {/* Total Net Asset Cost */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Total Net Cost
                    </label>
                    <div className="w-full rounded-md bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800">
                      {formatCurrency(totalNetAssetCost)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VAT Treatment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  VAT Treatment
                </label>
                <select
                  value={vatTreatment}
                  onChange={(e) => setVatTreatment(e.target.value as any)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                >
                  <option value="financed">20% Standard VAT (Financed in Facility)</option>
                  <option value="upfront">20% Standard VAT (Paid Upfront by Client)</option>
                  <option value="zero">Zero Rated / Exempt (0%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  VAT Amount ({vatRate}%)
                </label>
                <div className="w-full rounded-md bg-slate-100 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800">
                  {formatCurrency(vatAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financing Terms & Parameters */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                2
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Finance & Amortization Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Loan / Finance Product Type *
                </label>
                <select
                  value={financeType}
                  onChange={(e) => setFinanceType(e.target.value as FinanceType)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                >
                  <option value="hire_purchase">Hire Purchase (HP)</option>
                  <option value="finance_lease">Finance Lease</option>
                  <option value="operating_lease">Operating Lease</option>
                  <option value="other">Commercial Asset Loan</option>
                  <option value="contract_hire">Contract Hire / Refinance</option>
                </select>
              </div>

              {/* Deposit / Advance Payment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Deposit / Upfront</label>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        checked={depositType === 'amount'}
                        onChange={() => setDepositType('amount')}
                        className="mr-1"
                      />
                      £ Amount
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        checked={depositType === 'percentage'}
                        onChange={() => setDepositType('percentage')}
                        className="mr-1"
                      />
                      % Rate
                    </label>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={depositValue}
                  onChange={(e) => setDepositValue(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Effective deposit: {formatCurrency(depositAmount)}
                </span>
              </div>

              {/* Net Loan Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Net Loan / Finance Amount Requested (£)
                </label>
                <div className="w-full rounded-md bg-blue-50/60 border border-blue-200 px-3 py-2 text-xs font-bold text-brand-700">
                  {formatCurrency(loanAmount)}
                </div>
              </div>

              {/* Period (Number of Months) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Period / Term (Number of Months) *
                </label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(parseInt(e.target.value) || 48)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
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

              {/* Interest Rate */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Interest Rate (% p.a. Fixed) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              {/* Payment Frequency */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Frequency
                </label>
                <select
                  value={paymentFrequency}
                  onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                >
                  <option value="monthly">Monthly in Advance</option>
                  <option value="quarterly">Quarterly in Advance</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              {/* Balloon / Residual Payment */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Final Balloon / Residual Payment (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={balloonPayment}
                  onChange={(e) => setBalloonPayment(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              {/* Documentation Fee */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Documentation Fee (£)
                </label>
                <input
                  type="number"
                  min="0"
                  value={documentationFee}
                  onChange={(e) => setDocumentationFee(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              {/* Option to purchase (for HP) */}
              {financeType === 'hire_purchase' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Option to Purchase Fee (£)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={optionToPurchaseFee}
                    onChange={(e) => setOptionToPurchaseFee(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Quotation Remarks */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Financial Terms Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indicative terms subject to credit score and underwriting approval"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Real-time Calculation Summary & Actions */}
        <div className="space-y-4">
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Calculated Repayment
                </h3>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {termMonths} Mo • {paymentFrequency}
              </span>
            </div>

            {/* Big Repayment Display */}
            <div className="rounded-xl bg-brand-50/70 border border-brand-200 p-4 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-900">
                Estimated {paymentFrequency} Repayment
              </span>
              <div className="mt-1 text-2xl font-extrabold text-brand-700">
                {formatCurrency(periodicRepayment)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Excl. VAT where applicable | Rate: {formatPercent(interestRate)} p.a.
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Net Asset Cost:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalNetAssetCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({vatTreatment === 'zero' ? 'Exempt' : '20%'}):</span>
                <span className="font-medium text-slate-800">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Gross Value:</span>
                <span className="font-medium text-slate-800">{formatCurrency(totalCostIncVAT)}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-medium">
                <span>Deposit / Advance:</span>
                <span>-{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
                <span>Finance Requested:</span>
                <span className="text-brand-600">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Total Interest:</span>
                <span>{formatCurrency(totalInterest)}</span>
              </div>
              {balloon > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Final Balloon Payment:</span>
                  <span>{formatCurrency(balloon)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-1 font-semibold text-slate-800">
                <span>Total Amount Repayable:</span>
                <span>{formatCurrency(totalRepayable)}</span>
              </div>
            </div>

            {/* Download PDF & Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-navy-900 py-2.5 text-xs font-bold text-white hover:bg-navy-800 shadow-xs transition-colors"
              >
                <Download className="h-4 w-4 text-brand-400" />
                <span>Download Repayment Plan (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Quotation to Workspace</span>
              </button>

              <button
                type="button"
                onClick={handleConvertToProposal}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <span>Convert Directly to Proposal</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span>Reset Calculator</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE MONTH-BY-MONTH REPAYMENT SCHEDULE / AMORTIZATION PLAN */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Schedule Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Repayment Plan & Amortization Schedule
              </h3>
              <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                {termMonths} Total Payments
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed breakdown of every month you need to pay, including principal repayment, interest portion, and remaining loan balance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-brand-600" />
              <span>Export Schedule PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAllScheduleMonths(!showAllScheduleMonths)}
              className="rounded-lg bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              {showAllScheduleMonths ? 'Show First 12 Months' : `View All ${termMonths} Months`}
            </button>
          </div>
        </div>

        {/* Schedule Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-white border-b border-slate-200 text-center py-2.5">
          <div className="p-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Regular Payment</span>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatCurrency(periodicRepayment)}</p>
          </div>
          <div className="p-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Capital Repaid</span>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatCurrency(loanAmount)}</p>
          </div>
          <div className="p-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Interest</span>
            <p className="text-sm font-extrabold text-amber-700 mt-0.5">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="p-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Payable</span>
            <p className="text-sm font-extrabold text-brand-700 mt-0.5">{formatCurrency(totalRepayable)}</p>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold z-10">
              <tr>
                <th className="px-5 py-2.5">Payment Period</th>
                <th className="px-5 py-2.5 text-right">Payment Due (£)</th>
                <th className="px-5 py-2.5 text-right">Capital Principal (£)</th>
                <th className="px-5 py-2.5 text-right">Interest (£)</th>
                <th className="px-5 py-2.5 text-right">Remaining Balance (£)</th>
                <th className="px-5 py-2.5">Schedule Notes & Milestones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(showAllScheduleMonths
                ? amortizationSchedule
                : amortizationSchedule.slice(0, 12)
              ).map((row) => (
                <tr
                  key={row.month}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.month === 1
                      ? 'bg-blue-50/20'
                      : row.month === termMonths
                      ? 'bg-amber-50/20 font-medium'
                      : ''
                  }`}
                >
                  <td className="px-5 py-2.5 font-semibold text-slate-900">
                    {row.periodLabel}
                  </td>
                  <td className="px-5 py-2.5 text-right font-extrabold text-slate-900">
                    {formatCurrency(row.payment)}
                  </td>
                  <td className="px-5 py-2.5 text-right text-emerald-700 font-medium">
                    {formatCurrency(row.principal)}
                  </td>
                  <td className="px-5 py-2.5 text-right text-amber-700 font-medium">
                    {formatCurrency(row.interest)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono font-semibold text-slate-800">
                    {formatCurrency(row.remainingBalance)}
                  </td>
                  <td className="px-5 py-2.5 text-slate-500 text-[11px]">
                    {row.notes ? (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                        <Info className="h-3 w-3 text-brand-600" />
                        {row.notes}
                      </span>
                    ) : (
                      'Regular monthly repayment'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Schedule Footer Strip */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <span>
            Showing {!showAllScheduleMonths && termMonths > 12 ? `12 of ${termMonths}` : `${termMonths} of ${termMonths}`} monthly repayment installments
          </span>
          <div className="flex items-center gap-2">
            {!showAllScheduleMonths && termMonths > 12 && (
              <button
                type="button"
                onClick={() => setShowAllScheduleMonths(true)}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Expand all {termMonths} months
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-900 hover:text-brand-600"
            >
              <Download className="h-3 w-3" />
              <span>Download Complete Repayment PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
