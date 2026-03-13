import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SessionLogEntry {
  id: string;
  session_id: string;
  started_at: string;
  last_activity_at: string;
  duration_seconds: number;
  country_name: string | null;
  city: string | null;
  referrer: string | null;
  source: string;
  landing_page: string;
  pages_viewed: number;
  visitor_path: string[];
  device_type: string | null;
  browser: string;
  os: string;
  is_returning: boolean;
  visitor_fingerprint: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  page_details: PageDetail[];
  user_events: UserEventDetail[];
}

export interface PageDetail {
  page_path: string;
  page_name: string | null;
  viewed_at: string;
  time_on_page_seconds: number | null;
}

export interface UserEventDetail {
  event_type: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export interface SessionLogFilters {
  source?: string;
  country?: string;
  deviceType?: string;
  isReturning?: "all" | "new" | "returning";
  search?: string;
  highIntent?: boolean;
}

export type SortField = "started_at" | "duration_seconds" | "pages_viewed";
export type SortDirection = "asc" | "desc";

function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
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
    if (src.includes("twitter") || src.includes("x.com")) return "Twitter/X";
    return utmSource;
  }
  if (!referrer) return "Direct";
  const r = referrer.toLowerCase();
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("facebook")) return "Facebook";
  if (r.includes("google")) return "Google";
  if (r.includes("twitter") || r.includes("x.com")) return "Twitter/X";
  if (r.includes("lovable")) return "Lovable";
  if (r.includes("linkedin")) return "LinkedIn";
  return "Other referral";
}

