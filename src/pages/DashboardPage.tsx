import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { calculateFinance, formatCurrency, formatDate } from '../utils/calculations';
import {
  FileSpreadsheet,
  FileText,
  Clock,
  Send,
  CheckCircle,
  Truck,
  Coins,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  ChevronRight,
  Building2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { quotations, proposals, auditLogs, currentUser } = useApp();
  const navigate = useNavigate();

  // Metrics calculations
  const totalQuotationsCount = quotations.length;
  const draftQuotationsCount = quotations.filter(q => q.status === 'draft').length;
  const totalProposalsCount = proposals.length;
  const pendingSubmissionsCount = proposals.filter(
    p => p.status === 'ready_to_submit' || p.status === 'draft' || p.status === 'incomplete'
  ).length;
  const submittedProposalsCount = proposals.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
  const approvedProposalsCount = proposals.filter(p => p.status === 'approved').length;

  const totalAssetValue = proposals.reduce((sum, p) => {
    const calc = calculateFinance(p.assets, p.financeDetails);
    return sum + calc.totalCostIncVAT;
  }, 0);

  const totalFinanceRequested = proposals.reduce((sum, p) => {
    const calc = calculateFinance(p.assets, p.financeDetails);
    return sum + calc.financeAmount;
  }, 0);

  // Status distributions
  const proposalStatusCounts = {
    Approved: proposals.filter(p => p.status === 'approved').length,
    'Under Review': proposals.filter(p => p.status === 'under_review').length,
    Submitted: proposals.filter(p => p.status === 'submitted').length,
    'Ready / Draft': pendingSubmissionsCount,
    Rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  const recentQuotations = quotations.slice(0, 5);
  const recentProposals = proposals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentUser.name}
            </h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              {currentUser.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {currentUser.organization} • Operational Overview & Pipeline Summary
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/quotations/new')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 text-slate-500" />
            Create Quotation
          </button>
          <button
            onClick={() => navigate('/proposals/new')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Start Proposal Wizard
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Quotations"
          value={totalQuotationsCount}
          subtitle={`${draftQuotationsCount} active drafts`}
          icon={FileSpreadsheet}
          accentColor="blue"
          trend={{ value: '+14.2%', isPositive: true }}
          onClick={() => navigate('/quotations')}
        />
        <MetricCard
          title="Active Proposals"
          value={totalProposalsCount}
          subtitle={`${pendingSubmissionsCount} pending submission`}
          icon={FileText}
          accentColor="purple"
          trend={{ value: '+8.5%', isPositive: true }}
          onClick={() => navigate('/proposals')}
        />
        <MetricCard
          title="Submitted / In Review"
          value={submittedProposalsCount}
          subtitle="Currently with lenders"
          icon={Send}
          accentColor="amber"
          onClick={() => navigate('/proposals')}
        />
        <MetricCard
          title="Approved Facilities"
          value={approvedProposalsCount}
          subtitle="Ready for payout & docs"
          icon={CheckCircle}
          accentColor="emerald"
          trend={{ value: '+22.0%', isPositive: true }}
          onClick={() => navigate('/proposals')}
        />
        <MetricCard
          title="Total Asset Value"
          value={formatCurrency(totalAssetValue)}
          subtitle="Aggregate machinery value"
          icon={Truck}
          accentColor="slate"
        />
        <MetricCard
          title="Finance Requested"
          value={formatCurrency(totalFinanceRequested)}
          subtitle="Net capital proposed"
          icon={Coins}
          accentColor="blue"
          trend={{ value: '+18.4%', isPositive: true }}
        />
        <MetricCard
          title="Approval Rate (Avg)"
          value="89.6%"
          subtitle="Across panel lenders"
          icon={TrendingUp}
          accentColor="emerald"
          trend={{ value: '+3.1%', isPositive: true }}
          onClick={() => navigate('/reports')}
        />
        <MetricCard
          title="Pending Submissions"
          value={pendingSubmissionsCount}
          subtitle="Awaiting final documents"
          icon={Clock}
          accentColor="amber"
          onClick={() => navigate('/proposals')}
        />
      </div>

      {/* Charts & Analytical Funnel Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quotation to Proposal Conversion Funnel */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Pipeline Progression & Conversion Funnel
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Current Q1 Performance</span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  1. Quotations Generated ({totalQuotationsCount})
                </span>
                <span className="font-semibold text-slate-900">100% Volume</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  2. Converted to Proposal ({totalProposalsCount})
                </span>
                <span className="font-semibold text-slate-900">
                  {Math.round((totalProposalsCount / Math.max(1, totalQuotationsCount)) * 100)}% Conversion
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalProposalsCount / Math.max(1, totalQuotationsCount)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  3. Transmitted to Lenders ({submittedProposalsCount + approvedProposalsCount})
                </span>
                <span className="font-semibold text-slate-900">
                  {Math.round(((submittedProposalsCount + approvedProposalsCount) / Math.max(1, totalProposalsCount)) * 100)}% Submission Rate
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((submittedProposalsCount + approvedProposalsCount) / Math.max(1, totalProposalsCount)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  4. Approved Facilities ({approvedProposalsCount})
                </span>
                <span className="font-semibold text-emerald-700">
                  {Math.round((approvedProposalsCount / Math.max(1, totalProposalsCount)) * 100)}% Lender Approval
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (approvedProposalsCount / Math.max(1, totalProposalsCount)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Avg Quotation Value</p>
              <p className="mt-1 text-sm font-bold text-slate-900">£184,200</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Avg Underwrite Time</p>
              <p className="mt-1 text-sm font-bold text-slate-900">6.4 Hours</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Lender Acceptance</p>
              <p className="mt-1 text-sm font-bold text-emerald-600">89.6%</p>
            </div>
          </div>
        </div>

        {/* Proposal Status Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-slate-900">Status Distribution</h3>
              </div>
              <span className="text-[11px] text-slate-400">{totalProposalsCount} Active</span>
            </div>

            <div className="mt-4 space-y-3">
              {Object.entries(proposalStatusCounts).map(([statusName, count]) => {
                const percentage = Math.round((count / Math.max(1, totalProposalsCount)) * 100);
                return (
                  <div key={statusName} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{statusName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{count}</span>
                      <span className="w-12 text-right text-[11px] text-slate-400">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Connected Lenders</span>
              <span className="font-semibold text-brand-700">Investec, Lombard, Aldermore +3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Quotations & Recent Proposals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Quotations */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Quotations</h3>
              <p className="text-xs text-slate-500">Latest customer finance quotes</p>
            </div>
            <button
              onClick={() => navigate('/quotations')}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All ({quotations.length})
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Ref</th>
                  <th className="py-2.5 px-3 font-medium">Customer</th>
                  <th className="py-2.5 px-3 font-medium">Finance Amount</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuotations.map((q) => {
                  const calc = calculateFinance(q.assets, q.financeDetails);
                  return (
                    <tr
                      key={q.id}
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-brand-600">{q.reference}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{q.customerName}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{formatCurrency(calc.financeAmount)}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={q.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{formatDate(q.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Proposals</h3>
              <p className="text-xs text-slate-500">Lender credit applications</p>
            </div>
            <button
              onClick={() => navigate('/proposals')}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All ({proposals.length})
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Ref</th>
                  <th className="py-2.5 px-3 font-medium">Customer</th>
                  <th className="py-2.5 px-3 font-medium">Lender</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProposals.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/proposals/${p.id}`)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-brand-600">{p.reference}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{p.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.lenderName}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operational Activity Stream */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900">Recent Platform Operations & Audit Activity</h3>
          </div>
          <button
            onClick={() => navigate('/audit')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Audit Log
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-slate-100 p-1 text-slate-500">
                  <ArrowRight className="h-3 w-3" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.user}</span>
                    <span className="text-[10px] text-slate-400">({log.role})</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                      {log.action}
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-600">{log.details}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatDate(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
