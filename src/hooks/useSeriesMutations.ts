import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SeriesData } from "./useSeries";

export const useCreateSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (series: Omit<SeriesData, "id">) => {
      const { data, error } = await supabase
        .from("series")
        .insert(series)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      toast({
        title: "Series Created",
        description: "The series has been created successfully.",
      });
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

export const useUpdateSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SeriesData> & { id: string }) => {
      const { data, error } = await supabase
        .from("series")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      toast({
        title: "Series Updated",
        description: "The series has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update series",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSeries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if series has artworks
      const { data: artworks, error: checkError } = await supabase
        .from("artworks")
        .select("id")
        .eq("series_id", id)
        .limit(1);

      if (checkError) throw checkError;

      if (artworks && artworks.length > 0) {
        throw new Error("Cannot delete series with associated artworks. Please delete or move the artworks first.");
      }

      const { error } = await supabase
        .from("series")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      toast({
        title: "Series Deleted",
        description: "The series has been deleted successfully.",
      });
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

export const useUpdateSeriesOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (series: { id: string; display_order: number }[]) => {
      const updates = series.map(s => 
        supabase
          .from("series")
          .update({ display_order: s.display_order })
          .eq("id", s.id)
      );

      const results = await Promise.all(updates);
      const error = results.find(r => r.error);
      if (error?.error) throw error.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update series order",
        variant: "destructive",
      });
    },
  });
};