export const useSessionLog = (
  startDate: Date,
  endDate: Date,
  page: number,
  pageSize: number,
  filters: SessionLogFilters,
  sortField: SortField,
  sortDirection: SortDirection
) => {
  return useQuery({
    queryKey: [
      "session-log",
      startDate.toISOString(),
      endDate.toISOString(),
      page,
      pageSize,
      filters,
      sortField,
      sortDirection,
    ],
    queryFn: async () => {
      // 1. Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("analytics_sessions")
        .select("*")
        .gte("started_at", startDate.toISOString())
        .lte("started_at", endDate.toISOString())
        .order("started_at", { ascending: false })
        .limit(500);

      if (sessionsError) throw sessionsError;
      if (!sessions || sessions.length === 0) {
        return { sessions: [], totalCount: 0, availableSources: [], availableCountries: [] };
      }

      const sessionIds = sessions.map((s) => s.session_id);

      // 2. Fetch page views for these sessions
      const { data: pageViews } = await supabase
        .from("page_views")
        .select("session_id, page_path, page_name, viewed_at, time_on_page_seconds")
        .in("session_id", sessionIds)
        .order("viewed_at", { ascending: true });

      // 3. Fetch user events with full data
      const { data: userEvents } = await supabase
        .from("user_events")
        .select("session_id, event_type, event_data, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      // 4. Find returning visitors by fingerprint
      const fingerprints = sessions
        .map((s) => s.visitor_fingerprint)
        .filter(Boolean) as string[];
      
      const fingerprintCounts = new Map<string, number>();
      if (fingerprints.length > 0) {
        const { data: allSessions } = await supabase
          .from("analytics_sessions")
          .select("visitor_fingerprint")
          .in("visitor_fingerprint", [...new Set(fingerprints)])
          .lt("started_at", startDate.toISOString());

        (allSessions || []).forEach((s) => {
          if (s.visitor_fingerprint) {
            fingerprintCounts.set(
              s.visitor_fingerprint,
              (fingerprintCounts.get(s.visitor_fingerprint) || 0) + 1
            );
          }
        });
      }

      // 5. Build page view map
      const pvMap = new Map<string, PageDetail[]>();
      (pageViews || []).forEach((pv) => {
        if (!pvMap.has(pv.session_id)) pvMap.set(pv.session_id, []);
        pvMap.get(pv.session_id)!.push({
          page_path: pv.page_path,
          page_name: pv.page_name,
          viewed_at: pv.viewed_at,
          time_on_page_seconds: pv.time_on_page_seconds,
        });
      });

      // 6. Build user events map (both set for filtering and full details)
      const eventMap = new Map<string, Set<string>>();
      const eventDetailsMap = new Map<string, UserEventDetail[]>();
      (userEvents || []).forEach((e) => {
        if (!eventMap.has(e.session_id)) eventMap.set(e.session_id, new Set());
        eventMap.get(e.session_id)!.add(e.event_type);
        if (!eventDetailsMap.has(e.session_id)) eventDetailsMap.set(e.session_id, []);
        eventDetailsMap.get(e.session_id)!.push({
          event_type: e.event_type,
          event_data: e.event_data as Record<string, unknown> | null,
          created_at: e.created_at,
        });
      });

      // 7. Assemble session log entries
      let entries: SessionLogEntry[] = sessions.map((s) => {
        const pages = pvMap.get(s.session_id) || [];
        const events = eventMap.get(s.session_id) || new Set();
        const { browser, os } = parseUserAgent(s.user_agent);
        const source = normalizeSource(s.referrer, s.utm_source);
        const isReturning = s.visitor_fingerprint
          ? (fingerprintCounts.get(s.visitor_fingerprint) || 0) > 0
          : false;

        const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
        const lastActivityAt = lastPage
          ? lastPage.viewed_at
          : s.ended_at || s.started_at;

        const startTime = new Date(s.started_at).getTime();
        const endTime = new Date(lastActivityAt).getTime();
        const duration = s.total_duration_seconds || Math.max(0, Math.floor((endTime - startTime) / 1000));

        return {
          id: s.id,
          session_id: s.session_id,
          started_at: s.started_at,
          last_activity_at: lastActivityAt,
          duration_seconds: duration,
          country_name: s.country_name,
          city: s.city,
          referrer: s.referrer,
          source,
          landing_page: pages.length > 0 ? pages[0].page_path : "/",
          pages_viewed: pages.length,
          visitor_path: pages.map((p) => p.page_path),
          device_type: s.device_type,
          browser,
          os,
          is_returning: isReturning,
          visitor_fingerprint: s.visitor_fingerprint,
          utm_source: s.utm_source,
          utm_medium: s.utm_medium,
          utm_campaign: s.utm_campaign,
          page_details: pages,
          _events: events, // temp for filtering
        } as SessionLogEntry & { _events: Set<string> };
      });

      // Collect filter options before filtering
      const availableSources = [...new Set(entries.map((e) => e.source))].sort();
      const availableCountries = [
        ...new Set(entries.map((e) => e.country_name).filter(Boolean) as string[]),
      ].sort();

      // 8. Apply filters
      if (filters.source) {
        entries = entries.filter((e) => e.source === filters.source);
      }
      if (filters.country) {
        entries = entries.filter((e) => e.country_name === filters.country);
      }
      if (filters.deviceType) {
        entries = entries.filter((e) => e.device_type === filters.deviceType);
      }
      if (filters.isReturning === "new") {
        entries = entries.filter((e) => !e.is_returning);
      } else if (filters.isReturning === "returning") {
        entries = entries.filter((e) => e.is_returning);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        entries = entries.filter(
          (e) =>
            e.landing_page.toLowerCase().includes(q) ||
            (e.referrer || "").toLowerCase().includes(q) ||
            (e.country_name || "").toLowerCase().includes(q) ||
            (e.city || "").toLowerCase().includes(q)
        );
      }
      if (filters.highIntent) {
        entries = entries.filter((e) => {
          const ev = (e as SessionLogEntry & { _events: Set<string> })._events;
          const hasContactClick = ev?.has("contact_click") || ev?.has("email_click");
          const hasPricelist = e.visitor_path.some((p) => p.includes("/selection/"));
          return (
            e.duration_seconds > 60 ||
            e.pages_viewed >= 3 ||
            hasContactClick ||
            hasPricelist
          );
        });
      }

      // Clean up temp _events
      entries = entries.map(({ ...e }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (e as any)._events;
        return e;
      });

      // 9. Sort
      const totalCount = entries.length;
      entries.sort((a, b) => {
        let cmp = 0;
        if (sortField === "started_at") {
          cmp = new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        } else if (sortField === "duration_seconds") {
          cmp = a.duration_seconds - b.duration_seconds;
        } else if (sortField === "pages_viewed") {
          cmp = a.pages_viewed - b.pages_viewed;
        }
        return sortDirection === "desc" ? -cmp : cmp;
      });

      // 10. Paginate
      const start = page * pageSize;
      const paged = entries.slice(start, start + pageSize);

      return {
        sessions: paged,
        totalCount,
        availableSources,
        availableCountries,
      };
    },
  });
};

// Insight: top landing pages
export const useTopLandingPages = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["top-landing-pages", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from("analytics_sessions")
        .select("session_id, total_duration_seconds")
        .gte("started_at", startDate.toISOString())
        .lte("started_at", endDate.toISOString());

      if (!sessions || sessions.length === 0) return [];

      const sessionIds = sessions.map((s) => s.session_id);
      const durationMap = new Map(sessions.map((s) => [s.session_id, s.total_duration_seconds || 0]));

      // Get first page view per session
      const { data: pageViews } = await supabase
        .from("page_views")
        .select("session_id, page_path, viewed_at")
        .in("session_id", sessionIds)
        .order("viewed_at", { ascending: true });

      const firstPages = new Map<string, string>();
      (pageViews || []).forEach((pv) => {
        if (!firstPages.has(pv.session_id)) {
          firstPages.set(pv.session_id, pv.page_path);
        }
      });

      // Count all pages per session for bounce
      const pagesPerSession = new Map<string, number>();
      (pageViews || []).forEach((pv) => {
        pagesPerSession.set(pv.session_id, (pagesPerSession.get(pv.session_id) || 0) + 1);
      });

      // Aggregate
      const landingMap = new Map<string, { sessions: number; totalDuration: number; bounces: number }>();
      firstPages.forEach((page, sid) => {
        if (!landingMap.has(page)) landingMap.set(page, { sessions: 0, totalDuration: 0, bounces: 0 });
        const entry = landingMap.get(page)!;
        entry.sessions++;
        entry.totalDuration += durationMap.get(sid) || 0;
        if ((pagesPerSession.get(sid) || 0) <= 1) entry.bounces++;
      });

      return Array.from(landingMap.entries())
        .map(([page, data]) => ({
          page,
          sessions: data.sessions,
          avgDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
          bounceRate: data.sessions > 0 ? Math.round((data.bounces / data.sessions) * 100) : 0,
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);
    },
  });
};

