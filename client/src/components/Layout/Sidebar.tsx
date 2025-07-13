import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart3,
  Server,
  Search,
  Users,
  CheckCircle,
  FileText,
  Settings,
  Shield,
  MoreVertical,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Assets", href: "/assets", icon: Server },
  { name: "Scans", href: "/scans", icon: Search },
  { name: "IAM Audit", href: "/iam-audit", icon: Users },
  { name: "Compliance", href: "/compliance", icon: CheckCircle },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="hidden lg:flex lg:w-72 lg:flex-col">
      <div className="flex flex-col flex-grow bg-sidebar-background dark:bg-sidebar-background shadow-sm border-r border-sidebar-border dark:border-sidebar-border">
        {/* Logo and Company */}
        <div className="flex items-center px-6 py-4 border-b border-sidebar-border dark:border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground dark:text-sidebar-foreground">
                Audit Capsule
              </h1>
              <p className="text-xs text-sidebar-accent-foreground dark:text-sidebar-accent-foreground">
                {user?.organizationId || "Organization"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-sidebar-primary dark:text-sidebar-primary bg-sidebar-accent dark:bg-sidebar-accent"
                      : "text-sidebar-accent-foreground dark:text-sidebar-accent-foreground hover:text-sidebar-foreground dark:hover:text-sidebar-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive
                        ? "text-sidebar-primary dark:text-sidebar-primary"
                        : "text-sidebar-accent-foreground dark:text-sidebar-accent-foreground"
                    )}
                  />
                  {item.name}
                  {item.name === "Assets" && (
                    <span className="ml-auto bg-sidebar-accent dark:bg-sidebar-accent text-sidebar-foreground dark:text-sidebar-foreground text-xs px-2 py-0.5 rounded-full">
                      127
                    </span>
                  )}
                  {item.name === "Scans" && (
                    <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-0.5 rounded-full">
                      3
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-sidebar-border dark:border-sidebar-border">
          <div className="flex items-center space-x-3">
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
              alt="User profile"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground dark:text-sidebar-foreground truncate">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "User"}
              </p>
              <p className="text-xs text-sidebar-accent-foreground dark:text-sidebar-accent-foreground truncate">
                {user?.role === "org_admin" ? "Admin" : "Security User"}
              </p>
            </div>
            <button className="text-sidebar-accent-foreground dark:text-sidebar-accent-foreground hover:text-sidebar-foreground dark:hover:text-sidebar-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
