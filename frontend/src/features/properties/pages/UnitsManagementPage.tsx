import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { UnitForm, unitDefaultValues } from "@/features/properties/components/UnitForm";
import { useCreateUnit, useDeleteUnit, useProject, useUnits } from "@/features/properties/hooks/useProperties";
import { UNIT_AVAILABILITY_LABELS, type UnitAvailability } from "@/features/properties/types/property.types";
import { paths } from "@/routes/paths";

export function UnitsManagementPage() {
  const { uuid } = useParams<{ uuid?: string }>();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<UnitAvailability | "">("");
  const [showForm, setShowForm] = useState(false);
  const { data: project } = useProject(uuid ?? "");
  const params = useMemo(() => ({ page, limit: 10, search: search || undefined, projectId: project?.id, availability: availability || undefined }), [page, search, project?.id, availability]);
  const { data, isLoading } = useUnits(params);
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Boxes} tone="emerald" title="Unit Management" description="Create and track inventory units across projects." action={<div className="flex gap-2"><Button variant="outline" asChild><Link to={paths.projects.inventory}>Inventory Dashboard</Link></Button><Button onClick={() => setShowForm((value) => !value)}>{showForm ? "Hide Form" : "Add Unit"}</Button></div>} />
      {showForm ? <UnitForm defaultValues={{ ...unitDefaultValues, projectId: project?.id ?? 0 }} submitLabel="Create Unit" isSubmitting={createUnit.isPending} onSubmit={async (values) => { await createUnit.mutateAsync(values); setShowForm(false); }} /> : null}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row"><Input placeholder="Search units" value={search} onChange={(e) => setSearch(e.target.value)} /><Select value={availability} onChange={(e) => setAvailability(e.target.value as UnitAvailability | "")}><option value="">All availability</option>{Object.entries(UNIT_AVAILABILITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>
      {isLoading ? <Loading label="Loading units..." /> : null}
      <div className="space-y-4">{data?.units.map((unit) => (
        <Card key={unit.uuid}><CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between"><div><h3 className="font-semibold">{unit.unitNumber}</h3><p className="text-sm text-muted-foreground">{unit.projectName} • {unit.towerName ?? "No tower"} • Floor {unit.floorNumber ?? "—"}</p><p className="text-sm text-muted-foreground">{unit.bhkType ?? "—"} • {UNIT_AVAILABILITY_LABELS[unit.availability]} • ₹{unit.price ?? 0}</p></div><Button variant="destructive" onClick={() => deleteUnit.mutate(unit.uuid)}>Delete</Button></CardContent></Card>
      ))}</div>
    </div>
  );
}
