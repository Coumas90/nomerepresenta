import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PricelistItem {
  id: string;
  artwork_id: string;
  price: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricelistItemWithArtwork extends PricelistItem {
  artwork: {
    id: string;
    title: string;
    year: string | null;
    dimensions: string | null;
    materials: string | null;
    image_url: string;
    series_id: string;
  };
}

export const usePricelist = () => {
  return useQuery({
    queryKey: ["pricelist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricelist_items" as any)
        .select("*, artwork:artworks(id, title, year, dimensions, materials, image_url, series_id)")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data as any[]) as PricelistItemWithArtwork[];
    },
  });
};

export const useAddPricelistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { artwork_id: string; price: string; display_order: number }) => {
      const { data: result, error } = await supabase
        .from("pricelist_items" as any)
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelist"] });
      toast.success("Item added to pricelist");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdatePricelistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { price?: string; is_visible?: boolean } }) => {
      const { error } = await supabase
        .from("pricelist_items" as any)
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelist"] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeletePricelistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pricelist_items" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelist"] });
      toast.success("Item removed from pricelist");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useReorderPricelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      const updates = items.map((item) =>
        supabase
          .from("pricelist_items" as any)
          .update({ display_order: item.display_order } as any)
          .eq("id", item.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelist"] });
    },
  });
};
