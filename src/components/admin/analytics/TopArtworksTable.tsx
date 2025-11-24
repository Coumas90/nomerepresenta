import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTopArtworks } from "@/hooks/useArtworkAnalytics";

interface TopArtworksTableProps {
  startDate: Date;
  endDate: Date;
}

const TopArtworksTable = ({ startDate, endDate }: TopArtworksTableProps) => {
  const { data: artworks, isLoading } = useTopArtworks(startDate, endDate, 10);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Obras Más Vistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Obras Más Vistas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Serie</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead className="text-right">Sesiones Únicas</TableHead>
              <TableHead className="text-right">Tiempo Promedio</TableHead>
              <TableHead className="text-right">Hovers</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks?.map((artwork, index) => (
              <TableRow key={artwork.artwork_id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{artwork.title}</TableCell>
                <TableCell className="text-muted-foreground">{artwork.series_name}</TableCell>
                <TableCell className="text-right">{artwork.total_views}</TableCell>
                <TableCell className="text-right">{artwork.unique_sessions}</TableCell>
                <TableCell className="text-right">{formatDuration(artwork.avg_view_duration)}</TableCell>
                <TableCell className="text-right">{artwork.total_hovers}</TableCell>
                <TableCell className="text-right">{artwork.detail_clicks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!artworks || artworks.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No hay datos disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopArtworksTable;
