import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Download, Monitor, Smartphone, Tablet, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { usePricelistAnalytics, type PricelistSessionData } from "@/hooks/usePricelistAnalytics";

interface PricelistSessionLogProps {
  startDate: Date;
  endDate: Date;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const deviceIcon = (type: string | null) => {
  if (type === "mobile") return <Smartphone className="h-3.5 w-3.5" />;
  if (type === "tablet") return <Tablet className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
};

const PricelistSessionLog = ({ startDate, endDate }: PricelistSessionLogProps) => {
  const { data, isLoading } = usePricelistAnalytics(startDate, endDate);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const slugs = data?.bySlug.map((s) => s.slug) || [];
  const sessions = selectedSlug === "all"
    ? data?.sessions || []
    : (data?.sessions || []).filter((s) => s.slug === selectedSlug);

  const exportCSV = () => {
    if (!sessions.length) return;
    const headers = ["Slug", "Date", "Duration", "Source", "Device", "Browser", "OS", "Country", "City", "New/Returning"];
    const rows = sessions.map((s) => [
      s.slug, s.viewed_at, formatDuration(s.time_on_page_seconds || 0),
      s.source, s.device_type || "", s.browser, s.os,
      s.country_name || "", s.city || "", s.is_returning ? "Returning" : "New",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pricelist-sessions-${format(startDate, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Pricelist Session Log</CardTitle>
              <p className="text-xs text-muted-foreground">
                {sessions.length} session{sessions.length !== 1 ? "s" : ""} across pricelist links
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue placeholder="All slugs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All links</SelectItem>
                {slugs.map((slug) => (
                  <SelectItem key={slug} value={slug}>/selected/{slug}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!sessions.length}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px]" />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No pricelist sessions found. Share a /selected/ link to start tracking.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Link</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 50).map((session, i) => {
                  const rowId = `${session.session_id}-${i}`;
                  const isExpanded = expandedId === rowId;
                  return (
                    <PricelistSessionRow
                      key={rowId}
                      session={session}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedId(isExpanded ? null : rowId)}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface RowProps {
  session: PricelistSessionData;
  isExpanded: boolean;
  onToggle: () => void;
}

const PricelistSessionRow = ({ session, isExpanded, onToggle }: RowProps) => (
  <Collapsible open={isExpanded} onOpenChange={onToggle} asChild>
    <>
      <CollapsibleTrigger asChild>
        <TableRow className="cursor-pointer hover:bg-muted/50">
          <TableCell>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </TableCell>
          <TableCell className="text-sm font-medium">/selected/{session.slug}</TableCell>
          <TableCell className="text-sm whitespace-nowrap">
            {format(new Date(session.viewed_at), "MMM dd, HH:mm")}
          </TableCell>
          <TableCell className="text-sm">{formatDuration(session.time_on_page_seconds || 0)}</TableCell>
          <TableCell className="text-sm">{session.source}</TableCell>
          <TableCell className="text-sm">
            {[session.city, session.country_name].filter(Boolean).join(", ") || "—"}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1 text-muted-foreground">
              {deviceIcon(session.device_type)}
            </div>
          </TableCell>
          <TableCell>
            <span className={`text-xs px-1.5 py-0.5 rounded ${session.is_returning ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>
              {session.is_returning ? "Returning" : "New"}
            </span>
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-muted/30 border-t px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Viewed At</p>
                  <p className="font-medium">{format(new Date(session.viewed_at), "MMM dd, yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Time on Page</p>
                  <p className="font-medium">{formatDuration(session.time_on_page_seconds || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Source</p>
                  <p className="font-medium">{session.source}</p>
                  {session.referrer && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{session.referrer}</p>}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="font-medium">{[session.city, session.country_name].filter(Boolean).join(", ") || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Device</p>
                  <p className="font-medium capitalize">{session.device_type || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Browser</p>
                  <p className="font-medium">{session.browser}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">OS</p>
                  <p className="font-medium">{session.os}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Session ID</p>
                  <p className="font-mono text-xs truncate">{session.session_id}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </>
  </Collapsible>
);

export default PricelistSessionLog;
