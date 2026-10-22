import { jsPDF } from "jspdf";
import type { InvoiceDetail } from "@/features/invoices/types/invoice.types";

export interface InvoiceCompanyInfo {
  name: string;
  code?: string;
  address?: string;
  email?: string;
  phone?: string;
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateInvoicePdf(invoice: InvoiceDetail, company: InvoiceCompanyInfo): void {
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
  const companyMeta = [company.code, company.email, company.phone, company.address].filter(Boolean).join(" | ") || "CRM";
  doc.text(companyMeta, margin, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("INVOICE", pageWidth - margin, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth - margin, 24, { align: "right" });

  y = 50;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Invoice Information", margin, y);
  y += 8;

  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  y = addRow(doc, "Invoice No.", invoice.invoiceNumber, y);
  y = addRow(doc, "Status", invoice.status, y);
  y = addRow(doc, "Due Date", formatDisplayDate(invoice.dueDate), y);
  y = addRow(doc, "Project", invoice.project?.projectName ?? "—", y);
  y = addRow(doc, "Unit", invoice.unit?.unitNumber ?? "—", y);
  y = addRow(doc, "Booking", invoice.booking?.bookingNumber ?? "—", y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Bill To", margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  y = addRow(doc, "Customer", invoice.customerName, y);
  y = addRow(doc, "Email", invoice.customerEmail ?? "—", y);
  y = addRow(doc, "Phone", invoice.customerPhone ?? "—", y);
  if (invoice.customerAddress) {
    const lines = doc.splitTextToSize(invoice.customerAddress, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Line Items", margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Description", margin, y);
  doc.text("Qty", pageWidth - margin - 70, y, { align: "right" });
  doc.text("Rate", pageWidth - margin - 40, y, { align: "right" });
  doc.text("Amount", pageWidth - margin, y, { align: "right" });
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);

  for (const item of invoice.lineItems) {
    const lines = doc.splitTextToSize(item.description, pageWidth - margin * 2 - 80);
    doc.text(lines, margin, y);
    y += lines.length * 5;

    doc.text(String(item.quantity), pageWidth - margin - 70, y - 2, { align: "right" });
    doc.text(formatCurrency(item.rate), pageWidth - margin - 40, y - 2, { align: "right" });
    doc.text(formatCurrency(item.amount), pageWidth - margin, y - 2, { align: "right" });
    y += 6;
  }

  y += 4;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal", margin + 80, y, { align: "right" });
  doc.setTextColor(30, 30, 30);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, y, { align: "right" });
  y += 7;

  if (invoice.taxRate > 0) {
    doc.setTextColor(100, 100, 100);
    doc.text(`Tax (${invoice.taxRate}%)`, margin + 80, y, { align: "right" });
    doc.setTextColor(30, 30, 30);
    doc.text(formatCurrency(invoice.taxAmount), pageWidth - margin, y, { align: "right" });
    y += 7;
  }

  if (invoice.discount > 0) {
    doc.setTextColor(100, 100, 100);
    doc.text("Discount", margin + 80, y, { align: "right" });
    doc.setTextColor(30, 30, 30);
    doc.text(`- ${formatCurrency(invoice.discount)}`, pageWidth - margin, y, { align: "right" });
    y += 7;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text("Total", margin + 80, y, { align: "right" });
  doc.text(formatCurrency(invoice.total), pageWidth - margin, y, { align: "right" });
  y += 12;

  if (invoice.notes?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Notes", margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const noteLines = doc.splitTextToSize(invoice.notes.trim(), pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5;
  }

  if (invoice.terms?.trim()) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Terms & Conditions", margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const termLines = doc.splitTextToSize(invoice.terms.trim(), pageWidth - margin * 2);
    doc.text(termLines, margin, y);
    y += termLines.length * 5;
  }

  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("This is a computer-generated invoice and does not require a signature.", margin, footerY);
  doc.text(`${company.name} — Invoice`, pageWidth - margin, footerY, { align: "right" });

  const safeName = invoice.invoiceNumber.replace(/[^\w-]+/g, "_");
  doc.save(`invoice-${safeName}.pdf`);
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
