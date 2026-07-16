import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import { useBooking, useUploadBookingDocument } from "@/features/bookings/hooks/useBookings";
import {
  BOOKING_DOCUMENT_LABELS,
  REQUIRED_DOCUMENT_TYPES,
  type BookingDocumentType,
} from "@/features/bookings/types/booking.types";
import { env } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

const ALL_DOCUMENT_TYPES = Object.keys(BOOKING_DOCUMENT_LABELS) as BookingDocumentType[];

function resolveFileUrl(fileUrl: string): string {
  if (fileUrl.startsWith("http")) return fileUrl;
  return `${env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "")}${fileUrl}`;
}

export function BookingDocumentsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<BookingDocumentType>("AADHAAR");
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const { data: booking, isLoading } = useBooking(uuid ?? "");
  const uploadDocument = useUploadBookingDocument(uuid ?? "");

  const documentsByType = useMemo(() => {
    const map = new Map<BookingDocumentType, NonNullable<typeof booking>["documents"][number]>();
    for (const document of booking?.documents ?? []) {
      map.set(document.documentType, document);
    }
    return map;
  }, [booking?.documents]);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uuid) return;

    setActionError(null);
    setUploadMessage(null);

    try {
      await uploadDocument.mutateAsync({ documentType, file });
      setUploadMessage(`${BOOKING_DOCUMENT_LABELS[documentType]} uploaded successfully.`);
      event.target.value = "";
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  if (isLoading) return <Loading label="Loading booking documents..." />;
  if (!booking) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Booking not found.</p>
        <Button variant="outline" asChild><Link to={paths.bookings.list}>Back to Bookings</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={FileText}
        tone="amber"
        title="Booking Documents"
        description={`${booking.bookingNumber} — ${booking.customerName}`}
        action={
          <Button variant="outline" asChild>
            <Link to={paths.bookings.details(booking.uuid)}>Booking Details</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={documentType} onChange={(e) => setDocumentType(e.target.value as BookingDocumentType)}>
              {ALL_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{BOOKING_DOCUMENT_LABELS[type]}</option>
              ))}
            </Select>
          </div>
          <div>
            <input ref={fileInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileChange} />
            <Button onClick={handleSelectFile} disabled={uploadDocument.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {uploadDocument.isPending ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </CardContent>
        {actionError ? <CardContent className="pt-0 text-sm text-destructive">{actionError}</CardContent> : null}
        {uploadMessage ? <CardContent className="pt-0 text-sm text-emerald-600">{uploadMessage}</CardContent> : null}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>KYC & Booking Documents</CardTitle>
          <BookingStatusBadge status={booking.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          {ALL_DOCUMENT_TYPES.map((type) => {
            const document = documentsByType.get(type);
            const required = REQUIRED_DOCUMENT_TYPES.includes(type);

            return (
              <div key={type} className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">{BOOKING_DOCUMENT_LABELS[type]}</p>
                  <p className="text-sm text-muted-foreground">{required ? "Required" : "Optional"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {document ? (
                    <>
                      <span className="text-sm text-muted-foreground">{document.originalFileName}</span>
                      <Button variant="outline" asChild>
                        <a href={resolveFileUrl(document.fileUrl)} target="_blank" rel="noreferrer">View</a>
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not uploaded</span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
