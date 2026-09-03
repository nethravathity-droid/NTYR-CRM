import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { SUPPORT_EMAIL } from "@/config/branding";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Sales
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Have questions? We would love to hear from you.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Card className="p-8">
            {submitted ? (
              <div className="text-center">
                <p className="text-lg font-medium">Thank you for reaching out!</p>
                <p className="mt-2 text-muted-foreground">
                  We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} required />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </Card>
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{SUPPORT_EMAIL}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 000-0000</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    [COMPANY ADDRESS]
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
