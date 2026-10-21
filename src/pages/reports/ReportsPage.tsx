import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { proposals, quotations, addToast } = useApp();
  const [dateRange, setDateRange] = useState('q1_2026');

  const handleExportCSV = () => {
    addToast(
      'Export Generated',
      'Downloaded Capitas_Financial_Reporting_Q1_2026.csv (Simulated data export).',
      'success'
    );
  };

  const monthlyData = [
    { month: 'Oct 2025', volume: 1850000, quotes: 14, proposals: 9, approvedRate: 85 },
    { month: 'Nov 2025', volume: 2240000, quotes: 18, proposals: 12, approvedRate: 88 },
    { month: 'Dec 2025', volume: 1980000, quotes: 15, proposals: 11, approvedRate: 84 },
    { month: 'Jan 2026', volume: 2650000, quotes: 21, proposals: 16, approvedRate: 91 },
    { month: 'Feb 2026', volume: 3120000, quotes: 26, proposals: 19, approvedRate: 89 },
    { month: 'Mar 2026', volume: 3840000, quotes: 32, proposals: 24, approvedRate: 92 },
  ];

  const lenderBreakdown = [
    { lender: 'Investec Asset Finance', volume: 4850000, percentage: 38, avgDecision: '5.2h' },
    { lender: 'Lombard Asset Finance', volume: 3420000, percentage: 27, avgDecision: '18.4h' },
    { lender: 'Capitas Internal Syndication', volume: 2150000, percentage: 17, avgDecision: '3.1h' },
    { lender: 'Aldermore Bank', volume: 1420000, percentage: 11, avgDecision: '12.0h' },
    { lender: 'Close Brothers', volume: 890000, percentage: 7, avgDecision: '9.5h' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Financial Reporting & Analytics</h1>
          <p className="text-xs text-slate-500">
            Origination volume, funder approval percentages, asset distribution, and pipeline velocities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="q1_2026">Q1 2026 (Jan - Mar)</option>
            <option value="q4_2025">Q4 2025 (Oct - Dec)</option>
            <option value="fy_2025">Full Year 2025</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Originated Volume YTD</span>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">£15,730,000</h3>
          <p className="mt-1 text-xs text-emerald-600 font-medium">+18.2% vs previous period</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Average Lender Acceptance</span>
          <h3 className="mt-2 text-2xl font-bold text-emerald-600">89.6%</h3>
          <p className="mt-1 text-xs text-slate-500">Across 5 integrated funders</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Average Deal Cycle</span>
          <h3 className="mt-2 text-2xl font-bold text-brand-600">4.8 Days</h3>
          <p className="mt-1 text-xs text-slate-500">From quotation creation to funder payout</p>
        </div>
      </div>

      {/* Monthly Trend Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Volume & Conversion Trend</h3>
            <p className="text-xs text-slate-500">Historical performance over last 6 calendar months</p>
          </div>
          <span className="text-xs text-slate-400">Values in GBP (£)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="p-3">Period</th>
                <th className="p-3">Originated Volume</th>
                <th className="p-3 text-center">Quotations</th>
                <th className="p-3 text-center">Proposals</th>
                <th className="p-3 text-center">Conversion Rate</th>
                <th className="p-3 text-right">Lender Acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{row.month}</td>
                  <td className="p-3 font-bold text-brand-700">{formatCurrency(row.volume)}</td>
                  <td className="p-3 text-center text-slate-700">{row.quotes}</td>
                  <td className="p-3 text-center text-slate-700">{row.proposals}</td>
                  <td className="p-3 text-center font-medium text-slate-800">
                    {Math.round((row.proposals / row.quotes) * 100)}%
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600">{row.approvedRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funder Panel Share */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-3">Funder Origination Share</h3>
        <div className="space-y-3">
          {lenderBreakdown.map((l, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900">{l.lender}</span>
                <span className="text-slate-600 font-medium">
                  {formatCurrency(l.volume)} ({l.percentage}%) • Avg SLA: {l.avgDecision}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${l.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
