import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FinancialSummaryCard } from '../../components/common/FinancialSummaryCard';
import { Modal } from '../../components/common/Modal';
import { calculateFinance, formatCurrency, formatDate, formatDateTime } from '../../utils/calculations';
import {
  ArrowLeft,
  Edit2,
  Copy,
  ArrowRight,
  FileSpreadsheet,
  Building2,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Tag,
  User
} from 'lucide-react';

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuotation, duplicateQuotation, addToast, proposals } = useApp();

  const quotation = id ? getQuotation(id) : undefined;
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  if (!quotation) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">Quotation Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested quotation could not be located in local records.
        </p>
        <button
          onClick={() => navigate('/quotations')}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Quotations List
        </button>
      </div>
    );
  }

  const calc = calculateFinance(quotation.assets, quotation.financeDetails);
  const relatedProposal = quotation.convertedProposalId 
    ? proposals.find(p => p.id === quotation.convertedProposalId)
    : undefined;

  const handleDuplicate = () => {
    const copy = duplicateQuotation(quotation.id);
    navigate(`/quotations/${copy.id}/edit`);
  };

  const handleProceedToProposal = () => {
    setConvertModalOpen(false);
    navigate(`/proposals/new?quotationId=${quotation.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Back button and page breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate('/quotations')}
          className="flex items-center gap-1 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Quotations</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{quotation.reference}</span>
      </div>

      {/* Top Banner Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {quotation.reference}
              </h1>
              <StatusBadge status={quotation.status} />
              <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 capitalize">
                {quotation.financeDetails.financeType.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Customer: <span className="font-semibold text-slate-800">{quotation.customerName}</span> • Dealer: <span className="font-medium text-slate-700">{quotation.dealerName}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                window.print();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              Print / PDF
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              Duplicate
            </button>
            <button
              onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Edit2 className="h-4 w-4 text-slate-500" />
              Edit Quotation
            </button>

            {relatedProposal ? (
              <button
                onClick={() => navigate(`/proposals/${relatedProposal.id}`)}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 shadow-sm transition-colors"
              >
                <span>View Linked Proposal ({relatedProposal.reference})</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setConvertModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <span>Convert to Proposal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Timestamps bar */}
        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Created: <strong>{formatDateTime(quotation.createdAt)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Last Updated: <strong>{formatDateTime(quotation.updatedAt)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Valid Until: <strong>{formatDate(quotation.validUntil)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Sales Rep: <strong>{quotation.salesRep}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Financials */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Customer, Dealer, Assets Table, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Dealer Info Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer Information
              </span>
              <h3 className="mt-1 text-sm font-bold text-slate-900">{quotation.customerName}</h3>
              <p className="mt-0.5 text-xs text-slate-600">{quotation.contactPerson}</p>
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p>Email: <span className="text-slate-800">{quotation.email}</span></p>
                <p>Phone: <span className="text-slate-800">{quotation.phone}</span></p>
                {quotation.companyNumber && (
                  <p>Company No: <span className="font-mono text-slate-800">{quotation.companyNumber}</span></p>
                )}
                {quotation.address && (
                  <p className="text-[11px] leading-relaxed pt-1 text-slate-600 border-t border-slate-100">
                    {quotation.address}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dealer & Branch Details
              </span>
              <h3 className="mt-1 text-sm font-bold text-slate-900">{quotation.dealerName}</h3>
              <p className="mt-0.5 text-xs text-slate-600">Authorized Equipment Partner</p>
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p>Originating Branch: <span className="text-slate-800">{quotation.dealerName}</span></p>
                <p>Dealer Code: <span className="font-mono text-slate-800">{quotation.dealerId}</span></p>
                <p>Lead Contact: <span className="text-slate-800">{quotation.salesRep}</span></p>
              </div>
            </div>
          </div>

          {/* Quoted Assets Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Quoted Assets Schedule</h3>
                <p className="text-xs text-slate-500">Breakdown of physical assets included in financing proposal</p>
              </div>
              <span className="rounded bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {quotation.assets.length} Item{quotation.assets.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Asset Details</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Additional Costs</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.assets.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-3 text-slate-500">{item.category}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {item.manufacturer} {item.model}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 max-w-sm">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-800">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {formatCurrency(item.additionalCosts)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency((item.quantity * item.unitPrice) + item.additionalCosts)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {quotation.notes && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs border border-slate-200/70">
                <p className="font-semibold text-slate-700">Quotation Notes:</p>
                <p className="text-slate-600 mt-0.5">{quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Activity / Audit Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Quotation Lifecycle & Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Quotation Generated</p>
                  <p className="text-slate-500">{formatDateTime(quotation.createdAt)} by {quotation.salesRep}</p>
                </div>
              </div>

              {quotation.status === 'converted' && (
                <div className="flex items-start gap-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Converted to Formal Proposal</p>
                    <p className="text-slate-500">
                      Linked to Proposal <strong>{relatedProposal?.reference || quotation.convertedProposalId}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Complete Cost Breakdown & VAT Summary */}
        <div className="space-y-4">
          <FinancialSummaryCard
            summary={calc}
            financeDetails={quotation.financeDetails}
            showRepaymentBreakdown={true}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-xs space-y-3">
            <h4 className="font-semibold text-slate-900">Facility Terms Summary</h4>
            <div className="divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Facility Type:</span>
                <span className="font-semibold capitalize text-slate-900">
                  {quotation.financeDetails.financeType.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Term Duration:</span>
                <span className="font-semibold text-slate-900">{quotation.financeDetails.termMonths} Months</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Payment Cadence:</span>
                <span className="font-semibold capitalize text-slate-900">{quotation.financeDetails.paymentFrequency}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Indicative Rate:</span>
                <span className="font-semibold text-slate-900">{quotation.financeDetails.interestRate}% p.a.</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Balloon Payment:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(quotation.financeDetails.balloonPayment)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Doc & Purchase Fees:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency((quotation.financeDetails.documentationFee || 0) + (quotation.financeDetails.optionToPurchaseFee || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Convert to Proposal Confirmation Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Quotation to Proposal"
        description="Transition this quotation into the formal lender credit submission workflow."
        maxWidth="lg"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setConvertModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToProposal}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <span>Proceed to Proposal Wizard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            You are about to convert <strong>{quotation.reference}</strong> for <strong>{quotation.customerName}</strong> into a multi-step credit proposal.
          </p>

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 space-y-1.5">
            <p className="font-semibold text-slate-800">The following information will be transferred automatically:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Customer contact and company details ({quotation.customerName})</li>
              <li>{quotation.assets.length} Quoted asset line items (Total: {formatCurrency(calc.totalCostIncVAT)})</li>
              <li>Amortization terms, deposit ({formatCurrency(calc.depositAmount)}) and finance requested ({formatCurrency(calc.financeAmount)})</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-500">
            The original quotation record will be preserved with a status of <em>Converted</em>.
          </p>
        </div>
      </Modal>
    </div>
  );
};
