const SECTIONS = [
  {
    title: "Information Collected",
    body: "We collect information you provide directly, such as account details, company information, and CRM data. We also collect usage information, device information, and cookies.",
  },
  {
    title: "Account Information",
    body: "We collect your name, email, phone number, username, and password when you create an account.",
  },
  {
    title: "Company Information",
    body: "We collect company name, code, address, and other business details during registration.",
  },
  {
    title: "CRM / Customer Data",
    body: "Data you enter into the CRM, including leads, contacts, deals, tasks, and communications, is stored securely.",
  },
  {
    title: "Usage Information",
    body: "We collect information about how you use the Service, including features accessed and actions performed.",
  },
  {
    title: "Device / Browser Information",
    body: "We collect IP address, browser type, operating system, and device identifiers.",
  },
  {
    title: "Cookies",
    body: "We use cookies and similar technologies to enhance your experience and analyze usage.",
  },
  {
    title: "How Data Is Used",
    body: "We use your data to provide and improve the Service, communicate with you, and ensure security.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your data. We may share data with service providers who assist in operating the Service.",
  },
  {
    title: "Third-Party Integrations",
    body: "If you connect third-party services, data may be shared with those services in accordance with their privacy policies.",
  },
  {
    title: "Data Retention",
    body: "We retain your data for as long as your account is active or as needed to provide the Service.",
  },
  {
    title: "Security",
    body: "We implement appropriate security measures to protect your data. However, no method of transmission over the Internet is 100% secure.",
  },
  {
    title: "User Rights",
    body: "You may access, update, or delete your data at any time through your account settings.",
  },
  {
    title: "Data Deletion",
    body: "You may request deletion of your account and associated data by contacting support.",
  },
  {
    title: "Children's Privacy",
    body: "The Service is not intended for children under 13. We do not knowingly collect data from children.",
  },
  {
    title: "International Data",
    body: "Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place.",
  },
  {
    title: "Contact Information",
    body: "For privacy inquiries, contact us at {SUPPORT_EMAIL}.",
  },
];

export function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
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
