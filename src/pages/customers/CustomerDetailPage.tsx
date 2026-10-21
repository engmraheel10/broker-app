import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, quotations, proposals } = useApp();

  const customer = id ? getCustomer(id) : undefined;

  if (!customer) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <User className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">Customer Not Found</h2>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Customer Directory
        </button>
      </div>
    );
  }

  const customerQuotations = quotations.filter(
    (q) => q.customerName.toLowerCase() === customer.name.toLowerCase()
  );
  const customerProposals = proposals.filter(
    (p) => p.customerName.toLowerCase() === customer.name.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-1 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Customers</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{customer.name}</span>
      </div>

      {/* Customer Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600 border border-brand-100">
              {customer.type === 'business' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  {customer.creditRating || 'Active Borrower'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Contact: <strong className="text-slate-700">{customer.contactPerson}</strong> • {customer.type === 'business' ? 'Limited Entity' : 'Individual'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/quotations/new')}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Quotation for Customer
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{customer.phone}</span>
          </div>
          {customer.address && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Linked Quotations & Proposals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quotations */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900">Active Quotations ({customerQuotations.length})</h3>
            <button
              onClick={() => navigate('/quotations/new')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              + Create New
            </button>
          </div>

          {customerQuotations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No quotations generated for this customer yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {customerQuotations.map((q) => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/quotations/${q.id}`)}
                  className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-2 rounded"
                >
                  <div>
                    <span className="font-semibold text-brand-600">{q.reference}</span>
                    <p className="text-[11px] text-slate-500">{q.dealerName} • {formatDate(q.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={q.status} size="sm" />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proposals */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900">Submitted Proposals ({customerProposals.length})</h3>
            <button
              onClick={() => navigate('/proposals/new')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              + Create Proposal
            </button>
          </div>

          {customerProposals.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No formal credit proposals recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {customerProposals.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/proposals/${p.id}`)}
                  className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-2 rounded"
                >
                  <div>
                    <span className="font-semibold text-brand-600">{p.reference}</span>
                    <p className="text-[11px] text-slate-500">{p.lenderName} • {p.brokerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} size="sm" />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
