import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { InvoiceDetail } from "@/features/invoices/types/invoice.types";
import { generateInvoicePdf } from "@/features/invoices/utils/generateInvoicePdf";

interface GenerateInvoicePdfButtonProps {
  invoice: InvoiceDetail;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function GenerateInvoicePdfButton({
  invoice,
  variant = "default",
  size = "default",
  className,
}: GenerateInvoicePdfButtonProps) {
  const { user } = useAuth();

  const handleGenerate = () => {
    generateInvoicePdf(invoice, {
      name: user?.company.name ?? "Company",
      code: user?.company.code,
    });
  };

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={handleGenerate}>
      <FileDown className="mr-2 h-4 w-4" />
      Generate PDF Invoice
    </Button>
  );
}
