import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Building, 
  Users, 
  Bell, 
  Shield, 
  Key, 
  Globe, 
  Clock, 
  Trash2,
  Plus,
  Mail,
  Slack,
} from "lucide-react";

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");
  const [organizationSettings, setOrganizationSettings] = useState({
    name: "",
    domain: "",
    timezone: "UTC",
    logo: "",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    slackAlerts: false,
    criticalOnly: false,
    weeklyReports: true,
    scanCompletion: true,
  });

  const [scanSettings, setScanSettings] = useState({
    autoScanFrequency: "weekly",
    retentionDays: 90,
    maxConcurrentScans: 3,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const saveSettingsMutation = useMutation({
    mutationFn: (settings: any) => apiRequest("PUT", "/api/settings", settings),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSaveOrganization = () => {
    saveSettingsMutation.mutate({
      type: "organization",
      ...organizationSettings,
    });
  };

  const handleSaveNotifications = () => {
    saveSettingsMutation.mutate({
      type: "notifications",
      ...notificationSettings,
    });
  };

  const handleSaveScans = () => {
    saveSettingsMutation.mutate({
      type: "scans",
      ...scanSettings,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Settings" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Settings
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Manage your organization settings and preferences
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* Organization Settings */}
                <TabsContent value="organization">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>Organization Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="org-name">Organization Name</Label>
                          <Input
                            id="org-name"
                            value={organizationSettings.name}
                            onChange={(e) => setOrganizationSettings({
                              ...organizationSettings,
                              name: e.target.value
                            })}
                            placeholder="Your Organization Name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="org-domain">Primary Domain</Label>
                          <Input
                            id="org-domain"
                            value={organizationSettings.domain}
                            onChange={(e) => setOrganizationSettings({
                              ...organizationSettings,
                              domain: e.target.value
                            })}
                            placeholder="company.com"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={organizationSettings.timezone}
                          onValueChange={(value) => setOrganizationSettings({
                            ...organizationSettings,
                            timezone: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="logo-url">Logo URL</Label>
                        <Input
                          id="logo-url"
                          value={organizationSettings.logo}
                          onChange={(e) => setOrganizationSettings({
                            ...organizationSettings,
                            logo: e.target.value
                          })}
                          placeholder="https://company.com/logo.png"
                        />
                      </div>

                      <Button 
                        onClick={handleSaveOrganization}
                        disabled={saveSettingsMutation.isPending}
                      >
                        Save Organization Settings
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* User Management */}
                <TabsContent value="users">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Team Members</span>
                          </CardTitle>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Invite User
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <img
                                className="w-10 h-10 rounded-full object-cover"
                                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                                alt="User profile"
                              />
                              <div>
                                <p className="font-medium text-card-foreground dark:text-card-foreground">
                                  {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.email || "Current User"}
                                </p>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">
                                {user?.role === "org_admin" ? "Admin" : "User"}
                              </Badge>
                              <span className="text-green-600 dark:text-green-400 text-sm">You</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Role Permissions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border border-border dark:border-border rounded-lg">
                              <h4 className="font-medium text-card-foreground dark:text-card-foreground mb-2">
                                Super Admin
                              </h4>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                                Full platform access
                              </p>
                              <ul className="text-xs space-y-1 text-muted-foreground dark:text-muted-foreground">
                                <li>• Manage all organizations</li>
                                <li>• System configuration</li>
                                <li>• Platform analytics</li>
                              </ul>
                            </div>
                            
                            <div className="p-4 border border-border dark:border-border rounded-lg">
                              <h4 className="font-medium text-card-foreground dark:text-card-foreground mb-2">
                                Organization Admin
                              </h4>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                                Organization management
                              </p>
                              <ul className="text-xs space-y-1 text-muted-foreground dark:text-muted-foreground">
                                <li>• Manage users</li>
                                <li>• Configure settings</li>
                                <li>• Generate reports</li>
                              </ul>
                            </div>
                            
                            <div className="p-4 border border-border dark:border-border rounded-lg">
                              <h4 className="font-medium text-card-foreground dark:text-card-foreground mb-2">
                                Security User
                              </h4>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                                Security operations
                              </p>
                              <ul className="text-xs space-y-1 text-muted-foreground dark:text-muted-foreground">
                                <li>• Run scans</li>
                                <li>• View vulnerabilities</li>
                                <li>• Access reports</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Notification Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Email Alerts</Label>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Receive email notifications for security events
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailAlerts}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings,
                              emailAlerts: checked
                            })}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Slack Integration</Label>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Send notifications to Slack channels
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.slackAlerts}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings,
                              slackAlerts: checked
                            })}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Critical Issues Only</Label>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Only receive notifications for critical vulnerabilities
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.criticalOnly}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings,
                              criticalOnly: checked
                            })}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Weekly Reports</Label>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Receive weekly security summary reports
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.weeklyReports}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings,
                              weeklyReports: checked
                            })}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Scan Completion</Label>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Get notified when scans complete
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.scanCompletion}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings,
                              scanCompletion: checked
                            })}
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleSaveNotifications}
                        disabled={saveSettingsMutation.isPending}
                      >
                        Save Notification Settings
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="h-5 w-5" />
                          <span>Scan Configuration</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label htmlFor="scan-frequency">Auto-scan Frequency</Label>
                          <Select
                            value={scanSettings.autoScanFrequency}
                            onValueChange={(value) => setScanSettings({
                              ...scanSettings,
                              autoScanFrequency: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="retention">Data Retention (Days)</Label>
                          <Input
                            id="retention"
                            type="number"
                            value={scanSettings.retentionDays}
                            onChange={(e) => setScanSettings({
                              ...scanSettings,
                              retentionDays: parseInt(e.target.value) || 90
                            })}
                            min="1"
                            max="365"
                          />
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                            How long to keep scan results and vulnerability data
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="concurrent">Max Concurrent Scans</Label>
                          <Input
                            id="concurrent"
                            type="number"
                            value={scanSettings.maxConcurrentScans}
                            onChange={(e) => setScanSettings({
                              ...scanSettings,
                              maxConcurrentScans: parseInt(e.target.value) || 3
                            })}
                            min="1"
                            max="10"
                          />
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                            Maximum number of scans that can run simultaneously
                          </p>
                        </div>

                        <Button 
                          onClick={handleSaveScans}
                          disabled={saveSettingsMutation.isPending}
                        >
                          Save Scan Settings
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Key className="h-5 w-5" />
                          <span>API Integration</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="flex space-x-2">
                            <Input 
                              value="sk-***************" 
                              readOnly 
                              className="font-mono"
                            />
                            <Button variant="outline">
                              Regenerate
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                            Use this key to integrate with external systems
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-destructive">
                          <Trash2 className="h-5 w-5" />
                          <span>Danger Zone</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-card-foreground dark:text-card-foreground mb-2">
                              Delete Organization
                            </h4>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-4">
                              Permanently delete this organization and all associated data. This action cannot be undone.
                            </p>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  Delete Organization
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    organization and remove all data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
