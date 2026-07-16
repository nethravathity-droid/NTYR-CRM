import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyFormOptions } from "@/features/properties/hooks/useProperties";
import type { UnitAvailability, UnitFormValues } from "@/features/properties/types/property.types";

interface UnitFormProps {
  defaultValues: UnitFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: UnitFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function UnitForm({ defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: UnitFormProps) {
  const { data: options } = usePropertyFormOptions();
  const [values, setValues] = useState(defaultValues);

  const towers = useMemo(
    () => options?.towers.filter((tower) => tower.projectId === values.projectId) ?? [],
    [options?.towers, values.projectId],
  );

  const floors = useMemo(
    () => options?.floors.filter((floor) => floor.towerId === values.towerId) ?? [],
    [options?.floors, values.towerId],
  );

  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void onSubmit(values); }}>
      <Card>
        <CardHeader><CardTitle>Unit Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Project *</Label><Select value={values.projectId || ""} onChange={(e) => setValues({ ...values, projectId: Number(e.target.value), towerId: null, floorId: null })} required><option value="">Select project</option>{options?.projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></div>
          <div className="space-y-2"><Label>Unit Number *</Label><Input value={values.unitNumber} onChange={(e) => setValues({ ...values, unitNumber: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Tower</Label><Select value={values.towerId ?? ""} onChange={(e) => setValues({ ...values, towerId: e.target.value ? Number(e.target.value) : null, floorId: null })}><option value="">Select tower</option>{towers.map((tower) => <option key={tower.id} value={tower.id}>{tower.towerName}</option>)}</Select></div>
          <div className="space-y-2"><Label>Floor</Label><Select value={values.floorId ?? ""} onChange={(e) => setValues({ ...values, floorId: e.target.value ? Number(e.target.value) : null })}><option value="">Select floor</option>{floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.towerName} - Floor {floor.floorNumber}</option>)}</Select></div>
          <div className="space-y-2"><Label>BHK Type</Label><Select value={values.bhkType} onChange={(e) => setValues({ ...values, bhkType: e.target.value })}><option value="">Select BHK</option>{options?.bhkTypes.map((type) => <option key={type} value={type}>{type}</option>)}</Select></div>
          <div className="space-y-2"><Label>Facing</Label><Select value={values.facing} onChange={(e) => setValues({ ...values, facing: e.target.value })}><option value="">Select facing</option>{options?.facings.map((facing) => <option key={facing} value={facing}>{facing}</option>)}</Select></div>
          <div className="space-y-2"><Label>Super Built-up Area</Label><Input type="number" value={values.superBuiltUpArea} onChange={(e) => setValues({ ...values, superBuiltUpArea: e.target.value })} /></div>
          <div className="space-y-2"><Label>Carpet Area</Label><Input type="number" value={values.carpetArea} onChange={(e) => setValues({ ...values, carpetArea: e.target.value })} /></div>
          <div className="space-y-2"><Label>Price</Label><Input type="number" value={values.price} onChange={(e) => setValues({ ...values, price: e.target.value })} /></div>
          <div className="space-y-2"><Label>PLC Charges</Label><Input type="number" value={values.plcCharges} onChange={(e) => setValues({ ...values, plcCharges: e.target.value })} /></div>
          <div className="space-y-2"><Label>Availability</Label><Select value={values.availability} onChange={(e) => setValues({ ...values, availability: e.target.value as UnitAvailability })}>{options?.availabilities.map((status) => <option key={status} value={status}>{status}</option>)}</Select></div>
        </CardContent>
      </Card>
      <div className="flex gap-3"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>{onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}</div>
    </form>
  );
}

export const unitDefaultValues: UnitFormValues = {
  projectId: 0,
  towerId: null,
  floorId: null,
  unitNumber: "",
  bhkType: "",
  superBuiltUpArea: "",
  carpetArea: "",
  facing: "",
  price: "",
  plcCharges: "",
  availability: "AVAILABLE",
};
