import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useDeleteProject, useProjects } from "@/features/properties/hooks/useProperties";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/features/properties/types/property.types";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export function ProjectsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("projects.create");
  const canDelete = hasPermission("projects.delete");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const deleteProject = useDeleteProject();

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(() => ({ page, limit: 10, search: search || undefined, status: status || undefined }), [page, search, status]);
  const { data, isLoading } = useProjects(params);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Building2} tone="blue" title="Projects" description="Manage real estate projects and inventory." action={<div className="flex gap-2"><Button variant="outline" asChild><Link to={paths.projects.inventory}>Inventory Dashboard</Link></Button>{canCreate ? <Button onClick={() => navigate(paths.projects.create)}><Plus className="mr-2 h-4 w-4" />Add Project</Button> : null}</div>} />
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row"><Input placeholder="Search projects" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} /><Select value={status} onChange={(e) => { setStatus(e.target.value as ProjectStatus | ""); setPage(1); }}><option value="">All statuses</option>{Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>
      {isLoading ? <Loading label="Loading projects..." /> : null}
      <div className="space-y-4">{data?.projects.map((project) => (
        <Card key={project.uuid}><CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-semibold">{project.projectName}</h2><p className="text-sm text-muted-foreground">{project.projectCode} • {PROJECT_STATUS_LABELS[project.status]} • {project.city ?? "No city"}</p><p className="text-sm text-muted-foreground">{project.unitCount} units • {project.availableUnits} available • {project.towerCount} towers</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => navigate(paths.projects.details(project.uuid))}>Details</Button><Button variant="outline" onClick={() => navigate(paths.projects.towers(project.uuid))}>Towers</Button><Button variant="outline" onClick={() => navigate(paths.projects.units(project.uuid))}>Units</Button>{canDelete ? <Button variant="destructive" onClick={() => deleteProject.mutate(project.uuid)}>Delete</Button> : null}</div>
        </CardContent></Card>
      ))}</div>
      {data && data.pagination.totalPages > 1 ? <div className="flex justify-between"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</span><Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button></div> : null}
    </div>
  );
}
