import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricelistSessionData {
  slug: string;
  session_id: string;
  viewed_at: string;
  time_on_page_seconds: number | null;
  device_type: string | null;
  country_name: string | null;
  city: string | null;
}

export interface PricelistAnalyticsSummary {
  totalViews: number;
  uniqueSessions: number;
  avgDuration: number;
  bySlug: {
    slug: string;
    views: number;
    uniqueSessions: number;
    avgDuration: number;
  }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
  sessions: PricelistSessionData[];
}

export const usePricelistAnalytics = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["pricelist-analytics", startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<PricelistAnalyticsSummary> => {
      // Get all page views for /available/* paths
      const { data: pageViews } = await supabase
        .from("page_views")
        .select("session_id, page_path, viewed_at, time_on_page_seconds")
        .like("page_path", "/available/%")
        .gte("viewed_at", startDate.toISOString())
        .lte("viewed_at", endDate.toISOString())
        .order("viewed_at", { ascending: false });

      if (!pageViews || pageViews.length === 0) {
        return {
          totalViews: 0,
          uniqueSessions: 0,
          avgDuration: 0,
          bySlug: [],
          byDevice: [],
          byCountry: [],
          sessions: [],
        };
      }

      // Get unique session IDs to fetch session details
      const sessionIds = [...new Set(pageViews.map((pv) => pv.session_id))];

      // Fetch session details for device/country info
      const { data: sessions } = await supabase
        .from("analytics_sessions")
        .select("session_id, device_type, country_name, city")
        .in("session_id", sessionIds);

      const sessionMap = new Map(
        (sessions || []).map((s) => [s.session_id, s])
      );

      // Build enriched session list
      const enrichedSessions: PricelistSessionData[] = pageViews.map((pv) => {
        const session = sessionMap.get(pv.session_id);
        const slug = pv.page_path.replace("/available/", "");
        return {
          slug,
          session_id: pv.session_id,
          viewed_at: pv.viewed_at,
          time_on_page_seconds: pv.time_on_page_seconds,
          device_type: session?.device_type || null,
          country_name: session?.country_name || null,
          city: session?.city || null,
        };
      });

      // Aggregate by slug
      const slugMap = new Map<string, { views: number; sessions: Set<string>; totalDuration: number }>();
      for (const s of enrichedSessions) {
        if (!slugMap.has(s.slug)) slugMap.set(s.slug, { views: 0, sessions: new Set(), totalDuration: 0 });
        const entry = slugMap.get(s.slug)!;
        entry.views++;
        entry.sessions.add(s.session_id);
        entry.totalDuration += s.time_on_page_seconds || 0;
      }

      const bySlug = Array.from(slugMap.entries()).map(([slug, data]) => ({
        slug,
        views: data.views,
        uniqueSessions: data.sessions.size,
        avgDuration: data.views > 0 ? Math.round(data.totalDuration / data.views) : 0,
      }));

      // Aggregate by device
      const deviceMap = new Map<string, number>();
      for (const s of enrichedSessions) {
        const device = s.device_type || "unknown";
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      }
      const byDevice = Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Aggregate by country
      const countryMap = new Map<string, number>();
      for (const s of enrichedSessions) {
        const country = s.country_name || "Unknown";
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      }
      const byCountry = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      const uniqueSessions = new Set(enrichedSessions.map((s) => s.session_id)).size;
      const totalDuration = enrichedSessions.reduce((sum, s) => sum + (s.time_on_page_seconds || 0), 0);

      return {
        totalViews: pageViews.length,
        uniqueSessions,
        avgDuration: pageViews.length > 0 ? Math.round(totalDuration / pageViews.length) : 0,
        bySlug,
        byDevice,
        byCountry,
        sessions: enrichedSessions,
      };
    },
  });
};
