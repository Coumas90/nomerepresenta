import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const RecentSessionsTable = () => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('analytics_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      return data;
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones Recientes (Últimas 20)</CardTitle>
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
        <CardTitle>Sesiones Recientes (Últimas 20)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Referrer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-mono text-xs">
                  {session.session_id.substring(0, 20)}...
                </TableCell>
                <TableCell className="capitalize">{session.device_type || '-'}</TableCell>
                <TableCell>
                  {format(new Date(session.started_at), 'dd MMM yyyy HH:mm', { locale: es })}
                </TableCell>
                <TableCell>{formatDuration(session.total_duration_seconds)}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {session.referrer || 'Directo'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!sessions || sessions.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No hay sesiones disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSessionsTable;
