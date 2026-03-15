import { useState, useMemo } from "react";
import { subDays, subHours, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Search,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  useSessionLog,
  type SessionLogFilters,
  type SortField,
  type SortDirection,
  type SessionLogEntry,
  type UserEventDetail,
} from "@/hooks/useSessionLog";

interface SessionLogTableProps {
  startDate: Date;
  endDate: Date;
}

const PAGE_SIZE = 100;

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

const SessionLogTable = ({ startDate: parentStart, endDate: parentEnd }: SessionLogTableProps) => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<SessionLogFilters>({});
  const [sortField, setSortField] = useState<SortField>("started_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localPreset, setLocalPreset] = useState<string>("parent");

  const { startDate, endDate } = useMemo(() => {
    if (localPreset === "24h") return { startDate: subHours(new Date(), 24), endDate: new Date() };
    if (localPreset === "7d") return { startDate: startOfDay(subDays(new Date(), 7)), endDate: endOfDay(new Date()) };
    if (localPreset === "30d") return { startDate: startOfDay(subDays(new Date(), 30)), endDate: endOfDay(new Date()) };
    return { startDate: parentStart, endDate: parentEnd };
  }, [localPreset, parentStart, parentEnd]);

  const { data, isLoading } = useSessionLog(
    startDate,
    endDate,
    page,
    PAGE_SIZE,
    filters,
    sortField,
    sortDirection
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(0);
  };

  const updateFilter = (key: keyof SessionLogFilters, value: string | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const exportCSV = () => {
    if (!data?.sessions.length) return;
    const headers = [
      "Started At",
      "Duration",
      "Source",
      "Country",
      "City",
      "Device",
      "Browser",
      "OS",
      "Landing Page",
      "Pages Viewed",
      "Visitor Path",
      "New/Returning",
    ];
    const rows = data.sessions.map((s) => [
      s.started_at,
      formatDuration(s.duration_seconds),
      s.source,
      s.country_name || "",
      s.city || "",
      s.device_type || "",
      s.browser,
      s.os,
      s.landing_page,
      s.pages_viewed,
      s.visitor_path.join(" → "),
      s.is_returning ? "Returning" : "New",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sessions-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Session Log</CardTitle>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.totalCount} sessions` : "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: "Last 24h", value: "24h" },
              { label: "7 days", value: "7d" },
              { label: "30 days", value: "30d" },
              { label: "Custom", value: "parent" },
            ].map((p) => (
              <Button
                key={p.value}
                variant={localPreset === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => { setLocalPreset(p.value); setPage(0); }}
              >
                {p.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!data?.sessions.length}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <SessionLogFiltersBar
          filters={filters}
          onFilterChange={updateFilter}
          availableSources={data?.availableSources || []}
          availableCountries={data?.availableCountries || []}
        />

        {isLoading ? (
          <Skeleton className="h-[400px]" />
        ) : !data || data.sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No sessions found for this period.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>
                      <SortButton field="started_at" current={sortField} direction={sortDirection} onToggle={toggleSort}>
                        Started
                      </SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="duration_seconds" current={sortField} direction={sortDirection} onToggle={toggleSort}>
                        Duration
                      </SortButton>
                    </TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Landing Page</TableHead>
                    <TableHead>
                      <SortButton field="pages_viewed" current={sortField} direction={sortDirection} onToggle={toggleSort}>
                        Pages
                      </SortButton>
                    </TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      isExpanded={expandedId === session.id}
                      onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Filters Bar ────────────────────────────────────────
interface FiltersBarProps {
  filters: SessionLogFilters;
  onFilterChange: (key: keyof SessionLogFilters, value: string | boolean | undefined) => void;
  availableSources: string[];
  availableCountries: string[];
}

const SessionLogFiltersBar = ({ filters, onFilterChange, availableSources, availableCountries }: FiltersBarProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={filters.search || ""}
        onChange={(e) => onFilterChange("search", e.target.value || undefined)}
        className="pl-8 h-9 w-[180px] text-sm"
      />
    </div>
    <Select value={filters.source || "all"} onValueChange={(v) => onFilterChange("source", v === "all" ? undefined : v)}>
      <SelectTrigger className="h-9 w-[140px] text-sm">
        <SelectValue placeholder="Source" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Sources</SelectItem>
        {availableSources.map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={filters.country || "all"} onValueChange={(v) => onFilterChange("country", v === "all" ? undefined : v)}>
      <SelectTrigger className="h-9 w-[140px] text-sm">
        <SelectValue placeholder="Country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Countries</SelectItem>
        {availableCountries.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={filters.deviceType || "all"} onValueChange={(v) => onFilterChange("deviceType", v === "all" ? undefined : v)}>
      <SelectTrigger className="h-9 w-[120px] text-sm">
        <SelectValue placeholder="Device" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Devices</SelectItem>
        <SelectItem value="desktop">Desktop</SelectItem>
        <SelectItem value="mobile">Mobile</SelectItem>
        <SelectItem value="tablet">Tablet</SelectItem>
      </SelectContent>
    </Select>
    <Select
      value={filters.isReturning || "all"}
      onValueChange={(v) => onFilterChange("isReturning", v === "all" ? undefined : v)}
    >
      <SelectTrigger className="h-9 w-[130px] text-sm">
        <SelectValue placeholder="Visitor type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Visitors</SelectItem>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="returning">Returning</SelectItem>
      </SelectContent>
    </Select>
    <Button
      variant={filters.highIntent ? "default" : "outline"}
      size="sm"
      className="h-9 text-sm"
      onClick={() => onFilterChange("highIntent", filters.highIntent ? undefined : true)}
    >
      <Zap className="h-3.5 w-3.5 mr-1" />
      High Intent
    </Button>
  </div>
);

// ─── Sort Button ────────────────────────────────────────
interface SortButtonProps {
  field: SortField;
  current: SortField;
  direction: SortDirection;
  onToggle: (field: SortField) => void;
  children: React.ReactNode;
}

const SortButton = ({ field, current, direction, onToggle, children }: SortButtonProps) => (
  <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => onToggle(field)}>
    {children}
    {current === field ? (
      direction === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
    ) : (
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    )}
  </button>
);

// ─── Session Row ────────────────────────────────────────
interface SessionRowProps {
  session: SessionLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const SessionRow = ({ session, isExpanded, onToggle }: SessionRowProps) => {
  const truncatedPath = session.visitor_path
    .map((p) => (p === "/" ? "Home" : p.split("/").filter(Boolean)[0] || p))
    .slice(0, 4)
    .join(" → ");

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow className="cursor-pointer hover:bg-muted/50">
            <TableCell>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </TableCell>
            <TableCell className="text-sm whitespace-nowrap">
              {format(new Date(session.started_at), "MMM dd, HH:mm")}
            </TableCell>
            <TableCell className="text-sm font-medium">{formatDuration(session.duration_seconds)}</TableCell>
            <TableCell className="text-sm">{session.source}</TableCell>
            <TableCell className="text-sm">
              {[session.city, session.country_name].filter(Boolean).join(", ") || "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
              {session.landing_page}
            </TableCell>
            <TableCell className="text-sm text-center">{session.pages_viewed}</TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{truncatedPath}</TableCell>
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
            <td colSpan={10} className="p-0">
              <SessionDetail session={session} />
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};

// ─── Event label helper ─────────────────────────────────
const EVENT_LABELS: Record<string, string> = {
  pricelist_select: "Selected work",
  pricelist_unselect: "Unselected work",
  pricelist_inquiry_open: "Opened inquiry form",
  pricelist_inquiry_sent: "Sent inquiry",
  pricelist_download_pdf: "Downloaded PDF",
  contact_click: "Clicked contact",
  email_click: "Clicked email",
};

const formatEventLabel = (event: UserEventDetail) => {
  const label = EVENT_LABELS[event.event_type] || event.event_type;
  const data = event.event_data;
  if (!data) return label;

  const extras: string[] = [];
  if (data.artwork_id) extras.push(`artwork: ${String(data.artwork_id).slice(0, 8)}…`);
  if (data.pricelist) extras.push(`list: ${String(data.pricelist)}`);
  if (data.selected_count) extras.push(`${data.selected_count} works`);
  return extras.length ? `${label} (${extras.join(", ")})` : label;
};

// ─── Session Detail Panel ───────────────────────────────
const SessionDetail = ({ session }: { session: SessionLogEntry }) => (
  <div className="bg-muted/30 border-t px-6 py-4 space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground text-xs">Session Started</p>
        <p className="font-medium">{format(new Date(session.started_at), "MMM dd, yyyy HH:mm:ss")}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Duration</p>
        <p className="font-medium">{formatDuration(session.duration_seconds)}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Source</p>
        <p className="font-medium">{session.source}</p>
        {session.referrer && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{session.referrer}</p>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Location</p>
        <p className="font-medium">
          {[session.city, session.country_name].filter(Boolean).join(", ") || "Unknown"}
        </p>
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

    {/* Full visitor path with computed durations */}
    {session.page_details.length > 0 && (
      <div>
        <p className="text-xs text-muted-foreground mb-2">Visitor Path ({session.page_details.length} pages)</p>
        <div className="space-y-0.5">
          {session.page_details.map((pd, i) => {
            // Compute time on page from consecutive timestamps
            const currentTime = new Date(pd.viewed_at).getTime();
            const nextTime = i < session.page_details.length - 1
              ? new Date(session.page_details[i + 1].viewed_at).getTime()
              : null;
            // Use DB value if available, otherwise compute from next page view
            const timeOnPage = (pd.time_on_page_seconds != null && pd.time_on_page_seconds > 0)
              ? pd.time_on_page_seconds
              : nextTime
                ? Math.max(0, Math.floor((nextTime - currentTime) / 1000))
                : null;

            return (
              <div
                key={`${pd.page_path}-${i}`}
                className="flex items-center gap-3 text-sm py-1 px-2 rounded hover:bg-muted/50"
              >
                <span className="text-xs text-muted-foreground w-[70px] shrink-0 font-mono">
                  {format(new Date(pd.viewed_at), "HH:mm:ss")}
                </span>
                <span className="text-muted-foreground shrink-0">→</span>
                <span className="font-medium flex-1 truncate">{pd.page_path}</span>
                {timeOnPage != null && (
                  <span className="text-xs font-mono shrink-0 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {timeOnPage < 60 ? `${timeOnPage}s` : `${Math.floor(timeOnPage / 60)}m ${timeOnPage % 60}s`}
                  </span>
                )}
                {timeOnPage == null && (
                  <span className="text-xs text-muted-foreground/50 shrink-0 italic">last page</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* User events / activity log */}
    {session.user_events.length > 0 && (
      <div>
        <p className="text-xs text-muted-foreground mb-2">Activity Log</p>
        <div className="space-y-1">
          {session.user_events.map((ev, i) => (
            <div key={`${ev.event_type}-${i}`} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-muted-foreground w-[100px] shrink-0">
                {format(new Date(ev.created_at), "HH:mm:ss")}
              </span>
              <span className="font-medium">{formatEventLabel(ev)}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {session.utm_source && (
      <div className="text-xs text-muted-foreground">
        UTM: {[session.utm_source, session.utm_medium, session.utm_campaign].filter(Boolean).join(" / ")}
      </div>
    )}
  </div>
);

export default SessionLogTable;
