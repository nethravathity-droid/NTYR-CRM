import { jsPDF } from "jspdf";
import type { PaymentDetail } from "@/features/payments/types/payment.types";
import {
  formatCurrency,
  PAYMENT_MODE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/features/payments/types/payment.types";

export interface PaymentReceiptCompanyInfo {
  name: string;
  code?: string;
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function addRow(doc: jsPDF, label: string, value: string, y: number, labelX = 20, valueX = 80): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(label, labelX, y);
  doc.setTextColor(30, 30, 30);
  doc.text(value, valueX, y);
  return y + 7;
}

export function generatePaymentReceiptPdf(
  payment: PaymentDetail,
  company: PaymentReceiptCompanyInfo,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 24;

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(company.name, margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const companyMeta = company.code ? `Company Code: ${company.code}` : "CRM";
  doc.text(companyMeta, margin, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PAYMENT RECEIPT", pageWidth - margin, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth - margin, 24, { align: "right" });

  y = 50;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Receipt Information", margin, y);
  y += 8;

  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const receiptNo = payment.receiptNumber ?? payment.paymentNumber;
  y = addRow(doc, "Receipt No.", receiptNo, y);
  y = addRow(doc, "Payment No.", payment.paymentNumber, y);
  y = addRow(doc, "Payment Date", formatDisplayDate(payment.paymentDate), y);
  y = addRow(doc, "Due Date", formatDisplayDate(payment.dueDate), y);
  y = addRow(doc, "Status", PAYMENT_STATUS_LABELS[payment.status], y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Customer & Property", margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  y = addRow(doc, "Customer", payment.customerName, y);
  y = addRow(doc, "Booking No.", payment.booking.bookingNumber, y);
  y = addRow(doc, "Project", `${payment.project.projectName} (${payment.project.projectCode})`, y);
  y = addRow(doc, "Unit", payment.unit.unitNumber, y);
  y = addRow(doc, "Payment Type", PAYMENT_TYPE_LABELS[payment.paymentType], y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Amount Details", margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y - 6, pageWidth - margin * 2, 22, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Amount Received", margin + 6, y + 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text(formatCurrency(payment.amount), margin + 6, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Outstanding", pageWidth - margin - 6, y + 2, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(formatCurrency(payment.dueAmount), pageWidth - margin - 6, y + 12, { align: "right" });

  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Transaction Details", margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  y = addRow(
    doc,
    "Payment Mode",
    payment.paymentMode ? PAYMENT_MODE_LABELS[payment.paymentMode] : "—",
    y,
  );
  y = addRow(doc, "Transaction Ref.", payment.transactionReference ?? "—", y);
  y = addRow(doc, "Bank", payment.bankName ?? "—", y);

  if (payment.notes?.trim()) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Notes", margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const noteLines = doc.splitTextToSize(payment.notes.trim(), pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5;
  }

  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("This is a computer-generated receipt and does not require a signature.", margin, footerY);
  doc.text(`${company.name} — Payment Receipt`, pageWidth - margin, footerY, { align: "right" });

  const safeName = payment.paymentNumber.replace(/[^\w-]+/g, "_");
  doc.save(`payment-receipt-${safeName}.pdf`);
}
