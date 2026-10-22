import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPublicForm, submitPublicForm } from "@/features/growth/services/growth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/shared/Loading";

export function LeadCaptureFormPage() {
  const { formUuid } = useParams<{ formUuid: string }>();
  const [values, setValues] = useState({ name: "", mobile: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading } = useQuery({
    queryKey: ["public-form", formUuid],
    queryFn: () => getPublicForm(formUuid!),
    enabled: Boolean(formUuid),
  });

  const submit = useMutation({
    mutationFn: () => submitPublicForm(formUuid!, values),
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) return <Loading label="Loading form..." />;
  if (!form) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-muted-foreground">Form not found.</div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle>Thank you</CardTitle>
            <CardDescription>We received your details and will contact you shortly.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <CardDescription>Share your details and our team will reach out.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                required
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input
                required
                type="tel"
                value={values.mobile}
                onChange={(e) => setValues((v) => ({ ...v, mobile: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submit.isPending}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
