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
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Plus, CheckCircle, AlertTriangle, FileCheck, TrendingUp, Award } from "lucide-react";
import { format } from "date-fns";
import type { ComplianceScore } from "@shared/schema";

const frameworkLabels = {
  iso_27001: "ISO 27001",
  soc2: "SOC 2",
  gdpr: "GDPR",
  hipaa: "HIPAA",
  pci_dss: "PCI DSS",
};

const frameworkDescriptions = {
  iso_27001: "Information Security Management Systems",
  soc2: "Service Organization Control 2",
  gdpr: "General Data Protection Regulation",
  hipaa: "Health Insurance Portability and Accountability Act",
  pci_dss: "Payment Card Industry Data Security Standard",
};

export default function Compliance() {
  const [isNewAssessmentDialogOpen, setIsNewAssessmentDialogOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    framework: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: complianceScores, isLoading: scoresLoading } = useQuery({
    queryKey: ["/api/compliance"],
    enabled: isAuthenticated,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (assessment: any) => apiRequest("POST", "/api/compliance", assessment),
    onSuccess: () => {
      toast({
        title: "Assessment Started",
        description: "Your compliance assessment has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance"] });
      setIsNewAssessmentDialogOpen(false);
      setNewAssessment({
        framework: "",
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
        description: "Failed to start compliance assessment. Please try again.",
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

  const handleCreateAssessment = () => {
    if (!newAssessment.framework) {
      toast({
        title: "Error",
        description: "Please select a compliance framework.",
        variant: "destructive",
      });
      return;
    }

    // Simulate assessment scoring (in real implementation, this would be calculated)
    const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
    const maxScore = 100;

    createAssessmentMutation.mutate({
      framework: newAssessment.framework,
      score: mockScore,
      maxScore: maxScore,
      gaps: [],
      recommendations: [],
    });
  };

  // Group compliance scores by framework and get latest for each
  const latestScores = complianceScores?.reduce((acc: any, score: ComplianceScore) => {
    if (!acc[score.framework] || new Date(score.assessmentDate) > new Date(acc[score.framework].assessmentDate)) {
      acc[score.framework] = score;
    }
    return acc;
  }, {}) || {};

  const latestScoresArray = Object.values(latestScores) as ComplianceScore[];

  // Calculate overall compliance score
  const overallScore = latestScoresArray.length > 0
    ? Math.round(latestScoresArray.reduce((acc, score) => acc + (score.score / score.maxScore * 100), 0) / latestScoresArray.length)
    : 0;

  // Prepare chart data
  const chartData = latestScoresArray.map((score) => ({
    name: frameworkLabels[score.framework as keyof typeof frameworkLabels] || score.framework,
    value: Math.round((score.score / score.maxScore) * 100),
    fill: score.score / score.maxScore >= 0.8 ? "#10b981" : score.score / score.maxScore >= 0.6 ? "#f59e0b" : "#ef4444",
  }));

  const radialData = [{
    name: "Overall Compliance",
    value: overallScore,
    fill: overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444",
  }];

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) {
      return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Compliant</Badge>;
    }
    if (percentage >= 60) {
      return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Partially Compliant</Badge>;
    }
    return <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Non-Compliant</Badge>;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Compliance" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Compliance Dashboard
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Monitor your organization's compliance with industry standards
                </p>
              </div>
              
              <Dialog open={isNewAssessmentDialogOpen} onOpenChange={setIsNewAssessmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start Compliance Assessment</DialogTitle>
                    <DialogDescription>
                      Initiate a new compliance assessment for your organization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="framework">Compliance Framework *</Label>
                      <Select
                        value={newAssessment.framework}
                        onValueChange={(value) => setNewAssessment({ ...newAssessment, framework: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iso_27001">ISO 27001</SelectItem>
                          <SelectItem value="soc2">SOC 2</SelectItem>
                          <SelectItem value="gdpr">GDPR</SelectItem>
                          <SelectItem value="hipaa">HIPAA</SelectItem>
                          <SelectItem value="pci_dss">PCI DSS</SelectItem>
                        </SelectContent>
                      </Select>
                      {newAssessment.framework && (
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                          {frameworkDescriptions[newAssessment.framework as keyof typeof frameworkDescriptions]}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewAssessmentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAssessment}
                      disabled={createAssessmentMutation.isPending}
                    >
                      {createAssessmentMutation.isPending ? "Starting..." : "Start Assessment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Overall Score
                      </p>
                      <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                        {overallScore}%
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Across all frameworks
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Frameworks
                      </p>
                      <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                        {latestScoresArray.length}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Being monitored
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                        Compliant
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {latestScoresArray.filter(score => (score.score / score.maxScore) >= 0.8).length}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Frameworks
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
                        Needs Attention
                      </p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {latestScoresArray.filter(score => (score.score / score.maxScore) < 0.8).length}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Frameworks
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Compliance Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" data={radialData}>
                        <RadialBar dataKey="value" cornerRadius={10} />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-3xl font-bold">
                          {overallScore}%
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Framework Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Framework Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground dark:text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Framework Details */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Framework Status</CardTitle>
              </CardHeader>
              <CardContent>
                {scoresLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-2 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : latestScoresArray.length > 0 ? (
                  <div className="space-y-4">
                    {latestScoresArray.map((score: ComplianceScore) => {
                      const percentage = Math.round((score.score / score.maxScore) * 100);
                      return (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                              <FileCheck className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-card-foreground dark:text-card-foreground">
                                {frameworkLabels[score.framework as keyof typeof frameworkLabels] || score.framework}
                              </h3>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                {frameworkDescriptions[score.framework as keyof typeof frameworkDescriptions]}
                              </p>
                              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                                Last assessed: {format(new Date(score.assessmentDate), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            {getScoreBadge(percentage)}
                            <div className="w-32">
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                                {score.score}/{score.maxScore} ({percentage}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileCheck className="h-16 w-16 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
                      No Compliance Assessments
                    </h3>
                    <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                      Start your first compliance assessment to monitor your organization's regulatory compliance.
                    </p>
                    <Button onClick={() => setIsNewAssessmentDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Start First Assessment
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
