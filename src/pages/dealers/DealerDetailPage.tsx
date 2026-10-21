import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/calculations';
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Award,
  FileSpreadsheet,
  Plus,
  ArrowRight
} from 'lucide-react';

export const DealerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDealer, quotations } = useApp();

  const dealer = id ? getDealer(id) : undefined;

  if (!dealer) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Store className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">Dealer Not Found</h2>
        <button
          onClick={() => navigate('/dealers')}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Dealer Network
        </button>
      </div>
    );
  }

  const dealerQuotations = quotations.filter((q) => q.dealerId === dealer.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate('/dealers')}
          className="flex items-center gap-1 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dealers</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{dealer.name}</span>
      </div>

      {/* Dealer Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-brand-600 border border-blue-100">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{dealer.name}</h1>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                  {dealer.tier} Tier Partner
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Branch Code: <span className="font-mono font-semibold text-slate-800">{dealer.code}</span> • Contact: {dealer.contactName}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/quotations/new')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Quotation for Dealer
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{dealer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{dealer.phone}</span>
          </div>
          {dealer.address && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="truncate">{dealer.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Originating Quotations Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Quotations Originating from {dealer.name} ({dealerQuotations.length})
            </h3>
            <p className="text-xs text-slate-500">Commercial proposals originated through this dealer showroom</p>
          </div>
          <button
            onClick={() => navigate('/quotations/new')}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Create New Quote
          </button>
        </div>

        {dealerQuotations.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            No active quotations currently linked to this dealership.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Created</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dealerQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-brand-600">{q.reference}</td>
                    <td className="p-3 font-medium text-slate-900">{q.customerName}</td>
                    <td className="p-3 text-slate-700 capitalize">{q.financeDetails.financeType.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <StatusBadge status={q.status} size="sm" />
                    </td>
                    <td className="p-3 text-right text-slate-500">{formatDate(q.createdAt)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/quotations/${q.id}`)}
                        className="font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
