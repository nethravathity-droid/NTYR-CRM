import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { ProjectForm } from "@/features/properties/components/ProjectForm";
import { useProject, useUpdateProject } from "@/features/properties/hooks/useProperties";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function ProjectEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(uuid!);
  const updateProject = useUpdateProject(uuid!);

  const defaultValues = useMemo(() => project ? {
    projectName: project.projectName,
    projectCode: project.projectCode,
    builderName: project.builderName ?? "",
    reraNumber: project.reraNumber ?? "",
    address: project.address ?? "",
    city: project.city ?? "",
    state: project.state ?? "",
    description: project.description ?? "",
    status: project.status,
    amenities: project.amenities.join(", "),
  } : undefined, [project]);

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Building2} tone="blue" title="Edit Project" description="Update project profile and upload new media." />
      {isLoading ? <Loading label="Loading project..." /> : null}
      {defaultValues ? (
        <ProjectForm
          defaultValues={defaultValues}
          submitLabel="Save Changes"
          isSubmitting={updateProject.isPending}
          onCancel={() => navigate(paths.projects.details(uuid!))}
          onSubmit={async (values, images, brochure) => {
            try {
              await updateProject.mutateAsync({ values, images, brochure });
              navigate(paths.projects.details(uuid!));
            } catch (error) {
              alert(getApiErrorMessage(error));
            }
          }}
        />
      ) : null}
    </div>
  );
}
