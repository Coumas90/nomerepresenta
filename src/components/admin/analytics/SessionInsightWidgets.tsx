import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopLandingPages, useCommonPaths } from "@/hooks/useSessionLog";
import { MapPin, Route, TrendingUp } from "lucide-react";

interface WidgetsProps {
  startDate: Date;
  endDate: Date;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

export const TopLandingPagesCard = ({ startDate, endDate }: WidgetsProps) => {
  const { data, isLoading } = useTopLandingPages(startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Top Landing Pages</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Avg. Duration</TableHead>
                <TableHead className="text-right">Bounce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lp) => (
                <TableRow key={lp.page}>
                  <TableCell className="font-medium text-sm">{lp.page}</TableCell>
                  <TableCell className="text-right text-sm">{lp.sessions}</TableCell>
                  <TableCell className="text-right text-sm">{formatDuration(lp.avgDuration)}</TableCell>
                  <TableCell className="text-right text-sm">{lp.bounceRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const CommonPathsCard = ({ startDate, endDate }: WidgetsProps) => {
  const { data, isLoading } = useCommonPaths(startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Most Common Paths</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No path data yet.</p>
        ) : (
          <div className="space-y-3">
            {data.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <span className="text-muted-foreground text-xs w-5 shrink-0">{i + 1}.</span>
                  <span className="truncate">{p.path}</span>
                </div>
                <span className="text-sm font-medium shrink-0">{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
