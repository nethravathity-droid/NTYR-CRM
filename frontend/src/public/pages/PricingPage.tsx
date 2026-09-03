import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PLANS = [
  {
    name: "Free Trial",
    price: "$0",
    period: "for 14 days",
    cta: "Start Free Trial",
    href: "/register",
    features: [
      "Up to 3 users",
      "100 contacts",
      "1 pipeline",
      "Basic automation",
      "Email & WhatsApp",
      "Basic reports",
    ],
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    cta: "Start Free Trial",
    href: "/register",
    features: [
      "Up to 5 users",
      "1,000 contacts",
      "2 pipelines",
      "Advanced automation",
      "Email, WhatsApp, SMS",
      "Advanced reports",
    ],
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    cta: "Start Free Trial",
    href: "/register",
    features: [
      "Up to 15 users",
      "10,000 contacts",
      "5 pipelines",
      "Full automation",
      "All communication",
      "Custom reports",
    ],
  },
  {
    name: "Business",
    price: "$199",
    period: "/month",
    cta: "Contact Sales",
    href: "/contact",
    features: [
      "Up to 50 users",
      "50,000 contacts",
      "Unlimited pipelines",
      "Advanced workflows",
      "API access",
      "Dedicated support",
    ],
  },
];

export function PricingPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card key={plan.name} className="p-6">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </p>
              <Button className="mt-4 w-full" asChild>
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom plan?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact Sales
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
