import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserEventsSummary {
  bioVisits: number;
  bioAvgDuration: number;
  bioScrollComplete: number;
  bioScrollRate: number;
  contactClicks: number;
  contactClickSources: { source: string; count: number }[];
  worksVisits: number;
  worksScrollComplete: number;
  worksScrollRate: number;
  galleryNavigations: number;
  galleryUniqueArtworks: number;
}

export const useUserEventsAnalytics = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["user-events-analytics", startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<UserEventsSummary> => {
      const [
        { data: userEvents },
        { data: bioPageViews },
        { data: worksPageViews },
        { data: contactPageViews },
      ] = await Promise.all([
        supabase
          .from("user_events")
          .select("event_type, event_data, session_id, created_at")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("page_views")
          .select("session_id, time_on_page_seconds")
          .eq("page_path", "/bio")
          .gte("viewed_at", startDate.toISOString())
          .lte("viewed_at", endDate.toISOString()),
        supabase
          .from("page_views")
          .select("session_id, time_on_page_seconds")
          .eq("page_path", "/works")
          .gte("viewed_at", startDate.toISOString())
          .lte("viewed_at", endDate.toISOString()),
        supabase
          .from("page_views")
          .select("session_id")
          .eq("page_path", "/contact")
          .gte("viewed_at", startDate.toISOString())
          .lte("viewed_at", endDate.toISOString()),
      ]);

      const events = userEvents || [];
      const bioScrollEvents = events.filter((e) => e.event_type === "bio_scroll_complete");
      const contactClickEvents = events.filter((e) => e.event_type === "contact_click");
      const worksScrollEvents = events.filter((e) => e.event_type === "works_scroll_complete");
      const galleryEvents = events.filter((e) => e.event_type === "gallery_navigate");

      // Bio stats
      const bioViews = bioPageViews || [];
      const bioUniqueSessions = new Set(bioViews.map((v) => v.session_id)).size;
      const bioAvgDuration =
        bioViews.length > 0
          ? Math.round(
              bioViews.reduce((sum, v) => sum + (v.time_on_page_seconds || 0), 0) / bioViews.length
            )
          : 0;
      const bioScrollUnique = new Set(bioScrollEvents.map((e) => e.session_id)).size;

      // Contact clicks by source
      const sourceMap = new Map<string, number>();
      contactClickEvents.forEach((e) => {
        const source = (e.event_data as Record<string, string>)?.source || "unknown";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });
      const contactClickSources = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count,
      }));

      // Works stats
      const worksViews = worksPageViews || [];
      const worksUniqueSessions = new Set(worksViews.map((v) => v.session_id)).size;
      const worksScrollUnique = new Set(worksScrollEvents.map((e) => e.session_id)).size;

      // Gallery stats
      const galleryArtworkIds = new Set(
        galleryEvents
          .map((e) => (e.event_data as Record<string, string>)?.artworkId)
          .filter(Boolean)
      );

      // Contact page visits
      const contactVisits = new Set((contactPageViews || []).map((v) => v.session_id)).size;

      return {
        bioVisits: bioUniqueSessions,
        bioAvgDuration,
        bioScrollComplete: bioScrollUnique,
        bioScrollRate: bioUniqueSessions > 0 ? Math.round((bioScrollUnique / bioUniqueSessions) * 100) : 0,
        contactClicks: contactClickEvents.length + contactVisits,
        contactClickSources,
        worksVisits: worksUniqueSessions,
        worksScrollComplete: worksScrollUnique,
        worksScrollRate: worksUniqueSessions > 0 ? Math.round((worksScrollUnique / worksUniqueSessions) * 100) : 0,
        galleryNavigations: galleryEvents.length,
        galleryUniqueArtworks: galleryArtworkIds.size,
      };
    },
  });
};
