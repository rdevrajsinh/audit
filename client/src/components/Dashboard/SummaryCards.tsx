import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, AlertTriangle, CheckCircle, Search, TrendingUp } from "lucide-react";

export default function SummaryCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Assets",
      value: metrics?.totalAssets || 0,
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: Server,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Critical Issues",
      value: metrics?.criticalVulnerabilities || 0,
      change: "Requires immediate attention",
      changeType: "negative" as const,
      icon: AlertTriangle,
      bgColor: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Compliance Score",
      value: `${metrics?.averageComplianceScore || 0}%`,
      change: "ISO 27001 Assessment",
      changeType: "neutral" as const,
      icon: CheckCircle,
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Active Scans",
      value: metrics?.activeScans || 0,
      change: "Running now",
      changeType: "neutral" as const,
      icon: Search,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card dark:bg-card border-border dark:border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-card-foreground dark:text-card-foreground">
                  {card.value}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    card.changeType === "positive"
                      ? "text-green-600 dark:text-green-400"
                      : card.changeType === "negative"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground dark:text-muted-foreground"
                  }`}
                >
                  {card.changeType === "positive" && <TrendingUp className="inline h-3 w-3 mr-1" />}
                  {card.changeType === "negative" && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
