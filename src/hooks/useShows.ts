import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ShowData, ShowImage } from "@/types/show";

export const useShows = (publishedOnly = false) => {
  return useQuery({
    queryKey: ["shows", { publishedOnly }],
    queryFn: async () => {
      let query = supabase
        .from("shows")
        .select("*")
        .order("display_order", { ascending: true });

      if (publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShowData[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useShow = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["show", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as ShowData;
    },
    enabled: !!slug,
  });
};

export const useShowImages = (showId: string | undefined) => {
  return useQuery({
    queryKey: ["show-images", showId],
    queryFn: async () => {
      if (!showId) throw new Error("Show ID is required");
      const { data, error } = await supabase
        .from("show_images")
        .select("*")
        .eq("show_id", showId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ShowImage[];
    },
    enabled: !!showId,
  });
};

export const useAllShowImages = () => {
  return useQuery({
    queryKey: ["all-show-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("show_images")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      const grouped: Record<string, ShowImage[]> = {};
      for (const img of data || []) {
        if (!grouped[img.show_id]) grouped[img.show_id] = [];
        grouped[img.show_id].push(img as ShowImage);
      }
      return grouped;
    },
    staleTime: 5 * 60 * 1000,
  });
};
