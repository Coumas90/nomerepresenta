import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Download, Monitor, Smartphone, Tablet, ShoppingBag, Eye, Send, MousePointerClick } from "lucide-react";
import { format } from "date-fns";
import { usePricelistAnalytics, type PricelistSessionData } from "@/hooks/usePricelistAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

interface PricelistEvent {
  event_type: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

const PRICELIST_EVENT_TYPES = [
  "pricelist_artwork_view",
  "pricelist_select",
  "pricelist_unselect",
  "pricelist_inquiry_open",
  "pricelist_inquiry_sent",
  "pricelist_download_pdf",
];

const useSessionPricelistEvents = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["pricelist-session-events", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from("user_events")
        .select("event_type, event_data, created_at")
        .eq("session_id", sessionId)
        .in("event_type", PRICELIST_EVENT_TYPES)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as PricelistEvent[];
    },
    enabled: !!sessionId,
  });
};

const eventLabel = (type: string) => {
  switch (type) {
    case "pricelist_artwork_view": return "Viewed artwork";
    case "pricelist_select": return "Selected artwork";
    case "pricelist_unselect": return "Deselected artwork";
    case "pricelist_inquiry_open": return "Opened inquiry form";
    case "pricelist_inquiry_sent": return "Sent inquiry";
    case "pricelist_download_pdf": return "Downloaded PDF";
    default: return type;
  }
};

const eventIcon = (type: string) => {
  switch (type) {
    case "pricelist_artwork_view": return <Eye className="h-3 w-3 text-blue-500" />;
    case "pricelist_select": return <MousePointerClick className="h-3 w-3 text-green-500" />;
    case "pricelist_unselect": return <MousePointerClick className="h-3 w-3 text-muted-foreground" />;
    case "pricelist_inquiry_open": return <Send className="h-3 w-3 text-amber-500" />;
    case "pricelist_inquiry_sent": return <Send className="h-3 w-3 text-green-600" />;
    case "pricelist_download_pdf": return <Download className="h-3 w-3 text-purple-500" />;
    default: return null;
  }
};

const PricelistSessionLog = ({ startDate, endDate }: PricelistSessionLogProps) => {
  const { data, isLoading } = usePricelistAnalytics(startDate, endDate);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [sortBySlug, setSortBySlug] = useState<"none" | "asc" | "desc">("none");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const slugs = data?.bySlug.map((s) => s.slug) || [];
  const filtered = selectedSlug === "all"
    ? data?.sessions || []
    : (data?.sessions || []).filter((s) => s.slug === selectedSlug);

  const sessions = sortBySlug === "none"
    ? filtered
    : [...filtered].sort((a, b) => {
        const cmp = a.slug.localeCompare(b.slug);
        return sortBySlug === "asc" ? cmp : -cmp;
      });

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
                      onToggle={() => {
                        setExpandedId(isExpanded ? null : rowId);
                        setExpandedSessionId(isExpanded ? null : session.session_id);
                      }}
                      expandedSessionId={isExpanded ? session.session_id : null}
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
  expandedSessionId: string | null;
}

const PricelistSessionRow = ({ session, isExpanded, onToggle, expandedSessionId }: RowProps) => {
  const { data: events = [], isLoading: eventsLoading } = useSessionPricelistEvents(expandedSessionId);

  const artworksViewed = events.filter((e) => e.event_type === "pricelist_artwork_view");
  const inquiryOpened = events.some((e) => e.event_type === "pricelist_inquiry_open");
  const inquirySent = events.some((e) => e.event_type === "pricelist_inquiry_sent");

  return (
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
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded ${session.is_returning ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>
                  {session.is_returning ? "Returning" : "New"}
                </span>
                {session.visit_count > 1 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    {session.visit_count}×
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <tr>
            <td colSpan={8} className="p-0">
              <div className="bg-muted/30 border-t px-6 py-4 space-y-4">
                {/* Session metadata */}
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

                {/* Engagement summary */}
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Engagement</p>
                  {eventsLoading ? (
                    <Skeleton className="h-8 w-48" />
                  ) : events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No interactions recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Quick summary badges */}
                      <div className="flex flex-wrap gap-2">
                        {artworksViewed.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            <Eye className="h-3 w-3" />
                            {artworksViewed.length} artwork{artworksViewed.length !== 1 ? "s" : ""} viewed
                          </span>
                        )}
                        {inquiryOpened && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                            inquirySent
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                          }`}>
                            <Send className="h-3 w-3" />
                            {inquirySent ? "Inquiry sent ✓" : "Opened inquiry (not sent)"}
                          </span>
                        )}
                      </div>

                      {/* Detailed event timeline */}
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {events.map((event, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {eventIcon(event.event_type)}
                            <span className="text-muted-foreground">
                              {format(new Date(event.created_at), "HH:mm:ss")}
                            </span>
                            <span>{eventLabel(event.event_type)}</span>
                            {event.event_data && (event.event_data as Record<string, unknown>).artwork_title && (
                              <span className="text-muted-foreground italic truncate max-w-[200px]">
                                — {(event.event_data as Record<string, unknown>).artwork_title as string}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};

export default PricelistSessionLog;
