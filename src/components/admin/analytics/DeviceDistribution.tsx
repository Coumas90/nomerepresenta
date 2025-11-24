import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeviceDistribution } from "@/hooks/useAudienceAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Smartphone, Tablet, Monitor } from "lucide-react";

interface DeviceDistributionProps {
  startDate: Date;
  endDate: Date;
}

const COLORS = {
  mobile: '#ec4899',
  tablet: '#f59e0b',
  desktop: '#8b5cf6',
  unknown: '#6b7280',
};

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    case 'desktop':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const DeviceDistribution = ({ startDate, endDate }: DeviceDistributionProps) => {
  const { data: devices, isLoading } = useDeviceDistribution(startDate, endDate);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No device data available.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = devices.map(d => ({
    name: d.device_type,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.unknown} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-3">
          {devices.map((device) => (
            <div key={device.device_type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <DeviceIcon type={device.device_type} />
                <span className="font-medium capitalize">{device.device_type}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{device.count} sessions</div>
                <div className="text-sm text-muted-foreground">{device.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceDistribution;
