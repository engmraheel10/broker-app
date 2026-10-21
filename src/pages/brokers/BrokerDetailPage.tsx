import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/calculations';
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  FileText,
  ArrowRight
} from 'lucide-react';

export const BrokerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBroker, proposals } = useApp();

  const broker = id ? getBroker(id) : undefined;

  if (!broker) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">Broker Not Found</h2>
        <button
          onClick={() => navigate('/brokers')}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Broker Directory
        </button>
      </div>
    );
  }

  const brokerProposals = proposals.filter((p) => p.brokerId === broker.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate('/brokers')}
          className="flex items-center gap-1 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Brokers</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{broker.name}</span>
      </div>

      {/* Broker Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-700 border border-purple-100">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{broker.name}</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  {broker.commissionTier}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Firm: <strong className="text-slate-800">{broker.organization}</strong> • FCA Lic: <span className="font-mono">{broker.fcaNumber}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{broker.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{broker.phone}</span>
          </div>
          <div>
            <span className="text-slate-400">Territory:</span>{' '}
            <strong className="text-slate-700">{broker.region}</strong>
          </div>
          <div>
            <span className="text-slate-400">Approval Rate:</span>{' '}
            <strong className="text-emerald-600">{broker.approvalRate}%</strong>
          </div>
        </div>
      </div>

      {/* Assigned Proposals Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Proposals Managed by {broker.name} ({brokerProposals.length})
            </h3>
            <p className="text-xs text-slate-500">Pipeline of credit submissions packaged by this intermediary</p>
          </div>
          <button
            onClick={() => navigate('/proposals/new')}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Create Proposal for Broker
          </button>
        </div>

        {brokerProposals.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            No active proposals assigned to this broker yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Supplying Dealer</th>
                  <th className="p-3">Lender</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Updated</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brokerProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-brand-600">{p.reference}</td>
                    <td className="p-3 font-medium text-slate-900">{p.customerName}</td>
                    <td className="p-3 text-slate-700">{p.dealerName}</td>
                    <td className="p-3 text-slate-700">{p.lenderName}</td>
                    <td className="p-3">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="p-3 text-right text-slate-500">{formatDate(p.updatedAt)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/proposals/${p.id}`)}
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
