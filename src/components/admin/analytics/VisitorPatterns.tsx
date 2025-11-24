import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVisitorPatterns, useBounceRate } from "@/hooks/useAudienceAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserX } from "lucide-react";

interface VisitorPatternsProps {
  startDate: Date;
  endDate: Date;
}

const VisitorPatterns = ({ startDate, endDate }: VisitorPatternsProps) => {
  const { data: patterns, isLoading: patternsLoading } = useVisitorPatterns(startDate, endDate);
  const { data: bounceRate, isLoading: bounceLoading } = useBounceRate(startDate, endDate);

  if (patternsLoading || bounceLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitor Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pattern data available.</p>
        </CardContent>
      </Card>
    );
  }

  const totalVisitors = patterns.newVisitors + patterns.returningVisitors;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.newVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {totalVisitors > 0 ? Math.round((patterns.newVisitors / totalVisitors) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.returningVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {totalVisitors > 0 ? Math.round((patterns.returningVisitors / totalVisitors) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Single-page sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
          <p className="text-sm text-muted-foreground">Sessions by hour of day</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patterns.hourly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(hour) => `${hour}:00`}
                formatter={(value) => [value, 'Sessions']}
              />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Pattern</CardTitle>
          <p className="text-sm text-muted-foreground">Sessions by day of week</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patterns.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorPatterns;
