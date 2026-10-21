import React from 'react';
import { QuotationStatus, ProposalStatus } from '../../types';

interface StatusBadgeProps {
  status: QuotationStatus | ProposalStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';
  let label = status;

  switch (status) {
    // Quotation statuses
    case 'draft':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      dot = 'bg-slate-400';
      label = 'Draft';
      break;
    case 'saved':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      dot = 'bg-blue-500';
      label = 'Saved Quotation';
      break;
    case 'converted':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      dot = 'bg-purple-500';
      label = 'Converted to Proposal';
      break;
    case 'expired':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      label = 'Expired';
      break;

    // Proposal statuses
    case 'incomplete':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      dot = 'bg-amber-500';
      label = 'Incomplete';
      break;
    case 'ready_to_submit':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dot = 'bg-indigo-500';
      label = 'Ready to Submit';
      break;
    case 'submitted':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      dot = 'bg-sky-500 animate-pulse';
      label = 'Submitted';
      break;
    case 'under_review':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      dot = 'bg-amber-500 animate-ping';
      label = 'Under Review';
      break;
    case 'approved':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      label = 'Approved';
      break;
    case 'rejected':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      label = 'Rejected';
      break;
    case 'withdrawn':
      bg = 'bg-slate-100 text-slate-600 border-slate-200';
      dot = 'bg-slate-400';
      label = 'Withdrawn';
      break;
    case 'submission_failed':
      bg = 'bg-rose-100 text-rose-800 border-rose-300';
      dot = 'bg-rose-600';
      label = 'Submission Failed';
      break;
    
    // Generic
    case 'active':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      label = 'Active';
      break;
    case 'connected':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      label = 'Connected';
      break;
    case 'demo_active':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      dot = 'bg-blue-500';
      label = 'Demo Active';
      break;
    default:
      label = status.replace(/_/g, ' ');
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses} capitalize transition-colors`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
};
