import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    case "high":
      return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    case "medium":
      return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    case "low":
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    default:
      return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  }
}

function getSeverityBadge(severity: string, count: number) {
  const variants = {
    critical: "destructive",
    high: "secondary",
    medium: "secondary",
    low: "secondary",
    clean: "secondary",
  } as const;

  const colors = {
    critical: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    high: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
    medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    low: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    clean: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  };

  return (
    <Badge className={colors[severity as keyof typeof colors] || colors.clean}>
      {count > 0 ? `${count} ${severity}` : "Clean"}
    </Badge>
  );
}

export default function RecentActivity() {
  const { data: scans, isLoading } = useQuery({
    queryKey: ["/api/scans"],
  });

  const recentScans = scans?.slice(0, 3) || [];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Scan Results</CardTitle>
          <Button variant="link" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : recentScans.length > 0 ? (
            recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    {getSeverityIcon(scan.status)}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground dark:text-card-foreground">
                      {scan.name}
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {scan.type === "vulnerability" ? "Vulnerability Scan" : 
                       scan.type === "iam" ? "IAM Audit" :
                       scan.type === "cloud_config" ? "Cloud Config Audit" : "Asset Discovery"}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {scan.createdAt ? format(new Date(scan.createdAt), "MMM d, yyyy 'at' h:mm a") : "Recently"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getSeverityBadge(
                    scan.status === "completed" ? "clean" : scan.status,
                    0
                  )}
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                    {scan.status === "completed" ? "Completed" : 
                     scan.status === "running" ? "In Progress" : "Pending"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground dark:text-muted-foreground">
                No recent scans found. Start your first scan to see results here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
