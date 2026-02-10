import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SeriesData } from "@/types";

export const useCreateStudioSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (series: Omit<SeriesData, "id">) => {
      const { data, error } = await supabase
        .from("studio_series")
        .insert(series)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-series"] });
      toast({ title: "Series Created", description: "Studio series created successfully." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create series",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudioSeriesOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (series: { id: string; display_order: number }[]) => {
      const updates = series.map((s) =>
        supabase
          .from("studio_series")
          .update({ display_order: s.display_order })
          .eq("id", s.id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-series"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reorder series",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStudioSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if series has images
      const { data: imgs, error: checkError } = await supabase
        .from("studio_images")
        .select("id")
        .eq("series_id", id)
        .limit(1);

      if (checkError) throw checkError;
      if (imgs && imgs.length > 0) {
        throw new Error("Cannot delete series with images. Remove images first.");
      }

      const { error } = await supabase.from("studio_series").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-series"] });
      toast({ title: "Series Deleted", description: "Studio series deleted successfully." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete series",
        variant: "destructive",
      });
    },
  });
};
