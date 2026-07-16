import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useProject } from "@/features/properties/hooks/useProperties";
import { PROJECT_STATUS_LABELS, assetUrl } from "@/features/properties/types/property.types";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export function ProjectDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: project, isLoading } = useProject(uuid!);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Building2} tone="blue" title="Project Details" description="Review project profile, media, and inventory summary." action={project && hasPermission("projects.update") ? <Button onClick={() => navigate(paths.projects.edit(project.uuid))}>Edit Project</Button> : undefined} />
      {isLoading ? <Loading label="Loading project..." /> : null}
      {project ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>{project.projectName}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Code:</span> {project.projectCode}</p>
            <p><span className="font-medium text-foreground">Builder:</span> {project.builderName ?? "—"}</p>
            <p><span className="font-medium text-foreground">RERA:</span> {project.reraNumber ?? "—"}</p>
            <p><span className="font-medium text-foreground">Status:</span> {PROJECT_STATUS_LABELS[project.status]}</p>
            <p><span className="font-medium text-foreground">Location:</span> {[project.address, project.city, project.state].filter(Boolean).join(", ") || "—"}</p>
            <p><span className="font-medium text-foreground">Amenities:</span> {project.amenities.join(", ") || "—"}</p>
            <p><span className="font-medium text-foreground">Description:</span> {project.description ?? "—"}</p>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Inventory</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>Towers: {project.towerCount}</p><p>Units: {project.unitCount}</p><p>Available: {project.availableUnits}</p><div className="flex flex-wrap gap-2 pt-2"><Button variant="outline" asChild><Link to={paths.projects.towers(project.uuid)}>Manage Towers</Link></Button><Button variant="outline" asChild><Link to={paths.projects.units(project.uuid)}>Manage Units</Link></Button></div></CardContent></Card>
          {project.images.length ? <Card className="lg:col-span-2"><CardHeader><CardTitle>Images</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">{project.images.map((image) => <img key={image} src={assetUrl(image)} alt="" className="h-32 w-full rounded-lg object-cover" />)}</CardContent></Card> : null}
          {project.brochurePdf ? <Card className="lg:col-span-2"><CardHeader><CardTitle>Brochure</CardTitle></CardHeader><CardContent><a className="text-primary underline" href={assetUrl(project.brochurePdf)} target="_blank" rel="noreferrer">Download brochure PDF</a></CardContent></Card> : null}
        </div>
      ) : null}
    </div>
  );
}
