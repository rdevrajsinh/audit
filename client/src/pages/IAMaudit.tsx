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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Users, Shield, AlertTriangle, CheckCircle, Clock, Key } from "lucide-react";
import { format } from "date-fns";
import type { IamRecord } from "@shared/schema";

const platformLabels = {
  aws: "Amazon Web Services",
  google_workspace: "Google Workspace",
  microsoft365: "Microsoft 365",
};

const platformIcons = {
  aws: "🔧",
  google_workspace: "📧",
  microsoft365: "💼",
};

export default function IAMaudit() {
  const [isNewAuditDialogOpen, setIsNewAuditDialogOpen] = useState(false);
  const [newAudit, setNewAudit] = useState({
    platform: "",
    type: "iam",
    name: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: iamRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/iam-records"],
    enabled: isAuthenticated,
  });

  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ["/api/scans"],
    enabled: isAuthenticated,
  });

  const createAuditMutation = useMutation({
    mutationFn: (audit: any) => apiRequest("POST", "/api/scans", audit),
    onSuccess: () => {
      toast({
        title: "IAM Audit Started",
        description: "Your identity and access management audit has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/iam-records"] });
      setIsNewAuditDialogOpen(false);
      setNewAudit({
        platform: "",
        type: "iam",
        name: "",
      });
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
        description: "Failed to start IAM audit. Please try again.",
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

  const handleCreateAudit = () => {
    if (!newAudit.platform || !newAudit.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAuditMutation.mutate({
      ...newAudit,
      name: newAudit.name || `${platformLabels[newAudit.platform as keyof typeof platformLabels]} IAM Audit`,
    });
  };

  const iamScans = scans?.filter((scan: any) => scan.type === "iam") || [];
  const recentRecords = iamRecords?.slice(0, 10) || [];

  // Calculate summary metrics
  const totalUsers = iamRecords?.length || 0;
  const usersWithMFA = iamRecords?.filter((record: IamRecord) => record.mfaEnabled).length || 0;
  const overPrivilegedUsers = iamRecords?.filter((record: IamRecord) => record.isOverPrivileged).length || 0;
  const mfaPercentage = totalUsers > 0 ? Math.round((usersWithMFA / totalUsers) * 100) : 0;

  const getRiskBadge = (isOverPrivileged: boolean, mfaEnabled: boolean) => {
    if (isOverPrivileged) {
      return <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">High Risk</Badge>;
    }
    if (!mfaEnabled) {
      return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Medium Risk</Badge>;
    }
    return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Low Risk</Badge>;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="IAM Audit" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Identity & Access Management
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Monitor user access patterns and identify security risks
                </p>
              </div>
              
              <Dialog open={isNewAuditDialogOpen} onOpenChange={setIsNewAuditDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New IAM Audit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start IAM Audit</DialogTitle>
                    <DialogDescription>
                      Launch a new identity and access management audit for your cloud platforms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Platform *</Label>
                      <Select
                        value={newAudit.platform}
                        onValueChange={(value) => setNewAudit({ 
                          ...newAudit, 
                          platform: value,
                          name: `${platformLabels[value as keyof typeof platformLabels]} IAM Audit`
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">Amazon Web Services</SelectItem>
                          <SelectItem value="google_workspace">Google Workspace</SelectItem>
                          <SelectItem value="microsoft365">Microsoft 365</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="audit-name">Audit Name</Label>
                      <input
                        id="audit-name"
                        type="text"
                        value={newAudit.name}
                        onChange={(e) => setNewAudit({ ...newAudit, name: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Custom audit name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewAuditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAudit}
                      disabled={createAuditMutation.isPending}
                    >
                      {createAuditMutation.isPending ? "Starting..." : "Start Audit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                        {totalUsers}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        MFA Enabled
                      </p>
                      <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                        {mfaPercentage}%
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {usersWithMFA} of {totalUsers} users
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Over-Privileged
                      </p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {overPrivilegedUsers}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Requires attention
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Active Audits
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {iamScans.filter((scan: any) => scan.status === 'running').length}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Running now
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent IAM Records */}
            <Card>
              <CardHeader>
                <CardTitle>User Access Review</CardTitle>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : recentRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>MFA</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRecords.map((record: IamRecord) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.userEmail}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{platformIcons[record.platform as keyof typeof platformIcons]}</span>
                              <span>{platformLabels[record.platform as keyof typeof platformLabels] || record.platform}</span>
                            </div>
                          </TableCell>
                          <TableCell>{record.role || "User"}</TableCell>
                          <TableCell>
                            {record.mfaEnabled ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </TableCell>
                          <TableCell>
                            {record.lastLogin ? format(new Date(record.lastLogin), "MMM d, yyyy") : "Never"}
                          </TableCell>
                          <TableCell>
                            {getRiskBadge(record.isOverPrivileged, record.mfaEnabled)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
                      No IAM Records Found
                    </h3>
                    <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                      Start an IAM audit to analyze user access patterns and identify security risks.
                    </p>
                    <Button onClick={() => setIsNewAuditDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Start IAM Audit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Recent IAM Audits</CardTitle>
              </CardHeader>
              <CardContent>
                {scansLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : iamScans.length > 0 ? (
                  <div className="space-y-4">
                    {iamScans.slice(0, 5).map((scan: any) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground dark:text-card-foreground">
                              {scan.name}
                            </p>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                              {format(new Date(scan.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            scan.status === "completed" 
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : scan.status === "running"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" 
                              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          }
                        >
                          {scan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      No IAM audits found. Start your first audit to analyze user access patterns.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
