import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectFormValues, ProjectStatus } from "@/features/properties/types/property.types";

interface ProjectFormProps {
  defaultValues: ProjectFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ProjectFormValues, images: File[], brochure: File | null) => Promise<void> | void;
  onCancel?: () => void;
}

export function ProjectForm({ defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: ProjectFormProps) {
  const [values, setValues] = useState(defaultValues);
  const [images, setImages] = useState<File[]>([]);
  const [brochure, setBrochure] = useState<File | null>(null);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(values, images, brochure);
      }}
    >
      <Card>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Project Name *</Label><Input value={values.projectName} onChange={(e) => setValues({ ...values, projectName: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Project Code *</Label><Input value={values.projectCode} onChange={(e) => setValues({ ...values, projectCode: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Builder Name</Label><Input value={values.builderName} onChange={(e) => setValues({ ...values, builderName: e.target.value })} /></div>
          <div className="space-y-2"><Label>RERA Number</Label><Input value={values.reraNumber} onChange={(e) => setValues({ ...values, reraNumber: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={values.address} onChange={(e) => setValues({ ...values, address: e.target.value })} /></div>
          <div className="space-y-2"><Label>City</Label><Input value={values.city} onChange={(e) => setValues({ ...values, city: e.target.value })} /></div>
          <div className="space-y-2"><Label>State</Label><Input value={values.state} onChange={(e) => setValues({ ...values, state: e.target.value })} /></div>
          <div className="space-y-2"><Label>Status</Label><Select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as ProjectStatus })}><option value="UPCOMING">Upcoming</option><option value="ONGOING">Ongoing</option><option value="COMPLETED">Completed</option></Select></div>
          <div className="space-y-2 md:col-span-2"><Label>Amenities (comma separated)</Label><Input value={values.amenities} onChange={(e) => setValues({ ...values, amenities: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Media</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Project Images</Label><Input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files ?? []))} /></div>
          <div className="space-y-2"><Label>Brochure PDF</Label><Input type="file" accept=".pdf" onChange={(e) => setBrochure(e.target.files?.[0] ?? null)} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}

export const projectDefaultValues: ProjectFormValues = {
  projectName: "",
  projectCode: "",
  builderName: "",
  reraNumber: "",
  address: "",
  city: "",
  state: "",
  description: "",
  status: "UPCOMING",
  amenities: "",
};
