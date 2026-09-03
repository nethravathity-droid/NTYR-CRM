import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/branding";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="text-sm font-bold">
                  {APP_NAME.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Start Free Trial</Link>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4">
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/features" className="text-sm text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Solutions</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <span className="text-sm text-muted-foreground">Real Estate</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Agencies</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Professional Services</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
