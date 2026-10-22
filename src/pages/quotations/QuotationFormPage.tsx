import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  AssetLineItem,
  CustomerType,
  FinanceDetails,
  FinanceType,
  PaymentFrequency,
  Quotation,
} from '../../types';
import { calculateFinance, formatCurrency } from '../../utils/calculations';
import { FinancialSummaryCard } from '../../components/common/FinancialSummaryCard';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Eye,
  X,
  FileSpreadsheet,
  Building2,
  User,
  Truck,
  Coins,
  ShieldCheck,
  Check
} from 'lucide-react';

export const QuotationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuotation, saveQuotation, dealers, customers, addToast } = useApp();

  const isEditing = Boolean(id);
  const existingQuotation = id ? getQuotation(id) : undefined;

  // Form States
  const [customerType, setCustomerType] = useState<CustomerType>('business');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');

  const [dealerId, setDealerId] = useState('dlr-1');
  const [notes, setNotes] = useState('');

  // Assets list (dynamic multiple assets)
  const [assets, setAssets] = useState<AssetLineItem[]>([
    {
      id: 'ast-1',
      category: 'Commercial Vehicles',
      manufacturer: '',
      model: '',
      description: '',
      quantity: 1,
      unitPrice: 50000,
      additionalCosts: 0,
    },
  ]);

  // Finance Details
  const [financeType, setFinanceType] = useState<FinanceType>('hire_purchase');
  const [deposit, setDeposit] = useState<number>(10000);
  const [depositType, setDepositType] = useState<'amount' | 'percentage'>('amount');
  const [termMonths, setTermMonths] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [balloonPayment, setBalloonPayment] = useState<number>(0);
  const [documentationFee, setDocumentationFee] = useState<number>(295);
  const [optionToPurchaseFee, setOptionToPurchaseFee] = useState<number>(150);

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Prepopulate if editing
  useEffect(() => {
    if (existingQuotation) {
      setCustomerType(existingQuotation.customerType || 'business');
      setCustomerName(existingQuotation.customerName || existingQuotation.title || '');
      setContactPerson(existingQuotation.contactPerson || '');
      setEmail(existingQuotation.email || '');
      setPhone(existingQuotation.phone || '');
      setAddress(existingQuotation.address || '');
      setCompanyNumber(existingQuotation.companyNumber || '');
      setDealerId(existingQuotation.dealerId || '');
      setNotes(existingQuotation.notes || '');
      if (existingQuotation.assets && existingQuotation.assets.length > 0) {
        setAssets(existingQuotation.assets);
      }

      const f = existingQuotation.financeDetails;
      setFinanceType(f.financeType);
      setDeposit(f.deposit);
      setDepositType(f.depositType || 'amount');
      setTermMonths(f.termMonths);
      setInterestRate(f.interestRate);
      setPaymentFrequency(f.paymentFrequency);
      setBalloonPayment(f.balloonPayment);
      setDocumentationFee(f.documentationFee);
      setOptionToPurchaseFee(f.optionToPurchaseFee);
    }
  }, [existingQuotation]);

  // Quick fill from existing customer
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    if (!custId) return;
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomerType(found.type);
      setCustomerName(found.name);
      setContactPerson(found.contactPerson);
      setEmail(found.email);
      setPhone(found.phone);
      setAddress(found.address);
      setCompanyNumber(found.companyNumber || '');
    }
  };

  // Add Asset line item
  const handleAddAsset = () => {
    const newItem: AssetLineItem = {
      id: `ast-${Date.now()}`,
      category: 'Construction & Earthmoving',
      manufacturer: '',
      model: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      additionalCosts: 0,
    };
    setAssets(prev => [...prev, newItem]);
  };

  // Remove Asset line item
  const handleRemoveAsset = (assetId: string) => {
    if (assets.length === 1) {
      addToast('Cannot remove', 'At least one asset must be specified in the quotation.', 'warning');
      return;
    }
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  // Update specific asset line item
  const handleUpdateAsset = (assetId: string, field: keyof AssetLineItem, value: any) => {
    setAssets(prev =>
      prev.map(a => {
        if (a.id === assetId) {
          return { ...a, [field]: value };
        }
        return a;
      })
    );
  };

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

  // Live dynamic calculation
  const liveSummary = calculateFinance(assets, currentFinanceDetails);

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!customerName.trim()) errors.push('Customer / Business Name is required');
    if (!email.trim() || !email.includes('@')) errors.push('A valid contact email is required');
    if (!phone.trim()) errors.push('Contact telephone number is required');
    if (assets.some(a => !a.manufacturer.trim() || !a.model.trim())) {
      errors.push('All assets must have a Manufacturer and Model defined');
    }
    if (assets.some(a => Number(a.unitPrice) <= 0)) {
      errors.push('Asset unit price must be greater than £0.00');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Save handler
  const handleSave = (status: 'draft' | 'saved', navigateAfter = true) => {
    if (status === 'saved' && !validateForm()) {
      addToast('Validation Incomplete', 'Please correct the highlighted form errors before saving as final quotation.', 'error');
      return null;
    }

    const selectedDealer = dealers.find(d => d.id === dealerId) || dealers[0];

    const qData: Partial<Quotation> & { id?: string } = {
      id: existingQuotation?.id,
      customerType,
      customerName: customerName || 'Untitled Customer',
      contactPerson,
      email,
      phone,
      address,
      companyNumber,
      dealerId: selectedDealer.id,
      dealerName: selectedDealer.name,
      assets,
      financeDetails: currentFinanceDetails,
      status,
      notes,
    };

    const saved = saveQuotation(qData);
    if (navigateAfter) {
      navigate(`/quotations/${saved.id}`);
    }
    return saved;
  };

  // Convert to Proposal directly from form
  const handleConvertToProposal = () => {
    const saved = handleSave('saved', false);
    if (saved) {
      navigate(`/proposals/new?quotationId=${saved.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditing ? `Edit Quotation: ${existingQuotation?.reference}` : 'Create New Quotation'}
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {isEditing ? 'Editing Mode' : 'New Draft'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure customer details, asset lines, and financing amortization schedule
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            Preview Quotation
          </button>
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('saved')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Check className="h-4 w-4" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleConvertToProposal}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <span>Convert to Proposal</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Validation Banner if errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <p className="font-semibold mb-1">Please review the following requirements:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Input Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-blue-50 p-1.5 text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Customer Information</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Quick fill customer:</span>
                <select
                  onChange={handleSelectCustomer}
                  defaultValue=""
                  className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                >
                  <option value="" disabled>Select existing...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700">Entity Type:</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="customerType"
                    checked={customerType === 'business'}
                    onChange={() => setCustomerType('business')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>Limited Company / Corporate</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="customerType"
                    checked={customerType === 'individual'}
                    onChange={() => setCustomerType('individual')}
                    className="text-brand-600 focus:ring-brand-500"
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
                  placeholder={customerType === 'business' ? 'e.g. Apex Logistics Ltd' : 'e.g. Patrick Kavanagh'}
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
                <label className="block text-xs font-medium text-slate-700">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Martin Fletcher (Director)"
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
                  placeholder="e.g. finance@customer.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Telephone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +44 121 550 4910"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Dealer / Branch</label>
                <select
                  value={dealerId}
                  onChange={(e) => setDealerId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  {dealers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.tier} Partner)</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">Trading / Registered Address</label>
                <input
                  type="text"
                  placeholder="e.g. Logistics Way, Minworth Industrial Park, Sutton Coldfield, B76 9BL"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Asset Information (Dynamic Multiple Assets) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-purple-50 p-1.5 text-purple-600">
                  <Truck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Asset Details ({assets.length} Item{assets.length > 1 ? 's' : ''})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddAsset}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Asset Line
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 relative"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Asset #{index + 1}
                    </span>
                    {assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Asset
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Asset Category</label>
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
                        placeholder="e.g. Scania, Caterpillar, Mazak"
                        value={asset.manufacturer}
                        onChange={(e) => handleUpdateAsset(asset.id, 'manufacturer', e.target.value)}
                        className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Model Specification *</label>
                      <input
                        type="text"
                        placeholder="e.g. R 500 V8 6x2 Tractor Unit"
                        value={asset.model}
                        onChange={(e) => handleUpdateAsset(asset.id, 'model', e.target.value)}
                        className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-600">Full Description / Options</label>
                      <input
                        type="text"
                        placeholder="e.g. Highline cab, retarder, Euro 6 step E, sliding fifth wheel"
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
                        step="500"
                        value={asset.unitPrice}
                        onChange={(e) => handleUpdateAsset(asset.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Additional Costs (£)</label>
                      <input
                        type="number"
                        min="0"
                        value={asset.additionalCosts}
                        onChange={(e) => handleUpdateAsset(asset.id, 'additionalCosts', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 text-right text-[11px] text-slate-500 font-medium">
                    Line Total: <span className="text-slate-900 font-bold">{formatCurrency((asset.quantity * asset.unitPrice) + asset.additionalCosts)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Finance Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-emerald-50 p-1.5 text-emerald-600">
                  <Coins className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Finance Terms & Structure</h3>
              </div>
              <span className="text-xs font-semibold text-brand-600 capitalize">
                {financeType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Finance Product Type</label>
                <select
                  value={financeType}
                  onChange={(e) => setFinanceType(e.target.value as FinanceType)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="hire_purchase">Hire Purchase (HP)</option>
                  <option value="finance_lease">Finance Lease</option>
                  <option value="operating_lease">Operating Lease</option>
                  <option value="contract_hire">Contract Hire</option>
                  <option value="other">Other Commercial Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Deposit / Advance (£)</label>
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
                <label className="block text-xs font-medium text-slate-700">Finance Term (Months)</label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(parseInt(e.target.value) || 48)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
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
                <label className="block text-xs font-medium text-slate-700">Indicative Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none font-medium"
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
                <label className="block text-xs font-medium text-slate-700">Final Balloon / Residual (£)</label>
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
                <label className="block text-xs font-medium text-slate-700">Documentation Fee (£)</label>
                <input
                  type="number"
                  min="0"
                  value={documentationFee}
                  onChange={(e) => setDocumentationFee(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              {financeType === 'hire_purchase' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700">Option to Purchase Fee (£)</label>
                  <input
                    type="number"
                    min="0"
                    value={optionToPurchaseFee}
                    onChange={(e) => setOptionToPurchaseFee(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700">Quotation Notes / Terms Conditions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Indicative quotation subject to credit underwriting and satisfactory asset inspection."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Financial Summary Sticky Card */}
        <div className="space-y-4">
          <div className="sticky top-6">
            <FinancialSummaryCard
              summary={liveSummary}
              financeDetails={currentFinanceDetails}
              showRepaymentBreakdown={true}
            />

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs space-y-2">
              <h4 className="font-semibold text-slate-900">Quotation Quick Actions</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                You can save this quotation as draft at any stage or directly convert it into a formal proposal for lender credit submission.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConvertToProposal}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <span>Convert into Proposal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Preview Formal PDF Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Quotation Document Preview"
        description="Formal financial schedule preview as provided to customer"
        maxWidth="2xl"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setPreviewOpen(false);
                addToast('Print Triggered', 'Simulated document export to PDF.', 'info');
              }}
              className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Export / Print PDF
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="flex justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">CAPITAS FINANCE</h2>
              <p className="text-[11px] text-slate-500">Commercial Asset Financing Solutions</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-brand-600">INDICATIVE QUOTATION</p>
              <p className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Customer Details</p>
              <p className="font-semibold text-slate-900 mt-1">{customerName || 'Customer Ltd'}</p>
              <p className="text-slate-600">{contactPerson}</p>
              <p className="text-slate-600">{email} • {phone}</p>
              {address && <p className="text-slate-600">{address}</p>}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Finance Facility</p>
              <p className="font-semibold text-slate-900 mt-1 capitalize">{financeType.replace(/_/g, ' ')}</p>
              <p className="text-slate-600">Term: {termMonths} Months</p>
              <p className="text-slate-600">Payment: {paymentFrequency}</p>
              <p className="text-slate-600">Interest: {interestRate}% p.a.</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Quoted Assets</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.map((a, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <span className="font-medium text-slate-900">{a.manufacturer} {a.model}</span>
                        {a.description && <p className="text-[11px] text-slate-500">{a.description}</p>}
                      </td>
                      <td className="p-2 text-center">{a.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(a.unitPrice)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(a.quantity * a.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <div className="text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Important Terms:</p>
              <p>Documentation Fee: {formatCurrency(documentationFee)}</p>
              {financeType === 'hire_purchase' && <p>Option to Purchase: {formatCurrency(optionToPurchaseFee)}</p>}
              <p className="mt-1">Valid for 30 calendar days from date of issue.</p>
            </div>
            <div className="space-y-1 text-right text-xs">
              <div className="flex justify-between">
                <span>Net Asset Cost:</span>
                <span className="font-medium">{formatCurrency(liveSummary.assetSubtotal + liveSummary.additionalCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (20%):</span>
                <span>{formatCurrency(liveSummary.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Deposit:</span>
                <span>-{formatCurrency(liveSummary.depositAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
                <span>Finance Amount:</span>
                <span className="text-brand-600">{formatCurrency(liveSummary.financeAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 bg-brand-50 p-2 rounded mt-2">
                <span>Est. Repayment ({paymentFrequency}):</span>
                <span className="text-brand-700">{formatCurrency(liveSummary.estimatedRepayment)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
