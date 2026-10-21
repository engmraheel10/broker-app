import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/calculations';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
  FileSpreadsheet,
  FileText,
  UserCheck
} from 'lucide-react';

export const AuditHistoryPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">System Audit & Compliance Log</h1>
          <p className="text-xs text-slate-500">
            Immutable trace of user actions, proposal submissions, underwriting decisions, and status mutations
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, reference, IP, or change description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Filter Event:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Audit Events</option>
            <option value="CREATE">Create Events</option>
            <option value="SUBMIT">Submissions</option>
            <option value="UPDATE">Modifications</option>
            <option value="DECISION">Lender Decisions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor / User</th>
                <th className="py-3 px-4 font-semibold">Action Type</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Change Description</th>
                <th className="py-3 px-4 font-semibold text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{log.user}</span>
                    <span className="ml-1 text-[10px] text-slate-400">({log.role})</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-brand-600">{log.entityReference}</span>
                    <span className="ml-1 text-[10px] text-slate-400">({log.entityType})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-md">{log.details}</td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
