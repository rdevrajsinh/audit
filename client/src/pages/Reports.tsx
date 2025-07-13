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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, FileText, Download, Eye, Clock, CheckCircle, AlertTriangle, BarChart } from "lucide-react";
import { format } from "date-fns";
import type { Report } from "@shared/schema";

const reportTypeLabels = {
  executive: "Executive Summary",
  technical: "Technical Report",
  compliance: "Compliance Report",
  vulnerability: "Vulnerability Report",
  iam: "IAM Audit Report",
};

const reportTypeDescriptions = {
  executive: "High-level overview for leadership and stakeholders",
  technical: "Detailed technical findings for IT teams",
  compliance: "Compliance status and gap analysis",
  vulnerability: "Vulnerability assessment and remediation",
  iam: "Identity and access management audit results",
};

export default function Reports() {
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: "",
    type: "",
    includeAssets: true,
    includeVulnerabilities: true,
    includeCompliance: true,
    includeIAM: true,
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: isAuthenticated,
  });

  const generateReportMutation = useMutation({
    mutationFn: (report: any) => apiRequest("POST", "/api/reports", report),
    onSuccess: () => {
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated and will be available shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsNewReportDialogOpen(false);
      setNewReport({
        name: "",
        type: "",
        includeAssets: true,
        includeVulnerabilities: true,
        includeCompliance: true,
        includeIAM: true,
        description: "",
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
        description: "Failed to generate report. Please try again.",
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

  const handleGenerateReport = () => {
    if (!newReport.name || !newReport.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const parameters = {
      includeAssets: newReport.includeAssets,
      includeVulnerabilities: newReport.includeVulnerabilities,
      includeCompliance: newReport.includeCompliance,
      includeIAM: newReport.includeIAM,
      description: newReport.description,
    };

    generateReportMutation.mutate({
      name: newReport.name,
      type: newReport.type,
      parameters,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      generating: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      completed: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      failed: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.generating}>
        {status}
      </Badge>
    );
  };

  // Calculate report statistics
  const totalReports = reports?.length || 0;
  const completedReports = reports?.filter((report: Report) => report.status === "completed").length || 0;
  const pendingReports = reports?.filter((report: Report) => report.status === "generating").length || 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Reports" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Security Reports
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Generate and manage comprehensive security assessment reports
                </p>
              </div>
              
              <Dialog open={isNewReportDialogOpen} onOpenChange={setIsNewReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Generate New Report</DialogTitle>
                    <DialogDescription>
                      Create a comprehensive security report for your organization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <Label htmlFor="report-name">Report Name *</Label>
                      <Input
                        id="report-name"
                        value={newReport.name}
                        onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                        placeholder="e.g., Q4 Security Assessment"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="report-type">Report Type *</Label>
                      <Select
                        value={newReport.type}
                        onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executive Summary</SelectItem>
                          <SelectItem value="technical">Technical Report</SelectItem>
                          <SelectItem value="compliance">Compliance Report</SelectItem>
                          <SelectItem value="vulnerability">Vulnerability Report</SelectItem>
                          <SelectItem value="iam">IAM Audit Report</SelectItem>
                        </SelectContent>
                      </Select>
                      {newReport.type && (
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                          {reportTypeDescriptions[newReport.type as keyof typeof reportTypeDescriptions]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Include Sections</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="assets"
                            checked={newReport.includeAssets}
                            onCheckedChange={(checked) => 
                              setNewReport({ ...newReport, includeAssets: !!checked })
                            }
                          />
                          <Label htmlFor="assets" className="text-sm font-normal">
                            Asset Inventory
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vulnerabilities"
                            checked={newReport.includeVulnerabilities}
                            onCheckedChange={(checked) => 
                              setNewReport({ ...newReport, includeVulnerabilities: !!checked })
                            }
                          />
                          <Label htmlFor="vulnerabilities" className="text-sm font-normal">
                            Vulnerability Assessment
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="compliance"
                            checked={newReport.includeCompliance}
                            onCheckedChange={(checked) => 
                              setNewReport({ ...newReport, includeCompliance: !!checked })
                            }
                          />
                          <Label htmlFor="compliance" className="text-sm font-normal">
                            Compliance Status
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="iam"
                            checked={newReport.includeIAM}
                            onCheckedChange={(checked) => 
                              setNewReport({ ...newReport, includeIAM: !!checked })
                            }
                          />
                          <Label htmlFor="iam" className="text-sm font-normal">
                            IAM Audit Results
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newReport.description}
                        onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                        placeholder="Additional notes or context for this report..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewReportDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={generateReportMutation.isPending}
                    >
                      {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Total Reports
                      </p>
                      <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                        {totalReports}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Completed
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {completedReports}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Ready for download
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        In Progress
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {pendingReports}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Currently generating
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div>
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reports && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report: Report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                            {getStatusIcon(report.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-card-foreground dark:text-card-foreground">
                              {report.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
                              <span>{reportTypeLabels[report.type as keyof typeof reportTypeLabels] || report.type}</span>
                              <span>•</span>
                              <span>Generated {format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(report.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {report.status === "completed" && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </>
                          )}
                          {report.status === "generating" && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
                              <Clock className="h-4 w-4 animate-spin" />
                              <span>Generating...</span>
                            </div>
                          )}
                          {report.status === "failed" && (
                            <Button variant="outline" size="sm">
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BarChart className="h-16 w-16 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
                      No Reports Generated
                    </h3>
                    <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                      Create your first security report to share findings with stakeholders.
                    </p>
                    <Button onClick={() => setIsNewReportDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Your First Report
                    </Button>
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
