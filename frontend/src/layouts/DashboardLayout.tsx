import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardLayout() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <Loading fullScreen label="Loading workspace..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
