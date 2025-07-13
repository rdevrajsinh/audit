import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const vulnerabilityData = [
  { day: "Mon", critical: 12, high: 8, medium: 5 },
  { day: "Tue", critical: 19, high: 12, medium: 8 },
  { day: "Wed", critical: 15, high: 10, medium: 6 },
  { day: "Thu", critical: 25, high: 15, medium: 10 },
  { day: "Fri", critical: 22, high: 13, medium: 8 },
  { day: "Sat", critical: 18, high: 11, medium: 7 },
  { day: "Sun", critical: 23, high: 16, medium: 9 },
];

const assetData = [
  { name: "Web Apps", value: 45, color: "#3b82f6" },
  { name: "Servers", value: 32, color: "#10b981" },
  { name: "Databases", value: 18, color: "#f59e0b" },
  { name: "Cloud Services", value: 25, color: "#ef4444" },
  { name: "Network Devices", value: 7, color: "#8b5cf6" },
];

export default function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vulnerability Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vulnerability Trends</CardTitle>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" className="text-xs">
                7 Days
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                30 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vulnerabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#dc2626"
                  strokeWidth={2}
                  name="Critical"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#ea580c"
                  strokeWidth={2}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#d97706"
                  strokeWidth={2}
                  name="Medium"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Asset Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
