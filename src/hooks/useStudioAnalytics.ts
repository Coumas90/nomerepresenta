import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudioSeriesScroll {
  series_id: string;
  series_name: string;
  scroll_count: number;
  unique_sessions: number;
}

export const useStudioAnalytics = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["studio-analytics", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      // Get scroll tracking data with series names
      const { data: scrollData, error } = await supabase
        .from("studio_scroll_tracking")
        .select("session_id, series_id, scrolled_at")
        .gte("scrolled_at", startDate.toISOString())
        .lte("scrolled_at", endDate.toISOString());

      if (error) throw error;

      // Get studio sessions count (page views to /studio)
      const { data: studioPageViews } = await supabase
        .from("page_views")
        .select("session_id")
        .eq("page_path", "/studio")
        .gte("viewed_at", startDate.toISOString())
        .lte("viewed_at", endDate.toISOString());

      // Get series names
      const { data: seriesData } = await supabase
        .from("studio_series")
        .select("id, name, display_order")
        .order("display_order");

      const seriesMap = new Map(
        (seriesData || []).map((s) => [s.id, s.name])
      );
      const seriesOrder = new Map(
        (seriesData || []).map((s) => [s.id, s.display_order])
      );

      // Aggregate scroll data by series
      const seriesAgg = new Map<string, { sessions: Set<string>; count: number }>();
      for (const row of scrollData || []) {
        if (!seriesAgg.has(row.series_id)) {
          seriesAgg.set(row.series_id, { sessions: new Set(), count: 0 });
        }
        const agg = seriesAgg.get(row.series_id)!;
        agg.sessions.add(row.session_id);
        agg.count++;
      }

      const seriesScrolls: StudioSeriesScroll[] = Array.from(seriesAgg.entries())
        .map(([series_id, agg]) => ({
          series_id,
          series_name: seriesMap.get(series_id) || "Unknown",
          scroll_count: agg.count,
          unique_sessions: agg.sessions.size,
        }))
        .sort((a, b) => (seriesOrder.get(a.series_id) || 0) - (seriesOrder.get(b.series_id) || 0));

      const uniqueStudioVisitors = new Set(
        (studioPageViews || []).map((pv) => pv.session_id)
      ).size;

      return {
        totalStudioVisits: uniqueStudioVisitors,
        seriesScrolls,
      };
    },
  });
};
