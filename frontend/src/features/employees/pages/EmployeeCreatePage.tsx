import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import {
  EmployeeLoginCredentialsCard,
  type EmployeeLoginCredentials,
} from "@/features/employees/components/EmployeeLoginCredentialsCard";
import { useCreateEmployee } from "@/features/employees/hooks/useEmployees";
import type { EmployeeFormSchema } from "@/features/employees/schemas/employee.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createEmployee = useCreateEmployee();
  const [error, setError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] =
    useState<EmployeeLoginCredentials | null>(null);
  const [createdEmployeeUuid, setCreatedEmployeeUuid] = useState<string | null>(null);

  const handleSubmit = async (values: EmployeeFormSchema) => {
    setError(null);
    try {
      const employee = await createEmployee.mutateAsync(values);
      setCreatedEmployeeUuid(employee.uuid);
      setCreatedCredentials({
        companyCode: user?.company.code ?? "",
        username: employee.username,
        employeeCode: employee.employeeCode,
        password: values.password,
        displayName: employee.displayName ?? `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
        roleName: employee.role.name,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (createdCredentials && createdEmployeeUuid) {
    return (
      <div className="space-y-6">
        <CompanyPageHeader
          icon={UserPlus}
          tone="emerald"
          title="Employee created"
          description="Share these login details with the employee. Each person has their own username and password."
        />

        <EmployeeLoginCredentialsCard credentials={createdCredentials} />

        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link to={paths.employees.details(createdEmployeeUuid)}>View employee profile</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCreatedCredentials(null);
              setCreatedEmployeeUuid(null);
            }}
          >
            Add another employee
          </Button>
          <Button variant="ghost" asChild>
            <Link to={paths.employees.list}>Back to employees</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={UserPlus}
        tone="emerald"
        title="Add Employee"
        description={`Create a staff login for company code ${user?.company.code ?? "—"}. Each employee gets their own username and password.`}
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
