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
  browser: string;
  os: string;
  source: string;
  referrer: string | null;
  is_returning: boolean;
  /** How many times this visitor accessed any pricelist page (total across all time) */
  visit_count: number;
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

function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  return { browser, os };
}

function normalizeSource(referrer: string | null, utmSource: string | null): string {
  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (src.includes("instagram")) return "Instagram";
    if (src.includes("facebook")) return "Facebook";
    if (src.includes("google")) return "Google";
    return utmSource;
  }
  if (!referrer) return "Direct";
  const r = referrer.toLowerCase();
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("facebook")) return "Facebook";
  if (r.includes("google")) return "Google";
  if (r.includes("lovable")) return "Lovable";
  return "Other referral";
}

export const usePricelistAnalytics = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["pricelist-analytics", startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<PricelistAnalyticsSummary> => {
      const { data: pageViews } = await supabase
        .from("page_views")
        .select("session_id, page_path, viewed_at, time_on_page_seconds")
        .like("page_path", "/selected/%")
        .gte("viewed_at", startDate.toISOString())
        .lte("viewed_at", endDate.toISOString())
        .order("viewed_at", { ascending: false });

      if (!pageViews || pageViews.length === 0) {
        return { totalViews: 0, uniqueSessions: 0, avgDuration: 0, bySlug: [], byDevice: [], byCountry: [], sessions: [] };
      }

      const sessionIds = [...new Set(pageViews.map((pv) => pv.session_id))];

      const { data: sessions } = await supabase
        .from("analytics_sessions")
        .select("session_id, device_type, country_name, city, user_agent, referrer, utm_source, visitor_fingerprint, started_at")
        .in("session_id", sessionIds);

      const sessionMap = new Map((sessions || []).map((s) => [s.session_id, s]));

      // Check returning visitors & count total pricelist visits per fingerprint
      const fingerprints = (sessions || []).map((s) => s.visitor_fingerprint).filter(Boolean) as string[];
      const fpCounts = new Map<string, number>();
      const fpTotalVisits = new Map<string, number>();
      if (fingerprints.length > 0) {
        const uniqueFps = [...new Set(fingerprints)];
        const { data: prev } = await supabase
          .from("analytics_sessions")
          .select("visitor_fingerprint")
          .in("visitor_fingerprint", uniqueFps)
          .lt("started_at", startDate.toISOString());
        (prev || []).forEach((s) => {
          if (s.visitor_fingerprint) fpCounts.set(s.visitor_fingerprint, (fpCounts.get(s.visitor_fingerprint) || 0) + 1);
        });

        // Count all pricelist page_views per fingerprint (all time)
        const { data: allPricelistPvs } = await supabase
          .from("page_views")
          .select("session_id")
          .like("page_path", "/selected/%");
        if (allPricelistPvs) {
          // Map session_id -> fingerprint
          const { data: allSessions } = await supabase
            .from("analytics_sessions")
            .select("session_id, visitor_fingerprint")
            .in("visitor_fingerprint", uniqueFps);
          const sidToFp = new Map((allSessions || []).map((s) => [s.session_id, s.visitor_fingerprint]));
          for (const pv of allPricelistPvs) {
            const fp = sidToFp.get(pv.session_id);
            if (fp) fpTotalVisits.set(fp, (fpTotalVisits.get(fp) || 0) + 1);
          }
        }
      }

      const enrichedSessions: PricelistSessionData[] = pageViews.map((pv) => {
        const session = sessionMap.get(pv.session_id);
        const slug = pv.page_path.replace("/selected/", "");
        const { browser, os } = parseUserAgent(session?.user_agent || null);
        const source = normalizeSource(session?.referrer || null, session?.utm_source || null);
        const isReturning = session?.visitor_fingerprint ? (fpCounts.get(session.visitor_fingerprint) || 0) > 0 : false;
        const visitCount = session?.visitor_fingerprint ? (fpTotalVisits.get(session.visitor_fingerprint) || 1) : 1;
        return {
          slug,
          session_id: pv.session_id,
          viewed_at: pv.viewed_at,
          time_on_page_seconds: pv.time_on_page_seconds,
          device_type: session?.device_type || null,
          country_name: session?.country_name || null,
          city: session?.city || null,
          browser,
          os,
          source,
          referrer: session?.referrer || null,
          is_returning: isReturning,
          visit_count: visitCount,
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
        slug, views: data.views, uniqueSessions: data.sessions.size,
        avgDuration: data.views > 0 ? Math.round(data.totalDuration / data.views) : 0,
      }));

      // Aggregate by device
      const deviceMap = new Map<string, number>();
      for (const s of enrichedSessions) { const d = s.device_type || "unknown"; deviceMap.set(d, (deviceMap.get(d) || 0) + 1); }
      const byDevice = Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count);

      // Aggregate by country
      const countryMap = new Map<string, number>();
      for (const s of enrichedSessions) { const c = s.country_name || "Unknown"; countryMap.set(c, (countryMap.get(c) || 0) + 1); }
      const byCountry = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);

      const uniqueSessions = new Set(enrichedSessions.map((s) => s.session_id)).size;
      const totalDuration = enrichedSessions.reduce((sum, s) => sum + (s.time_on_page_seconds || 0), 0);

      return {
        totalViews: pageViews.length, uniqueSessions,
        avgDuration: pageViews.length > 0 ? Math.round(totalDuration / pageViews.length) : 0,
        bySlug, byDevice, byCountry, sessions: enrichedSessions,
      };
    },
  });
};
