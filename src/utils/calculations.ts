import { AssetLineItem, FinanceDetails, FinancialCalculationResult } from '../types';

export function calculateFinance(
  assets: AssetLineItem[],
  finance: FinanceDetails,
  vatRate = 0.20,
  discount = 0
): FinancialCalculationResult {
  const assetSubtotal = assets.reduce(
    (sum, a) => sum + (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0),
    0
  );

  const additionalCosts = assets.reduce(
    (sum, a) => sum + (Number(a.additionalCosts) || 0),
    0
  );

  const netAssetCost = Math.max(0, assetSubtotal + additionalCosts - discount);
  const vatAmount = Math.round(netAssetCost * vatRate * 100) / 100;
  const totalCostIncVAT = netAssetCost + vatAmount;

  // Deposit calculation
  let depositAmount = Number(finance.deposit) || 0;
  if (finance.depositType === 'percentage') {
    depositAmount = Math.round((totalCostIncVAT * (depositAmount / 100)) * 100) / 100;
  }

  // Finance Amount (Capital Borrowed)
  // In typical asset finance (e.g. Hire Purchase or Lease), finance amount is usually Net or Gross minus deposit
  // For standard commercial HP with full VAT upfront or financed:
  const financeAmount = Math.max(0, totalCostIncVAT - depositAmount);

  // Repayment Calculation (illustrative demo repayment formula)
  // Amortization with optional balloon payment
  const termMonths = Math.max(1, Number(finance.termMonths) || 12);
  const annualRate = (Number(finance.interestRate) || 0) / 100;
  const monthlyRate = annualRate / 12;
  const balloon = Number(finance.balloonPayment) || 0;

  let estimatedMonthly = 0;
  if (monthlyRate === 0) {
    estimatedMonthly = (financeAmount - balloon) / termMonths;
  } else {
    // PMT formula accounting for future balloon value
    // PV = P*(1 - (1+r)^-n)/r + FV*(1+r)^-n
    const pv = financeAmount;
    const fv = balloon;
    const r = monthlyRate;
    const n = termMonths;
    const factor = Math.pow(1 + r, -n);
    estimatedMonthly = (pv - fv * factor) * (r / (1 - factor));
  }

  // Adjust for payment frequency
  let repaymentMultiplier = 1;
  if (finance.paymentFrequency === 'quarterly') {
    repaymentMultiplier = 3;
  } else if (finance.paymentFrequency === 'annually') {
    repaymentMultiplier = 12;
  }

  const estimatedRepayment = Math.max(0, Math.round(estimatedMonthly * repaymentMultiplier * 100) / 100);
  const totalPayments = (termMonths / repaymentMultiplier) * estimatedRepayment;
  const docFee = Number(finance.documentationFee) || 0;
  const optionFee = Number(finance.optionToPurchaseFee) || 0;
  const totalRepayable = totalPayments + depositAmount + balloon + docFee + optionFee;
  const totalInterest = Math.max(0, totalRepayable - totalCostIncVAT);

  return {
    assetSubtotal,
    additionalCosts,
    discount,
    vatRate,
    vatAmount,
    totalCostIncVAT,
    depositAmount,
    financeAmount,
    estimatedRepayment,
    totalRepayable: Math.round(totalRepayable * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(rate: number | undefined | null): string {
  if (rate === undefined || rate === null || isNaN(rate)) return '0.00%';
  return `${Number(rate).toFixed(2)}%`;
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function generateRef(prefix: 'QT' | 'PR'): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-2026-${randomNum}`;
}
