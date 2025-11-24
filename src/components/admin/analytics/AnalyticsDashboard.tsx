import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import AnalyticsOverview from "./AnalyticsOverview";
import ArtworksAnalytics from "./ArtworksAnalytics";
import SeriesAnalytics from "./SeriesAnalytics";
import SessionsAnalytics from "./SessionsAnalytics";
import AudienceAnalytics from "./AudienceAnalytics";
import RealtimeAnalytics from "./RealtimeAnalytics";
import DateRangeFilter from "./DateRangeFilter";

const AnalyticsDashboard = () => {
  const [presetDays, setPresetDays] = useState(30);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

  // Calculate effective date range
  const getDateRange = (): { startDate: Date; endDate: Date } => {
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

  const dateRange = getDateRange();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Análisis completo del comportamiento de visitantes
        </p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        dateRange={customDateRange}
        onDateRangeChange={setCustomDateRange}
        presetDays={presetDays}
        onPresetChange={setPresetDays}
      />

        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList>
            <TabsTrigger value="realtime">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <RealtimeAnalytics />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </TabsContent>

        <TabsContent value="artworks" className="space-y-6">
          <ArtworksAnalytics startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </TabsContent>

        <TabsContent value="series" className="space-y-6">
          <SeriesAnalytics startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <AudienceAnalytics startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SessionsAnalytics startDate={dateRange.startDate} endDate={dateRange.endDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
