import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import SummaryCards from "@/components/Dashboard/SummaryCards";
import Charts from "@/components/Dashboard/Charts";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import QuickActions from "@/components/Dashboard/QuickActions";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // This component is only rendered when authenticated (handled in App.tsx)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Security Dashboard" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <SummaryCards />

            {/* Charts Row */}
            <Charts />

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecentActivity />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
