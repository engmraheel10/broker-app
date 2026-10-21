import React from 'react';
import { FinancialCalculationResult, FinanceDetails } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/calculations';
import { Calculator, Info, ShieldCheck } from 'lucide-react';

interface FinancialSummaryCardProps {
  summary: FinancialCalculationResult;
  financeDetails: FinanceDetails;
  showRepaymentBreakdown?: boolean;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  summary,
  financeDetails,
  showRepaymentBreakdown = true,
}) => {
  const frequencyLabel = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annually: 'Annual',
  }[financeDetails.paymentFrequency];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-brand-50 p-1.5 text-brand-600">
            <Calculator className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Financial Summary</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          <Info className="h-3 w-3" />
          Live Calculation
        </span>
      </div>

      <div className="mt-4 space-y-2.5 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Asset Subtotal:</span>
          <span className="font-medium text-slate-900">{formatCurrency(summary.assetSubtotal)}</span>
        </div>

        {summary.additionalCosts > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Additional Costs (Delivery/Ops):</span>
            <span className="font-medium text-slate-900">{formatCurrency(summary.additionalCosts)}</span>
          </div>
        )}

        {summary.discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Dealer Discount:</span>
            <span className="font-medium">-{formatCurrency(summary.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>VAT Rate ({formatPercent(summary.vatRate * 100)}):</span>
          <span className="font-medium text-slate-900">{formatCurrency(summary.vatAmount)}</span>
        </div>

        <div className="flex justify-between border-t border-slate-100 pt-2 font-medium text-slate-800">
          <span>Total Cost (inc. VAT):</span>
          <span className="text-slate-900">{formatCurrency(summary.totalCostIncVAT)}</span>
        </div>

        <div className="flex justify-between text-amber-700">
          <span>Less Deposit / Advance:</span>
          <span className="font-semibold">-{formatCurrency(summary.depositAmount)}</span>
        </div>

        <div className="flex justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-200/70">
          <span className="font-semibold text-slate-800">Finance Amount Requested:</span>
          <span className="text-sm font-bold text-brand-700">{formatCurrency(summary.financeAmount)}</span>
        </div>
      </div>

      {showRepaymentBreakdown && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Repayment Terms ({financeDetails.termMonths} Months)
          </h4>
          <div className="mt-3 rounded-lg bg-brand-50/70 p-3.5 border border-brand-100">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-brand-900">
                Est. {frequencyLabel} Repayment:
              </span>
              <span className="text-lg font-bold text-brand-700">
                {formatCurrency(summary.estimatedRepayment)}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-brand-700/80">
              <span>Rate: {formatPercent(financeDetails.interestRate)} APR/Flat</span>
              <span>Freq: {frequencyLabel}</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
            {financeDetails.balloonPayment > 0 && (
              <div className="flex justify-between">
                <span>Final Balloon / Residual:</span>
                <span className="font-medium text-slate-700">{formatCurrency(financeDetails.balloonPayment)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Total Amount Repayable:</span>
              <span className="font-medium text-slate-700">{formatCurrency(summary.totalRepayable)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Total Interest:</span>
              <span className="font-medium text-slate-700">{formatCurrency(summary.totalInterest)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Calculation Notice */}
      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-tight">
          <strong>Demonstration Calculation:</strong> Figures shown are illustrative and subject to formal credit underwriting and lender documentation fees.
        </p>
      </div>
    </div>
  );
};
