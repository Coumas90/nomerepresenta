import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBioSettings = () => {
  return useQuery({
    queryKey: ["bio-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bio_settings")
        .select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((row: any) => { map[row.key] = row.value; });
      return map;
    },
  });
};

export const useUpdateBioSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Upsert: update if exists, insert if not
      const { data: existing } = await supabase
        .from("bio_settings")
        .select("id")
        .eq("key", key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("bio_settings")
          .update({ value })
          .eq("key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bio_settings")
          .insert({ key, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio-settings"] });
      toast.success("Bio actualizado");
    },
    onError: (error) => {
      toast.error("Error al actualizar bio");
      console.error(error);
    },
  });
};
