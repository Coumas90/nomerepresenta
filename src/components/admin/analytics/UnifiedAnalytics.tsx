import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CalendarIcon, Users, Clock, MousePointerClick, Globe, ExternalLink, Home, Palette, BookOpen, Mail, ArrowDown, Images, ShoppingBag, Monitor, Smartphone, Tablet } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAnalyticsStats } from "@/hooks/useAnalyticsStats";
import { useTopArtworks } from "@/hooks/useArtworkAnalytics";
import { useTrafficSources } from "@/hooks/useAudienceAnalytics";
import { useCountryDistribution } from "@/hooks/useGeographicAnalytics";
import { useStudioAnalytics } from "@/hooks/useStudioAnalytics";
import { useUserEventsAnalytics } from "@/hooks/useUserEventsAnalytics";
import { usePricelistAnalytics } from "@/hooks/usePricelistAnalytics";
import SessionLogTable from "./SessionLogTable";
import PricelistSessionLog from "./PricelistSessionLog";
import { TopLandingPagesCard, CommonPathsCard } from "./SessionInsightWidgets";
import type { DailyVisitors } from "@/types";

const UnifiedAnalytics = () => {
  const [presetDays, setPresetDays] = useState(30);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

  const getDateRange = () => {
    if (customDateRange?.from) {
      return {
        startDate: startOfDay(customDateRange.from),
        endDate: customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(new Date()),
      };
    }
    return {
      startDate: startOfDay(subDays(new Date(), presetDays)),
      endDate: endOfDay(new Date()),
    };
  };

  const { startDate, endDate } = getDateRange();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Visitor traffic, session duration & artwork engagement
        </p>
      </div>

      {/* Date Filter */}
      <DateFilter
        presetDays={presetDays}
        customDateRange={customDateRange}
        onPresetChange={(days) => { setPresetDays(days); setCustomDateRange(undefined); }}
        onDateRangeChange={setCustomDateRange}
      />

      {/* Key Metrics */}
      <KeyMetrics startDate={startDate} endDate={endDate} />

      {/* Visitors Over Time */}
      <VisitorsOverTime startDate={startDate} endDate={endDate} />

      {/* Two columns: Traffic Sources + Countries */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrafficSourcesCard startDate={startDate} endDate={endDate} />
        <CountriesCard startDate={startDate} endDate={endDate} />
      </div>

      {/* Page Engagement: Bio + Works + Contact */}
      <PageEngagementCard startDate={startDate} endDate={endDate} />

      {/* Studio Engagement */}
      <StudioEngagementCard startDate={startDate} endDate={endDate} />

      {/* Pricelist / Available Analytics */}
      <PricelistAnalyticsCard startDate={startDate} endDate={endDate} />

      {/* Pricelist Session Log */}
      <PricelistSessionLog startDate={startDate} endDate={endDate} />

      {/* Session Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopLandingPagesCard startDate={startDate} endDate={endDate} />
        <CommonPathsCard startDate={startDate} endDate={endDate} />
      </div>

      {/* Session Log */}
      <SessionLogTable startDate={startDate} endDate={endDate} />
    </div>
  );
};

