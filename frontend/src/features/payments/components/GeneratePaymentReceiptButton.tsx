import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { PaymentDetail } from "@/features/payments/types/payment.types";
import { generatePaymentReceiptPdf } from "@/features/payments/utils/generatePaymentReceiptPdf";

interface GeneratePaymentReceiptButtonProps {
  payment: PaymentDetail;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function GeneratePaymentReceiptButton({
  payment,
  variant = "default",
  size = "default",
  className,
}: GeneratePaymentReceiptButtonProps) {
  const { user } = useAuth();

  const handleGenerate = () => {
    generatePaymentReceiptPdf(payment, {
      name: user?.company.name ?? "Company",
      code: user?.company.code,
    });
  };

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={handleGenerate}>
      <FileDown className="mr-2 h-4 w-4" />
      Generate PDF Receipt
    </Button>
  );
}
