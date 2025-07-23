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
// Badge component not available, using inline styles
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
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
import { Input } from "@/components/ui/input";
import { Plus, Play, Pause, AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { format } from "date-fns";
import type { ScanJob, Asset } from "@shared/schema";

const scanTypeLabels = {
  vulnerability: "Vulnerability Scan",
  iam: "IAM Audit", 
  cloud_config: "Cloud Configuration",
  asset_discovery: "Asset Discovery",
};

const statusIcons = {
  pending: Clock,
  running: Play,
  completed: CheckCircle,
  failed: AlertTriangle,
};

export default function Scans() {
  const [isNewScanDialogOpen, setIsNewScanDialogOpen] = useState(false);
  const [newScan, setNewScan] = useState({
    name: "",
    type: "",
    assetId: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ["/api/scans"],
    enabled: isAuthenticated,
  });

  const { data: assets } = useQuery({
    queryKey: ["/api/assets"],
    enabled: isAuthenticated,
  });

  const createScanMutation = useMutation({
    mutationFn: (scan: any) => apiRequest("POST", "/api/scans", scan),
    onSuccess: () => {
      toast({
        title: "Scan Started",
        description: "Your security scan has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      setIsNewScanDialogOpen(false);
      setNewScan({
        name: "",
        type: "",
        assetId: "",
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
        description: "Failed to start scan. Please try again.",
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

  const handleCreateScan = () => {
    if (!newScan.name || !newScan.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createScanMutation.mutate({
      ...newScan,
      assetId: newScan.assetId ? parseInt(newScan.assetId) : null,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      running: "default",
      completed: "secondary",
      failed: "destructive",
    } as const;

    const colors = {
      pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      running: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      completed: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      failed: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Security Scans" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Security Scans
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Monitor and manage your security scanning activities
                </p>
              </div>
              
              <Dialog open={isNewScanDialogOpen} onOpenChange={setIsNewScanDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Scan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Scan</DialogTitle>
                    <DialogDescription>
                      Configure and launch a new security scan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="scan-name">Scan Name *</Label>
                      <Input
                        id="scan-name"
                        value={newScan.name}
                        onChange={(e) => setNewScan({ ...newScan, name: e.target.value })}
                        placeholder="e.g., Weekly Vulnerability Scan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scan-type">Scan Type *</Label>
                      <Select
                        value={newScan.type}
                        onValueChange={(value) => setNewScan({ ...newScan, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select scan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vulnerability">Vulnerability Scan</SelectItem>
                          <SelectItem value="iam">IAM Audit</SelectItem>
                          <SelectItem value="cloud_config">Cloud Configuration</SelectItem>
                          <SelectItem value="asset_discovery">Asset Discovery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="asset">Target Asset</Label>
                      <Select
                        value={newScan.assetId}
                        onValueChange={(value) => setNewScan({ ...newScan, assetId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target asset (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets?.map((asset: Asset) => (
                            <SelectItem key={asset.id} value={asset.id.toString()}>
                              {asset.name} ({asset.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewScanDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateScan}
                      disabled={createScanMutation.isPending}
                    >
                      {createScanMutation.isPending ? "Starting..." : "Start Scan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Scans List */}
            {scansLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div>
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-6 w-20 mb-2" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : scans && scans.length > 0 ? (
              <div className="space-y-4">
                {scans.map((scan: ScanJob) => {
                  const StatusIcon = statusIcons[scan.status as keyof typeof statusIcons] || Clock;
                  const targetAsset = assets?.find((asset: Asset) => asset.id === scan.assetId);
                  
                  return (
                    <Card key={scan.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                              <StatusIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-card-foreground dark:text-card-foreground">
                                  {scan.name}
                                </h3>
                                <Badge variant="outline">
                                  {scanTypeLabels[scan.type as keyof typeof scanTypeLabels] || scan.type}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground dark:text-muted-foreground space-y-1">
                                {targetAsset && (
                                  <p>Target: {targetAsset.name}</p>
                                )}
                                <p>Created: {format(new Date(scan.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                {scan.startedAt && (
                                  <p>Started: {format(new Date(scan.startedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                )}
                                {scan.completedAt && (
                                  <p>Completed: {format(new Date(scan.completedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            {getStatusBadge(scan.status)}
                            {scan.status === "running" && (
                              <div className="w-32">
                                <Progress value={scan.progress || 0} className="h-2" />
                                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                                  {scan.progress || 0}% complete
                                </p>
                              </div>
                            )}
                            {scan.status === "completed" && (
                              <Button variant="outline" size="sm">
                                View Results
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Search className="h-16 w-16 text-muted-foreground dark:text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
                    No Scans Found
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-center mb-4">
                    Start your first security scan to identify vulnerabilities and improve your security posture.
                  </p>
                  <Button onClick={() => setIsNewScanDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Start Your First Scan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