// ─── Date Filter ────────────────────────────────────────
interface DateFilterProps {
  presetDays: number;
  customDateRange: DateRange | undefined;
  onPresetChange: (days: number) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const DateFilter = ({ presetDays, customDateRange, onPresetChange, onDateRangeChange }: DateFilterProps) => {
  const isCustom = customDateRange?.from !== undefined;
  const presets = [
    { label: "7 days", days: 7 },
    { label: "30 days", days: 30 },
    { label: "90 days", days: 90 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Period:</span>
      {presets.map((p) => (
        <Button
          key={p.days}
          variant={!isCustom && presetDays === p.days ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange(p.days)}
        >
          {p.label}
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={isCustom ? "default" : "outline"} size="sm" className="font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {customDateRange?.from ? (
              customDateRange.to
                ? `${format(customDateRange.from, "MMM dd")} – ${format(customDateRange.to, "MMM dd, yyyy")}`
                : format(customDateRange.from, "MMM dd, yyyy")
            ) : (
              "Custom range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={customDateRange?.from}
            selected={customDateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {isCustom && (
        <Button variant="ghost" size="sm" onClick={() => { onDateRangeChange(undefined); onPresetChange(30); }}>
          Clear
        </Button>
      )}
    </div>
  );
};

// ─── Key Metrics ────────────────────────────────────────
const KeyMetrics = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: stats, isLoading } = useAnalyticsStats(startDate, endDate);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const metrics = [
    { title: "Total Visitors", value: stats?.totalVisitors || 0, sub: `Last ${daysDiff} days`, icon: Users, color: "text-blue-500" },
    { title: "Avg. Time on Site", value: formatDuration(stats?.avgTimeOnSite || 0), sub: "Per session", icon: Clock, color: "text-purple-500" },
    { title: "Artworks Clicked", value: stats?.uniqueArtworksViewed || 0, sub: "Unique artworks viewed", icon: MousePointerClick, color: "text-orange-500" },
    { title: "Page Views", value: stats?.totalPageViews || 0, sub: "Total pages viewed", icon: Globe, color: "text-green-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
            <m.icon className={cn("h-4 w-4", m.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{m.value}</div>
            <p className="text-xs text-muted-foreground">{m.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Visitors Over Time ─────────────────────────────────
const VisitorsOverTime = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: stats, isLoading } = useAnalyticsStats(startDate, endDate);

  if (isLoading) {
    return <Card><CardContent className="pt-6"><Skeleton className="h-[300px]" /></CardContent></Card>;
  }

  const chartData = (stats?.dailyVisitors || []).map((d: DailyVisitors) => ({
    date: format(new Date(d.date), "MMM dd"),
    visitors: d.visitors,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ─── Traffic Sources ────────────────────────────────────
const TrafficSourcesCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: sources, isLoading } = useTrafficSources(startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <p className="text-xs text-muted-foreground">Where your visitors come from</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : !sources || sources.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No traffic source data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s, i) => (
                <TableRow key={`${s.referrer}-${i}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {s.referrer === "Direct" ? (
                        <Home className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="truncate max-w-[180px]">{s.referrer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{s.visitors}</TableCell>
                  <TableCell className="text-right">{s.sessions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Countries ──────────────────────────────────────────
const CountriesCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: countries, isLoading } = useCountryDistribution(startDate, endDate);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>
        <p className="text-xs text-muted-foreground">Geographic visitor distribution</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : !countries || countries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No geographic data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Avg. Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.slice(0, 8).map((c) => (
                <TableRow key={c.country}>
                  <TableCell className="font-medium">
                    <span className="mr-2 text-lg">{c.country}</span>
                    {c.country_name}
                  </TableCell>
                  <TableCell className="text-right">{c.visitors}</TableCell>
                  <TableCell className="text-right">{formatDuration(c.avg_duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Top Artworks ───────────────────────────────────────
const TopArtworksCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: artworks, isLoading } = useTopArtworks(startDate, endDate, 10);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Viewed Artworks</CardTitle>
        <p className="text-xs text-muted-foreground">Top 10 artworks by views, with click and hover engagement</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : !artworks || artworks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No artwork data yet.</p>
        ) : (
          <>
            {/* Bar chart for quick visual */}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={artworks.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis
                  dataKey="title"
                  type="category"
                  width={140}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="total_views" fill="hsl(var(--primary))" name="Views" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed table */}
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Unique</TableHead>
                  <TableHead className="text-right">Avg. Time</TableHead>
                  <TableHead className="text-right">Detail Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artworks.map((a, i) => (
                  <TableRow key={a.artwork_id}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.series_name}</TableCell>
                    <TableCell className="text-right">{a.total_views}</TableCell>
                    <TableCell className="text-right">{a.unique_sessions}</TableCell>
                    <TableCell className="text-right">{formatDuration(a.avg_view_duration)}</TableCell>
                    <TableCell className="text-right">{a.detail_clicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Page Engagement (Bio, Works, Contact) ─────────────
const PageEngagementCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data, isLoading } = useUserEventsAnalytics(startDate, endDate);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Engagement</CardTitle>
        <p className="text-xs text-muted-foreground">Bio readership, contact interest & gallery interactions</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Bio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Bio</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Visitors</span>
                  <span className="font-medium">{data?.bioVisits || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Time</span>
                  <span className="font-medium">{formatDuration(data?.bioAvgDuration || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Read Complete</span>
                  <span className="font-medium">{data?.bioScrollComplete || 0} ({data?.bioScrollRate || 0}%)</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Contact</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Clicks</span>
                  <span className="font-medium">{data?.contactClicks || 0}</span>
                </div>
                {data?.contactClickSources?.map((s) => (
                  <div key={s.source} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{s.source.replace('_', ' ')}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Works */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">Works Scroll</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Visitors</span>
                  <span className="font-medium">{data?.worksVisits || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scrolled to End</span>
                  <span className="font-medium">{data?.worksScrollComplete || 0} ({data?.worksScrollRate || 0}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gallery Clicks</span>
                  <span className="font-medium">{data?.galleryNavigations || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Artworks Explored</span>
                  <span className="font-medium">{data?.galleryUniqueArtworks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Studio Engagement ─────────────────────────────────
const StudioEngagementCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data, isLoading } = useStudioAnalytics(startDate, endDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Studio Engagement</CardTitle>
            <p className="text-xs text-muted-foreground">Who visited Studio and how far they scrolled</p>
          </div>
          <Palette className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold">{data?.totalStudioVisits || 0}</div>
                <p className="text-xs text-muted-foreground">Total Studio Visitors</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{data?.seriesScrolls?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Series Reached</p>
              </div>
            </div>

            {data?.seriesScrolls && data.seriesScrolls.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.seriesScrolls} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis
                      dataKey="series_name"
                      type="category"
                      width={140}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="unique_sessions" fill="hsl(var(--primary))" name="Visitors" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Series</TableHead>
                      <TableHead className="text-right">Visitors Reached</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.seriesScrolls.map((s) => (
                      <TableRow key={s.series_id}>
                        <TableCell className="font-medium">{s.series_name}</TableCell>
                        <TableCell className="text-right">{s.unique_sessions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No studio scroll data yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Pricelist / Available Analytics ────────────────────
const PricelistAnalyticsCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data, isLoading } = usePricelistAnalytics(startDate, endDate);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const deviceIcon = (device: string) => {
    if (device === "mobile") return <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />;
    if (device === "tablet") return <Tablet className="h-3.5 w-3.5 text-muted-foreground" />;
    return <Monitor className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pricelist (Available) Analytics</CardTitle>
            <p className="text-xs text-muted-foreground">
              Views, duration, device & country for shared pricelist links
            </p>
          </div>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : !data || data.totalViews === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No pricelist views yet. Share a /selected/ link to start tracking.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Summary metrics */}
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold">{data.totalViews}</div>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.uniqueSessions}</div>
                <p className="text-xs text-muted-foreground">Unique Sessions</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatDuration(data.avgDuration)}</div>
                <p className="text-xs text-muted-foreground">Avg. Duration</p>
              </div>
            </div>

            {/* By pricelist slug */}
            {data.bySlug.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">By Pricelist</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Avg. Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.bySlug.map((s) => (
                      <TableRow key={s.slug}>
                        <TableCell className="font-medium">/selection/{s.slug}</TableCell>
                        <TableCell className="text-right">{s.views}</TableCell>
                        <TableCell className="text-right">{s.uniqueSessions}</TableCell>
                        <TableCell className="text-right">{formatDuration(s.avgDuration)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Device & Country side by side */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* By device */}
              {data.byDevice.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">By Device</h4>
                  <div className="space-y-2">
                    {data.byDevice.map((d) => (
                      <div key={d.device} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {deviceIcon(d.device)}
                          <span className="capitalize">{d.device}</span>
                        </div>
                        <span className="font-medium">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By country */}
              {data.byCountry.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">By Country</h4>
                  <div className="space-y-2">
                    {data.byCountry.slice(0, 8).map((c) => (
                      <div key={c.country} className="flex items-center justify-between text-sm">
                        <span>{c.country}</span>
                        <span className="font-medium">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent sessions table */}
            {data.sessions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Sessions</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.sessions.slice(0, 15).map((s, i) => (
                      <TableRow key={`${s.session_id}-${i}`}>
                        <TableCell className="text-sm">{s.slug}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(s.viewed_at), "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDuration(s.time_on_page_seconds || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {deviceIcon(s.device_type || "desktop")}
                            <span className="text-sm capitalize">{s.device_type || "unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {[s.city, s.country_name].filter(Boolean).join(", ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedAnalytics;
