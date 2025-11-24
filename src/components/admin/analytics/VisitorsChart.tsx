import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDailyVisitors } from "@/hooks/useAnalyticsStats";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

interface VisitorsChartProps {
  startDate: Date;
  endDate: Date;
}

const VisitorsChart = ({ startDate, endDate }: VisitorsChartProps) => {
  const { data: dailyData, isLoading } = useDailyVisitors(startDate, endDate);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitantes por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const chartData = dailyData?.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    visitors: d.visitors,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitantes por Día</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="visitors" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default VisitorsChart;
