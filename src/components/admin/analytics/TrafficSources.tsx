import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrafficSources } from "@/hooks/useAudienceAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Home } from "lucide-react";

interface TrafficSourcesProps {
  startDate: Date;
  endDate: Date;
}

const TrafficSources = ({ startDate, endDate }: TrafficSourcesProps) => {
  const { data: sources, isLoading } = useTrafficSources(startDate, endDate);

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

  if (!sources || sources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No traffic source data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <p className="text-sm text-muted-foreground">Where your visitors are coming from</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source, idx) => (
              <TableRow key={`${source.referrer}-${idx}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {source.referrer === 'Direct' ? (
                      <Home className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                    {source.referrer}
                  </div>
                </TableCell>
                <TableCell className="text-right">{source.visitors}</TableCell>
                <TableCell className="text-right">{source.sessions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TrafficSources;
