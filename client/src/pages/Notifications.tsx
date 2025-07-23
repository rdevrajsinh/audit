import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle, AlertTriangle, Info, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";

interface Notification {
  id: string;
  type: "security" | "scan" | "compliance" | "system";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  securityAlerts: boolean;
  scanUpdates: boolean;
  complianceReports: boolean;
  weeklyDigest: boolean;
}

export default function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("all");

  // Mock data - replace with real API calls
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "security",
      severity: "critical",
      title: "Critical Vulnerability Detected",
      message: "SQL injection vulnerability found in main application database endpoint",
      read: false,
      createdAt: "2025-01-23T10:30:00Z",
      relatedId: "vuln-123"
    },
    {
      id: "2",
      type: "scan",
      severity: "medium",
      title: "Security Scan Completed",
      message: "Asset discovery scan for production environment completed with 15 new assets found",
      read: false,
      createdAt: "2025-01-23T09:15:00Z",
      relatedId: "scan-456"
    },
    {
      id: "3",
      type: "compliance",
      severity: "high",
      title: "ISO 27001 Compliance Score Dropped",
      message: "Your compliance score decreased by 12% due to unpatched vulnerabilities",
      read: true,
      createdAt: "2025-01-23T08:00:00Z",
      relatedId: "compliance-iso27001"
    },
    {
      id: "4",
      type: "system",
      severity: "low",
      title: "Weekly Security Report Ready",
      message: "Your weekly security summary report has been generated and is ready for download",
      read: true,
      createdAt: "2025-01-22T16:00:00Z",
      relatedId: "report-weekly-001"
    }
  ];

  const mockSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    scanUpdates: true,
    complianceReports: true,
    weeklyDigest: false,
  };

  const { data: notifications = mockNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => Promise.resolve(mockNotifications),
  });

  const { data: settings = mockSettings } = useQuery({
    queryKey: ["/api/notifications/settings"],
    queryFn: () => Promise.resolve(mockSettings),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All notifications marked as read",
        description: "Your notification list has been cleared.",
      });
    },
  });

  const filteredNotifications = notifications.filter(notification => 
    selectedType === "all" || notification.type === selectedType
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
    if (type === "security") {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <Info className="h-5 w-5 text-blue-500" />;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "outline"
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || "outline"}>
        {severity}
      </Badge>
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Notifications" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            <Tabs defaultValue="notifications" className="space-y-6">
              <TabsList>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-6">
                {/* Controls */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Notifications</CardTitle>
                        <CardDescription>
                          Stay updated with security alerts and system updates
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAllAsReadMutation.mutate()}
                          disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                        >
                          Mark All Read
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType("all")}
                      >
                        All ({notifications.length})
                      </Button>
                      <Button
                        variant={selectedType === "security" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType("security")}
                      >
                        Security ({notifications.filter(n => n.type === "security").length})
                      </Button>
                      <Button
                        variant={selectedType === "scan" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType("scan")}
                      >
                        Scans ({notifications.filter(n => n.type === "scan").length})
                      </Button>
                      <Button
                        variant={selectedType === "compliance" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType("compliance")}
                      >
                        Compliance ({notifications.filter(n => n.type === "compliance").length})
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications List */}
                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No notifications</h3>
                          <p className="text-muted-foreground">
                            You're all caught up! No new notifications to display.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={`transition-colors ${
                          !notification.read ? "border-primary/50 bg-primary/5" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type, notification.severity)}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-medium">{notification.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.message}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {getSeverityBadge(notification.severity)}
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsReadMutation.mutate(notification.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="capitalize">{notification.type} notification</span>
                                <span>{formatRelativeTime(notification.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Customize how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) =>
                            updateSettingsMutation.mutate({ emailNotifications: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Security Alerts</h4>
                          <p className="text-sm text-muted-foreground">
                            Get notified about critical security issues
                          </p>
                        </div>
                        <Switch
                          checked={settings.securityAlerts}
                          onCheckedChange={(checked) =>
                            updateSettingsMutation.mutate({ securityAlerts: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Scan Updates</h4>
                          <p className="text-sm text-muted-foreground">
                            Notifications when scans complete
                          </p>
                        </div>
                        <Switch
                          checked={settings.scanUpdates}
                          onCheckedChange={(checked) =>
                            updateSettingsMutation.mutate({ scanUpdates: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Compliance Reports</h4>
                          <p className="text-sm text-muted-foreground">
                            Updates on compliance score changes
                          </p>
                        </div>
                        <Switch
                          checked={settings.complianceReports}
                          onCheckedChange={(checked) =>
                            updateSettingsMutation.mutate({ complianceReports: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Weekly Digest</h4>
                          <p className="text-sm text-muted-foreground">
                            Weekly summary of security activities
                          </p>
                        </div>
                        <Switch
                          checked={settings.weeklyDigest}
                          onCheckedChange={(checked) =>
                            updateSettingsMutation.mutate({ weeklyDigest: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}