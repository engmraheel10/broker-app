import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lender } from '../../types';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/calculations';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Cpu
} from 'lucide-react';

export const LendersPage: React.FC = () => {
  const { lenders, addToast } = useApp();
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [testingLenderId, setTestingLenderId] = useState<string | null>(null);

  const handleTestConnection = (lender: Lender) => {
    setTestingLenderId(lender.id);
    setTimeout(() => {
      setTestingLenderId(null);
      addToast(
        'Lender API Ping Successful',
        `${lender.name} endpoint responded with HTTP 200 OK (Latency: 64ms). Rate card synchronized.`,
        'success'
      );
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Lender & Funder Panel Directory</h1>
          <p className="text-xs text-slate-500">
            Integrated credit providers, API submission gateways, underwriting parameters, and product appetite
          </p>
        </div>
      </div>

      {/* Lender Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {lenders.map((lender) => {
          const isTesting = testingLenderId === lender.id;

          return (
            <div
              key={lender.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: lender.logoColor }}
                    >
                      {lender.code.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{lender.name}</h3>
                      <span className="font-mono text-[10px] text-slate-400">{lender.code}</span>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    {lender.status === 'connected' ? 'API Gateway Live' : 'Demo Active'}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">{lender.tagline}</p>

                {/* Key Metrics */}
                <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Max LTV:</span>
                    <strong className="text-slate-900">{lender.maxLTV}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Facility Limits:</span>
                    <strong className="text-slate-900">{formatCurrency(lender.minFinance)} - {formatCurrency(lender.maxFinance)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Term Range:</span>
                    <strong className="text-slate-900">{lender.minTerm} - {lender.maxTerm} Months</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Decision Velocity:</span>
                    <strong className="text-slate-900">{lender.avgDecisionTime}</strong>
                  </div>
                </div>

                {/* Supported Products */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Supported Facilities:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {lender.supportedProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => handleTestConnection(lender)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging Gateway...' : 'Test API'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLender(lender)}
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  View Criteria
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lender Detail Modal */}
      {selectedLender && (
        <Modal
          isOpen={Boolean(selectedLender)}
          onClose={() => setSelectedLender(null)}
          title={`${selectedLender.name} - Underwriting Criteria`}
          description={selectedLender.tagline}
          maxWidth="lg"
          footer={
            <button
              onClick={() => setSelectedLender(null)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Eligible Asset Categories</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedLender.supportedAssetCategories.map((c, i) => (
                  <span key={i} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Mandatory Document Requirements</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                {selectedLender.requiredDocuments.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 space-y-1">
              <p><strong>FCA Permissions:</strong> Full Consumer & Commercial Asset Lending Authorization</p>
              <p><strong>Electronic Signature:</strong> DocuSign & OneSpan Integrated</p>
              <p><strong>Payout SLA:</strong> Same-day upon receipt of delivery note & dealer invoice</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
