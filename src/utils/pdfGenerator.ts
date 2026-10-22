import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatPercent, formatDate, AmortizationRow } from './calculations';

export interface PDFQuotationData {
  reference: string;
  title: string;
  dealerName?: string;
  userName?: string;
  userRole?: string;
  assetCategoryType: 'hard' | 'soft';
  assetQuantity: number;
  assetCost: number;
  vatTreatment: 'financed' | 'upfront' | 'zero';
  vatAmount: number;
  vatRate: number;
  totalCostIncVAT: number;
  financeType: string;
  deposit: number;
  loanAmount: number;
  termMonths: number;
  interestRate: number;
  paymentFrequency: string;
  balloonPayment: number;
  documentationFee: number;
  optionToPurchaseFee: number;
  estimatedRepayment: number;
  totalInterest: number;
  totalRepayable: number;
  createdAt?: string;
  validUntil?: string;
}

export function exportQuotationRepaymentPDF(
  data: PDFQuotationData,
  schedule: AmortizationRow[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate-900 / Navy
  const brandBlue = [37, 99, 235]; // Brand-600
  const lightBg = [248, 250, 252]; // Slate-50
  const textMuted = [100, 116, 139]; // Slate-500

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 26, 'F');

  // Decorative blue stripe
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 26, 210, 1.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CAPITAS COMMERCIAL FINANCE', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Broker & Dealer Asset Finance Platform — Official Quotation & Repayment Plan', 14, 18);

  // Reference & Date badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(data.reference, 196, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${formatDate(data.createdAt || new Date().toISOString())}`, 196, 18, { align: 'right' });

  // Summary Metadata
  let y = 35;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Financial Quotation Summary', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued for: ${data.dealerName || 'Direct Dealer / Broker Client'}   •   Prepared by: ${data.userName || 'Account Executive'} (${data.userRole || 'Dealer Admin'})`, 14, y);

  y += 7;

  // Executive Summary Table
  const financeTypeLabel = data.financeType.replace(/_/g, ' ').toUpperCase();
  const summaryRows = [
    [
      'Asset Description',
      data.title || 'Commercial Asset',
      'Loan Product Type',
      financeTypeLabel,
    ],
    [
      'Asset Classification',
      `${data.assetCategoryType === 'hard' ? 'Hard Asset (Machinery / Vehicles)' : 'Soft Asset (Software / Tech)'} (Qty: ${data.assetQuantity})`,
      'Loan Period / Term',
      `${data.termMonths} Months (${(data.termMonths / 12).toFixed(1)} Years)`,
    ],
    [
      'Net Asset Cost',
      formatCurrency(data.assetCost),
      'Annual Interest Rate',
      formatPercent(data.interestRate),
    ],
    [
      'VAT Treatment',
      `${data.vatTreatment === 'financed' ? '20% Financed' : data.vatTreatment === 'upfront' ? '20% Upfront' : '0% Exempt'} (${formatCurrency(data.vatAmount)})`,
      'Payment Frequency',
      data.paymentFrequency.toUpperCase(),
    ],
    [
      'Customer Deposit',
      formatCurrency(data.deposit),
      'Monthly Installment',
      formatCurrency(data.estimatedRepayment),
    ],
    [
      'Net Capital Financed',
      formatCurrency(data.loanAmount),
      'Total Interest Payable',
      formatCurrency(data.totalInterest),
    ],
    [
      'Residual / Balloon',
      formatCurrency(data.balloonPayment),
      'Total Amount Repayable',
      formatCurrency(data.totalRepayable),
    ],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [71, 85, 105], cellWidth: 38 },
      1: { cellWidth: 57 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [71, 85, 105], cellWidth: 42 },
      3: { fontStyle: 'bold', textColor: [30, 41, 59], cellWidth: 45 },
    },
    margin: { left: 14, right: 14 },
  });

  // Schedule Table Header
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTable = (doc as any).lastAutoTable;
  y = lastTable ? lastTable.finalY + 8 : y + 55;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Monthly Repayment Plan & Amortization Schedule', 14, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Full month-by-month schedule of capital principal, interest components, and remaining loan balance.', 14, y);

  y += 4;

  const tableData = schedule.map((row) => [
    row.periodLabel,
    formatCurrency(row.payment),
    formatCurrency(row.principal),
    formatCurrency(row.interest),
    formatCurrency(row.remainingBalance),
    row.notes || 'Standard repayment',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Period', 'Payment Due', 'Principal', 'Interest', 'Remaining Balance', 'Notes & Milestones']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold' },
      1: { cellWidth: 26, fontStyle: 'bold', halign: 'right' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 28, fontStyle: 'bold', halign: 'right' },
      5: { cellWidth: 42, textColor: [100, 116, 139] },
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (dataHook) => {
      // Add page footer
      const totalPages = doc.getNumberOfPages();
      const currentPage = dataHook.pageNumber;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      // Footer top border
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 285, 196, 285);

      doc.text(
        'Capitas Asset Finance • Confidential • For illustrative commercial quotation purposes only • Subject to lender credit approval',
        14,
        290
      );
      doc.text(`Page ${currentPage} of ${totalPages}`, 196, 290, { align: 'right' });
    },
  });

  // Save the PDF
  const filename = `${data.reference || 'Quotation'}_Repayment_Schedule.pdf`;
  doc.save(filename);
}
