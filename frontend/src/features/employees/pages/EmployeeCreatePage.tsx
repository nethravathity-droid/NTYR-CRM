import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import { useCreateEmployee } from "@/features/employees/hooks/useEmployees";
import type { EmployeeFormSchema } from "@/features/employees/schemas/employee.schema";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: EmployeeFormSchema) => {
    setError(null);
    try {
      const employee = await createEmployee.mutateAsync(values);
      navigate(paths.employees.details(employee.uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={UserPlus}
        tone="emerald"
        title="Add Employee"
        description="Create a new employee account for your organization."
      />

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <EmployeeForm
        mode="create"
        submitLabel="Create Employee"
        isSubmitting={createEmployee.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.employees.list)}
      />
    </div>
  );
}
