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

export interface AmortizationRow {
  month: number;
  periodLabel: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  notes?: string;
}

export function generateAmortizationSchedule(
  principalAmount: number,
  annualInterestRate: number,
  termMonths: number,
  balloonPayment = 0,
  documentationFee = 0,
  optionToPurchaseFee = 0
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const n = Math.max(1, Math.round(termMonths));
  const r = (annualInterestRate / 100) / 12;
  const pv = Math.max(0, principalAmount);
  const fv = Math.max(0, balloonPayment);

  let pmt = 0;
  if (r === 0) {
    pmt = (pv - fv) / n;
  } else {
    const factor = Math.pow(1 + r, -n);
    pmt = (pv - fv * factor) * (r / (1 - factor));
  }
  pmt = Math.round(pmt * 100) / 100;

  let balance = pv;
  const now = new Date();

  for (let m = 1; m <= n; m++) {
    const interest = Math.round(balance * r * 100) / 100;
    let principal = Math.round((pmt - interest) * 100) / 100;
    
    if (m === n) {
      principal = Math.round((balance - fv) * 100) / 100;
      balance = fv;
    } else {
      balance = Math.max(0, Math.round((balance - principal) * 100) / 100);
    }

    const paymentDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const monthName = paymentDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

    let notes = 'Standard monthly repayment';
    let totalMonthPayment = pmt;

    if (m === 1 && documentationFee > 0) {
      notes = `Includes £${documentationFee.toLocaleString()} documentation fee`;
      totalMonthPayment += documentationFee;
    }

    if (m === n) {
      if (fv > 0 && optionToPurchaseFee > 0) {
        notes = `Final payment + £${fv.toLocaleString()} balloon & £${optionToPurchaseFee.toLocaleString()} option fee`;
        totalMonthPayment += fv + optionToPurchaseFee;
      } else if (fv > 0) {
        notes = `Final payment + £${fv.toLocaleString()} balloon residual`;
        totalMonthPayment += fv;
      } else if (optionToPurchaseFee > 0) {
        notes = `Final payment + £${optionToPurchaseFee.toLocaleString()} option to purchase fee`;
        totalMonthPayment += optionToPurchaseFee;
      } else {
        notes = 'Final completion payment';
      }
    }

    schedule.push({
      month: m,
      periodLabel: `Month ${m} (${monthName})`,
      payment: Math.round(totalMonthPayment * 100) / 100,
      principal: Math.max(0, principal),
      interest: Math.max(0, interest),
      remainingBalance: Math.max(0, balance),
      notes,
    });
  }

  return schedule;
}

export interface QuoteCalculationInput {
  assetCost: number;
  serviceAddOn: number;
  nonVatableAmount: number;
  vatTreatment: 'upfront' | 'deferred';
  customVatAmount?: number;
  depositValue: number;
  depositType: 'amount' | 'percentage';
  subsidy: number;
  commissionValue: number;
  commissionType: 'amount' | 'percentage';
  rate: number;
  rateType: 'Nominal Rate' | 'Flat Rate' | 'Effective Rate';
  advancePayments: number;
  regularPayments: number;
  balloonValue: number;
  balloonType: 'amount' | 'percentage';
  balloonCollection: string;
  documentFee: number;
  otpFee: number;
  annualAdminFee: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annually';
  paymentMode: 'Arrear' | 'Advance';
}

export interface QuoteCalculationOutput {
  vatableAmount: number;
  vatAmount: number;
  depositAmount: number;
  balloonAmount: number;
  financeAmount: number;
  commissionAmount: number;
  periodicPayment: number;
  advanceRentals: number;
  upfrontPayment: number;
  grossProfit: number;
  grossYield: number;
  netYield: number;
  apr: number;
  flatRateExclComm: number;
  flatRateInclComm: number;
  totalInterest: number;
  totalRepayable: number;
}

