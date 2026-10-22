import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FinancialSummaryCard } from '../../components/common/FinancialSummaryCard';
import { calculateFinance, formatCurrency, formatDate, formatDateTime } from '../../utils/calculations';
import {
  ArrowLeft,
  Edit2,
  Send,
  FileText,
  Building2,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Truck,
  Coins,
  FileCheck2,
  Activity,
  Download,
  AlertTriangle,
  Landmark,
  UserCheck,
  Wrench,
  Users,
  Sparkles
} from 'lucide-react';

export const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposal, submitProposal, saveProposal, addToast } = useApp();

  const proposal = id ? getProposal(id) : undefined;
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'services' | 'principals' | 'financials' | 'documents' | 'activity'>('overview');

  if (!proposal) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">Proposal Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested proposal could not be found in active records.
        </p>
        <button
          onClick={() => navigate('/proposals')}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  const calc = calculateFinance(proposal.assets, proposal.financeDetails);
  const canSubmit = proposal.status === 'ready_to_submit' || proposal.status === 'draft';
  const servicesList = proposal.servicesAndAddOns || [];
  const directorsList = proposal.directors || [];
  const guarantor = proposal.businessPartner;

  const handleSubmit = () => {
    if (window.confirm(`Submit proposal ${proposal.reference} to ${proposal.lenderName}?`)) {
      submitProposal(proposal.id);
    }
  };

  const handleWithdraw = () => {
    if (window.confirm('Are you sure you want to withdraw this credit proposal?')) {
      saveProposal({ id: proposal.id, status: 'withdrawn' });
      addToast('Proposal Withdrawn', `Proposal ${proposal.reference} has been marked as withdrawn.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate('/proposals')}
          className="flex items-center gap-1 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Proposals</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{proposal.reference}</span>
      </div>

      {/* Top Banner Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {proposal.reference}
              </h1>
              <StatusBadge status={proposal.status} />
              <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                {proposal.lenderName}
              </span>
              {proposal.preEligibilityScore && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  Score: {proposal.preEligibilityScore}/100
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Customer: <span className="font-semibold text-slate-800">{proposal.customerName}</span> • Intermediary: <span className="font-medium text-slate-700">{proposal.brokerName}</span> ({proposal.brokerOrg})
            </p>
          </div>

          {/* Contextual Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              Export / Print
            </button>

            <button
              onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Edit2 className="h-4 w-4 text-slate-500" />
              Edit Proposal
            </button>

            {canSubmit && (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Submit to {proposal.lenderName}</span>
              </button>
            )}

            {proposal.status !== 'withdrawn' && (
              <button
                onClick={handleWithdraw}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-sm"
              >
                Withdraw
              </button>
            )}
          </div>
        </div>

        {/* Timestamps & References */}
        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Created: <strong>{formatDateTime(proposal.createdAt)}</strong></span>
          </div>
          {proposal.submittedAt && (
            <div className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-slate-400" />
              <span>Submitted: <strong>{formatDateTime(proposal.submittedAt)}</strong></span>
            </div>
          )}
          {proposal.quotationReference && (
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Origin Quotation: </span>
              <button
                onClick={() => navigate(`/quotations/${proposal.quotationId}`)}
                className="text-brand-600 hover:underline font-semibold"
              >
                {proposal.quotationReference}
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Last Updated: <strong>{formatDateTime(proposal.updatedAt)}</strong></span>
          </div>
        </div>
      </div>

      {/* Functional Tabs Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs overflow-x-auto">
        <nav className="flex space-x-2 p-1.5 min-w-max text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'assets', label: `Assets (${proposal.assets.length})`, icon: Truck },
            { id: 'services', label: `Services & Add-Ons (${servicesList.length})`, icon: Wrench },
            { id: 'principals', label: `Principals & Guarantor (${directorsList.length})`, icon: Users },
            { id: 'financials', label: 'Financials & Amortization', icon: Coins },
            { id: 'documents', label: `Documents (${proposal.documents.length})`, icon: FileCheck2 },
            { id: 'activity', label: `Activity Log (${proposal.activityHistory.length})`, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {proposal.status === 'approved' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Lender Decision: Credit Approved</span>
                </div>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  {proposal.decisionNotes || 'Facility approved in principle subject to receipt of original equipment delivery confirmation and direct debit mandate.'}
                </p>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-emerald-700 font-medium">
                  <span>Decision Date: {formatDate(proposal.decisionAt || proposal.updatedAt)}</span>
                  <span>Approved Limit: {formatCurrency(calc.financeAmount)}</span>
                </div>
              </div>
            )}

            {proposal.status === 'submitted' && (
              <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-5">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <Clock className="h-5 w-5 text-sky-600 animate-pulse" />
                  <span>Application Dispatched to {proposal.lenderName}</span>
                </div>
                <p className="mt-1 text-xs text-sky-800 leading-relaxed">
                  The credit file has been submitted to the lender underwriting queue. Automated risk score processing typically concludes within 4 to 12 hours.
                </p>
              </div>
            )}

            {/* Stakeholders Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Borrowing Customer
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{proposal.customerName}</h3>
                  <p className="text-xs text-slate-500">{proposal.clientType || 'Corporate Borrower'} • {proposal.creditTier || 'Tier 1'}</p>
                </div>
                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  <p>Contact: <span className="font-semibold text-slate-800">{proposal.contactPerson}</span></p>
                  <p>Email: <span className="text-slate-800">{proposal.email}</span></p>
                  <p>Phone: <span className="text-slate-800">{proposal.phone}</span></p>
                  {proposal.companyNumber && (
                    <p>Companies House No: <span className="font-mono text-slate-800">{proposal.companyNumber}</span></p>
                  )}
                  {proposal.address && (
                    <p className="text-[11px] pt-1 text-slate-500">{proposal.address}</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Intermediary & Channel
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{proposal.brokerName}</h3>
                  <p className="text-xs text-slate-500">{proposal.brokerOrg}</p>
                </div>
                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  <p>Supplying Dealer: <span className="text-slate-800 font-medium">{proposal.dealerName}</span></p>
                  <p>Target Funder: <span className="text-slate-800 font-medium">{proposal.lenderName}</span></p>
                  <p>Facility Program: <span className="text-slate-800">{proposal.programName || 'Commercial Line'}</span></p>
                  <p>Regulated Status: <span className="text-slate-800">{proposal.productType || 'Non-Regulated'}</span></p>
                </div>
              </div>
            </div>

            {/* Assets Preview Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Equipment Pledged ({proposal.assets.length})</h3>
                <button
                  onClick={() => setActiveTab('assets')}
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  View Full Schedule
                </button>
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                {proposal.assets.map((a, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{a.quantity}x {a.manufacturer} {a.model}</p>
                      <p className="text-[11px] text-slate-500">{a.category} {a.serialNumber ? `• VIN: ${a.serialNumber}` : ''}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatCurrency((a.quantity * a.unitPrice) + a.additionalCosts)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FinancialSummaryCard
              summary={calc}
              financeDetails={proposal.financeDetails}
              showRepaymentBreakdown={true}
            />
          </div>
        </div>
      )}

      {/* 2. ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pledged Asset Collateral Schedule</h3>
              <p className="text-xs text-slate-500">Commercial machinery, vehicles, and plant pledged for facility security</p>
            </div>
            <span className="text-xs font-semibold text-slate-700">Total Asset Value: {formatCurrency(calc.totalCostIncVAT)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Manufacturer & Model</th>
                  <th className="p-3 font-semibold">Serial / VIN</th>
                  <th className="p-3 font-semibold">Supplier / Vendor</th>
                  <th className="p-3 font-semibold text-center">Qty</th>
                  <th className="p-3 font-semibold text-right">Unit Net</th>
                  <th className="p-3 font-semibold text-right">Trade-In</th>
                  <th className="p-3 font-semibold text-right">Total Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposal.assets.map((a, i) => (
                  <tr key={i}>
                    <td className="p-3 text-slate-500">{a.category}</td>
                    <td className="p-3 font-semibold text-slate-900">{a.manufacturer} {a.model}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">{a.serialNumber || '—'}</td>
                    <td className="p-3 text-slate-600">{a.supplierName || '—'}</td>
                    <td className="p-3 text-center font-medium">{a.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(a.unitPrice)}</td>
                    <td className="p-3 text-right text-emerald-700">{a.tradeInAllowance ? `-${formatCurrency(a.tradeInAllowance)}` : '£0.00'}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency((a.quantity * a.unitPrice) + a.additionalCosts - (a.tradeInAllowance || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SERVICES & ADD-ONS TAB */}
      {activeTab === 'services' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Services & Add-Ons Schedule ({servicesList.length})</h3>
              <p className="text-xs text-slate-500">Secondary warranties, insurance agreements, GAP policies, and fee receivables</p>
            </div>
          </div>

          {servicesList.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400 italic">No secondary services or add-on packages attached to this proposal.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {servicesList.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{srv.serviceType}</td>
                      <td className="py-2.5 px-3 text-slate-600">{srv.description}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. PRINCIPALS & GUARANTOR TAB */}
      {activeTab === 'principals' && (
        <div className="space-y-6">
          {/* Directors Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-3">Statutory Directors & Key Principals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2 px-3">Full Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Contact Number</th>
                    <th className="py-2 px-3">DOB</th>
                    <th className="py-2 px-3">Nationality</th>
                    <th className="py-2 px-3">Homeowner Status</th>
                    <th className="py-2 px-3">Time At Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directorsList.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{d.fullName}</td>
                      <td className="py-2 px-3 text-slate-600">{d.email}</td>
                      <td className="py-2 px-3 font-mono">{d.contactNumber}</td>
                      <td className="py-2 px-3">{d.dateOfBirth}</td>
                      <td className="py-2 px-3">{d.nationality}</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">{d.homeownerStatus}</td>
                      <td className="py-2 px-3 text-slate-500">{d.timeAtAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guarantor Details */}
          {guarantor?.enabled && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                Business Partner / Guarantor: {guarantor.companyName} ({guarantor.role})
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Entity Type: <strong>{guarantor.clientType}</strong></div>
                <div>Credit Tier: <strong>{guarantor.creditTier}</strong></div>
                <div>Registration No: <span className="font-mono">{guarantor.companyRegistrationNumber || '—'}</span></div>
                <div>Email: {guarantor.emailAddress}</div>
                <div>Trading As: {guarantor.tradingAs || '—'}</div>
                <div>Nature of Business: {guarantor.natureOfBusiness || '—'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. FINANCIALS TAB */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-3">Facility Parameters & Amortization</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Finance Facility:</span>
                <p className="text-sm font-bold text-slate-900 capitalize">{proposal.financeDetails.financeType.replace(/_/g, ' ')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Duration:</span>
                <p className="text-sm font-bold text-slate-900">{proposal.financeDetails.termMonths} Months</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Deposit / Upfront:</span>
                <p className="text-sm font-bold text-amber-700">{formatCurrency(calc.depositAmount)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Net Capital Financed:</span>
                <p className="text-sm font-bold text-brand-600">{formatCurrency(calc.financeAmount)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Indicative Rate:</span>
                <p className="text-sm font-bold text-slate-900">{proposal.financeDetails.interestRate}% p.a.</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Payment Cadence:</span>
                <p className="text-sm font-bold text-slate-900 capitalize">{proposal.financeDetails.paymentFrequency}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FinancialSummaryCard
              summary={calc}
              financeDetails={proposal.financeDetails}
              showRepaymentBreakdown={true}
            />
          </div>
        </div>
      )}

      {/* 6. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attached Credit & Verification Files</h3>
              <p className="text-xs text-slate-500">Files submitted to {proposal.lenderName} for underwriting verification</p>
            </div>
            <span className="text-xs text-slate-500">{proposal.documents.length} File(s)</span>
          </div>

          {proposal.documents.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No documents attached.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {proposal.documents.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.size} • Uploaded {formatDate(doc.uploadedAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToast('Download Triggered', `Downloading simulated document ${doc.name}`, 'info')}
                    className="flex items-center gap-1 rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Application Lifecycle & Underwriting History</h3>
            <p className="text-xs text-slate-500">Chronological audit log of submission events and decisions</p>
          </div>

          <div className="space-y-4">
            {proposal.activityHistory.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-4 relative">
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.action}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(item.timestamp)}</span>
                  </div>
                  <p className="text-slate-600">
                    By <strong className="text-slate-800">{item.user}</strong> ({item.role})
                  </p>
                  {item.details && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded mt-1 border border-slate-100">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
