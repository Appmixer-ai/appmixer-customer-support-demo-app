import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats as Stats } from "@/types/support";
import {
  TicketIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
} from "lucide-react";

interface DashboardStatsProps {
  stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Tickets",
      value: stats.totalTickets.toString(),
      icon: TicketIcon,
      description: "All tickets",
      trend: "+12% from last month",
    },
    {
      title: "New Tickets",
      value: stats.newTickets.toString(),
      icon: AlertCircle,
      description: "Awaiting response",
      trend: "+5% from yesterday",
    },
    {
      title: "In Progress",
      value: stats.inProgressTickets.toString(),
      icon: Clock,
      description: "Being worked on",
      trend: "2% decrease",
    },
    {
      title: "Resolved",
      value: stats.resolvedTickets.toString(),
      icon: CheckCircle,
      description: "Completed tickets",
      trend: "+18% this week",
    },
    {
      title: "Avg Response Time",
      value: stats.avgResponseTime,
      icon: TrendingUp,
      description: "First response",
      trend: "15% faster",
    },
    {
      title: "Satisfaction",
      value: `${stats.customerSatisfaction}/5`,
      icon: Star,
      description: "Customer rating",
      trend: "+0.2 this month",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
