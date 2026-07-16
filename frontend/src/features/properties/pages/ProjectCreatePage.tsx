import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { ProjectForm, projectDefaultValues } from "@/features/properties/components/ProjectForm";
import { useCreateProject } from "@/features/properties/hooks/useProperties";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function ProjectCreatePage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Building2} tone="blue" title="Add Project" description="Create a new real estate project with media uploads." />
      <ProjectForm
        defaultValues={projectDefaultValues}
        submitLabel="Create Project"
        isSubmitting={createProject.isPending}
        onCancel={() => navigate(paths.projects.list)}
        onSubmit={async (values, images, brochure) => {
          try {
            const project = await createProject.mutateAsync({ values, images, brochure });
            navigate(paths.projects.details(project.uuid));
          } catch (error) {
            alert(getApiErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