export function calculateQuoteBreakdown(input: QuoteCalculationInput): QuoteCalculationOutput {
  const vatableAmount = Math.max(0, (Number(input.assetCost) || 0) - (Number(input.nonVatableAmount) || 0));
  const defaultVat = Math.round(vatableAmount * 0.20 * 100) / 100;
  const vatAmount = input.customVatAmount !== undefined && input.customVatAmount !== null
    ? Number(input.customVatAmount)
    : defaultVat;

  const assetCost = Number(input.assetCost) || 0;
  const depositVal = Number(input.depositValue) || 0;
  const depositAmount = input.depositType === 'percentage'
    ? Math.round((assetCost * (depositVal / 100)) * 100) / 100
    : depositVal;

  const balloonVal = Number(input.balloonValue) || 0;
  const balloonAmount = input.balloonType === 'percentage'
    ? Math.round((assetCost * (balloonVal / 100)) * 100) / 100
    : balloonVal;

  const serviceAddOn = Number(input.serviceAddOn) || 0;
  const subsidy = Number(input.subsidy) || 0;

  // Finance Amount
  const baseFinanced = assetCost + serviceAddOn + (input.vatTreatment === 'deferred' ? vatAmount : 0);
  const financeAmount = Math.max(0, Math.round((baseFinanced - depositAmount - subsidy) * 100) / 100);

  // Commission Amount
  const commissionVal = Number(input.commissionValue) || 0;
  const commissionAmount = input.commissionType === 'percentage'
    ? Math.round((financeAmount * (commissionVal / 100)) * 100) / 100
    : commissionVal;

  // Term & Rate
  const n = Math.max(1, Math.round(Number(input.regularPayments) || 12));
  const freqMultiplier = input.paymentFrequency === 'quarterly' ? 3 : input.paymentFrequency === 'annually' ? 12 : 1;
  const termYears = (n * freqMultiplier) / 12;
  const annualRate = (Number(input.rate) || 0) / 100;

  let periodicPayment = 0;
  let totalInterest = 0;

  if (input.rateType === 'Flat Rate') {
    totalInterest = Math.round(financeAmount * annualRate * termYears * 100) / 100;
    const totalToAmortize = financeAmount + totalInterest - balloonAmount;
    periodicPayment = Math.max(0, Math.round((totalToAmortize / n) * 100) / 100);
  } else {
    // Nominal Rate standard PMT
    const periodicRate = annualRate * (freqMultiplier / 12);
    if (periodicRate === 0) {
      periodicPayment = Math.max(0, Math.round(((financeAmount - balloonAmount) / n) * 100) / 100);
    } else {
      const factor = Math.pow(1 + periodicRate, -n);
      let pmt = (financeAmount - balloonAmount * factor) * (periodicRate / (1 - factor));
      if (input.paymentMode === 'Advance') {
        pmt = pmt / (1 + periodicRate);
      }
      periodicPayment = Math.max(0, Math.round(pmt * 100) / 100);
    }
    const totalPayments = periodicPayment * n;
    totalInterest = Math.max(0, Math.round((totalPayments + balloonAmount - financeAmount) * 100) / 100);
  }

  // Upfront Payment
  const advanceCount = Math.max(0, Number(input.advancePayments) || 0);
  const advanceRentals = Math.round(advanceCount * periodicPayment * 100) / 100;
  const upfrontVat = input.vatTreatment === 'upfront' ? vatAmount : 0;
  const upfrontPayment = Math.round((advanceRentals + depositAmount + serviceAddOn + upfrontVat) * 100) / 100;

  // Gross Profit
  const grossProfit = Math.round(commissionAmount * 100) / 100;

  // Rates Metrics
  const grossYield = termYears > 0 && financeAmount > 0
    ? Math.round(((totalInterest / (financeAmount * termYears)) * 100) * 100) / 100
    : 0;

  const netYield = termYears > 0 && financeAmount > 0
    ? Math.max(0, Math.round((((totalInterest - commissionAmount) / (financeAmount * termYears)) * 100) * 100) / 100)
    : 0;

  const flatRateExclComm = grossYield;
  const flatRateInclComm = termYears > 0 && financeAmount > 0
    ? Math.round((((totalInterest + commissionAmount) / (financeAmount * termYears)) * 100) * 100) / 100
    : 0;

  // APR calculation
  const totalFees = (Number(input.documentFee) || 0) + (Number(input.otpFee) || 0) + ((Number(input.annualAdminFee) || 0) * termYears);
  const feeImpact = termYears > 0 && financeAmount > 0 ? (totalFees / (financeAmount * termYears)) * 100 : 0;
  const nominalAprComp = annualRate > 0 ? (Math.pow(1 + annualRate / 12, 12) - 1) * 100 : 0;
  const apr = Math.round((nominalAprComp + feeImpact) * 100) / 100;

  const docFee = Number(input.documentFee) || 0;
  const otpFee = Number(input.otpFee) || 0;
  const adminTotal = (Number(input.annualAdminFee) || 0) * termYears;
  const totalRepayable = Math.round(((n * periodicPayment) + depositAmount + balloonAmount + docFee + otpFee + adminTotal) * 100) / 100;

  return {
    vatableAmount,
    vatAmount,
    depositAmount,
    balloonAmount,
    financeAmount,
    commissionAmount,
    periodicPayment,
    advanceRentals,
    upfrontPayment,
    grossProfit,
    grossYield,
    netYield,
    apr,
    flatRateExclComm,
    flatRateInclComm,
    totalInterest,
    totalRepayable,
  };
}