// Insight: common visitor paths
export const useCommonPaths = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["common-paths", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from("analytics_sessions")
        .select("session_id")
        .gte("started_at", startDate.toISOString())
        .lte("started_at", endDate.toISOString())
        .limit(300);

      if (!sessions || sessions.length === 0) return [];

      const sessionIds = sessions.map((s) => s.session_id);

      const { data: pageViews } = await supabase
        .from("page_views")
        .select("session_id, page_path, viewed_at")
        .in("session_id", sessionIds)
        .order("viewed_at", { ascending: true });

      // Build paths per session, simplified
      const pathsPerSession = new Map<string, string[]>();
      (pageViews || []).forEach((pv) => {
        if (!pathsPerSession.has(pv.session_id)) pathsPerSession.set(pv.session_id, []);
        const list = pathsPerSession.get(pv.session_id)!;
        // Simplify path name
        const name = pv.page_path === "/" ? "Home" : 
          pv.page_path.split("/").filter(Boolean)[0]?.replace(/^\w/, c => c.toUpperCase()) || pv.page_path;
        if (list[list.length - 1] !== name) list.push(name);
      });

      // Count unique paths
      const pathCounts = new Map<string, number>();
      pathsPerSession.forEach((path) => {
        if (path.length >= 2) {
          const key = path.slice(0, 5).join(" → ");
          pathCounts.set(key, (pathCounts.get(key) || 0) + 1);
        }
      });

      return Array.from(pathCounts.entries())
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });
};
