import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import {
  useEmployee,
  useUpdateEmployee,
} from "@/features/employees/hooks/useEmployees";
import {
  getEmployeeDisplayName,
  mapEmployeeToFormValues,
} from "@/features/employees/schemas/employee.schema";
import type { EmployeeFormSchema } from "@/features/employees/schemas/employee.schema";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function EmployeeEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(uuid);
  const updateEmployee = useUpdateEmployee(uuid ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: EmployeeFormSchema) => {
    if (!uuid) return;
    setSubmitError(null);
    try {
      await updateEmployee.mutateAsync(values);
      navigate(paths.employees.details(uuid));
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading employee..." />;
  }

  if (error || !employee) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error ? getApiErrorMessage(error) : "Employee not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Pencil}
        tone="violet"
        title="Edit Employee"
        description={`Update profile and assignments for ${getEmployeeDisplayName(employee)}.`}
      />

      {submitError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}

      <EmployeeForm
        mode="edit"
        defaultValues={mapEmployeeToFormValues(employee)}
        excludeUserId={employee.id}
        submitLabel="Save Changes"
        isSubmitting={updateEmployee.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.employees.details(employee.uuid))}
      />
    </div>
  );
}
