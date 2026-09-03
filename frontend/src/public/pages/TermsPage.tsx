const SECTIONS = [
  {
    title: "1. Introduction",
    body: "Welcome to {APP_NAME}. These Terms and Conditions govern your use of our services. By accessing or using our services, you agree to be bound by these terms.",
  },
  {
    title: "2. Definitions",
    body: "'Service' means the {APP_NAME} platform. 'User' means any person or entity that registers for or uses the Service. 'Company' means the tenant organization created during registration.",
  },
  {
    title: "3. Account Registration",
    body: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "4. Company / Workspace Accounts",
    body: "Each company is provided with a unique workspace. Users within a company can only access data belonging to that company.",
  },
  {
    title: "5. User Responsibilities",
    body: "You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use.",
  },
  {
    title: "6. Acceptable Use",
    body: "You may not use the Service for any unlawful purpose or in any way that could damage the Service or interfere with other users.",
  },
  {
    title: "7. CRM Data",
    body: "You retain ownership of all data you input into the Service. We do not claim any ownership rights over your data.",
  },
  {
    title: "8. Customer Data",
    body: "You are responsible for ensuring you have the right to collect and process customer data through the Service.",
  },
  {
    title: "9. Communication Features",
    body: "The Service may include communication tools. You agree to use these tools in compliance with applicable laws and regulations.",
  },
  {
    title: "10. Third-Party Integrations",
    body: "The Service may integrate with third-party services. We are not responsible for the availability or accuracy of third-party services.",
  },
  {
    title: "11. Subscription and Billing",
    body: "Paid plans are billed in advance. Refunds are provided in accordance with our refund policy.",
  },
  {
    title: "12. Free Trial",
    body: "Free trials are provided for evaluation purposes. At the end of the trial, your account may be downgraded or suspended.",
  },
  {
    title: "13. Cancellation",
    body: "You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.",
  },
  {
    title: "14. Intellectual Property",
    body: "All content and functionality of the Service are the exclusive property of {APP_NAME} and its licensors.",
  },
  {
    title: "15. Data Protection",
    body: "We implement appropriate technical and organizational measures to protect your data.",
  },
  {
    title: "16. Security",
    body: "You must notify us immediately of any security breach or unauthorized access to your account.",
  },
  {
    title: "17. Service Availability",
    body: "We strive to maintain high service availability but do not guarantee uninterrupted access.",
  },
  {
    title: "18. Account Suspension",
    body: "We may suspend or terminate accounts that violate these terms or remain inactive for extended periods.",
  },
  {
    title: "19. Limitation of Liability",
    body: "To the maximum extent permitted by law, {APP_NAME} shall not be liable for any indirect, incidental, or consequential damages.",
  },
  {
    title: "20. Indemnification",
    body: "You agree to indemnify and hold harmless {APP_NAME} from any claims arising from your use of the Service.",
  },
  {
    title: "21. Changes to Service",
    body: "We may modify or discontinue the Service at any time with reasonable notice.",
  },
  {
    title: "22. Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance.",
  },
  {
    title: "23. Termination",
    body: "Either party may terminate this agreement at any time. Upon termination, your right to use the Service will cease.",
  },
  {
    title: "24. Governing Law",
    body: "These terms are governed by the laws of [COUNTRY / STATE]. Any disputes shall be resolved in the courts of [COUNTRY / STATE].",
  },
  {
    title: "25. Contact Information",
    body: "For questions about these terms, contact us at {SUPPORT_EMAIL}.",
  },
];

export function TermsPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
        <div className="mt-12 space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
