import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Plus, FileText, Calendar } from "lucide-react";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complianceScores } = useQuery({
    queryKey: ["/api/compliance"],
  });

  const startScanMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/scans", {
        name: "Quick Vulnerability Scan",
        type: "vulnerability",
      }),
    onSuccess: () => {
      toast({
        title: "Scan Started",
        description: "Your vulnerability scan has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/reports", {
        name: "Executive Summary Report",
        type: "executive",
        parameters: {},
      }),
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Your executive report is being generated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const latestCompliance = complianceScores?.slice(0, 3) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => startScanMutation.mutate()}
            disabled={startScanMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" />
            Start New Scan
          </Button>
          
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          
          <Button variant="outline" className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Audit
          </Button>
        </div>

        {/* Compliance Quick View */}
        <div className="mt-6 pt-6 border-t border-border dark:border-border">
          <h4 className="text-sm font-semibold text-card-foreground dark:text-card-foreground mb-3">
            Compliance Status
          </h4>
          <div className="space-y-3">
            {latestCompliance.length > 0 ? (
              latestCompliance.map((score) => {
                const percentage = Math.round((score.score / score.maxScore) * 100);
                const getProgressColor = (percent: number) => {
                  if (percent >= 80) return "bg-green-500";
                  if (percent >= 60) return "bg-yellow-500";
                  return "bg-red-500";
                };

                return (
                  <div key={`${score.framework}-${score.id}`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-muted-foreground">
                        {score.framework === "iso_27001" ? "ISO 27001" :
                         score.framework === "soc2" ? "SOC 2" :
                         score.framework === "gdpr" ? "GDPR" : score.framework}
                      </span>
                      <span className="font-medium text-card-foreground dark:text-card-foreground">
                        {percentage}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  No compliance assessments yet
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
