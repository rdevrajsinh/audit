import { useState } from "react";
import { Menu, Search, Bell, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [isDark, setIsDark] = useState(false);
  const logoutMutation = useLogout();
  
  // Get unread notification count
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-background dark:bg-background shadow-sm border-b border-border dark:border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden text-foreground dark:text-foreground hover:text-foreground/80 dark:hover:text-foreground/80">
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search assets, vulnerabilities..."
              className="w-64 pl-10"
            />
          </div>
          
          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
