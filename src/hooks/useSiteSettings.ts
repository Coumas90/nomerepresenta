import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data as SiteSetting[]) {
        map[row.key] = row.value;
      }
      return map;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSiteSetting = (key: string) => {
  const { data } = useSiteSettings();
  return data?.[key];
};

export const useUpdateSiteSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Upsert: try update first, insert if not exists
      const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).single();
      if (existing) {
        const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert({ key, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
};
