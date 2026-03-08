import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Pricelist {
  id: string;
  name: string;
  slug: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface PricelistItem {
  id: string;
  pricelist_id: string;
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

// --- Pricelists CRUD ---

export const usePricelists = () => {
  return useQuery({
    queryKey: ["pricelists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricelists" as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]) as Pricelist[];
    },
  });
};

export const usePricelistBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["pricelist-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricelists" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Pricelist;
    },
    enabled: !!slug,
  });
};

export const useCreatePricelist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; password: string }) => {
      const { data: result, error } = await supabase
        .from("pricelists" as any)
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result as Pricelist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelists"] });
      toast.success("Pricelist created");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdatePricelist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<Pricelist, "name" | "slug" | "password">> }) => {
      const { error } = await supabase
        .from("pricelists" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelists"] });
      toast.success("Pricelist updated");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeletePricelist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pricelists" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricelists"] });
      toast.success("Pricelist deleted");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

// --- Pricelist Items ---

export const usePricelistItems = (pricelistId: string) => {
  return useQuery({
    queryKey: ["pricelist-items", pricelistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricelist_items" as any)
        .select("*, artwork:artworks(id, title, year, dimensions, materials, image_url, series_id)")
        .eq("pricelist_id", pricelistId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as any[]) as PricelistItemWithArtwork[];
    },
    enabled: !!pricelistId,
  });
};

export const useAddPricelistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { pricelist_id: string; artwork_id: string; price: string; display_order: number }) => {
      const { data: result, error } = await supabase
        .from("pricelist_items" as any)
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pricelist-items", variables.pricelist_id] });
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
    mutationFn: async ({ id, pricelistId, updates }: { id: string; pricelistId: string; updates: { price?: string; is_visible?: boolean } }) => {
      const { error } = await supabase
        .from("pricelist_items" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
      return pricelistId;
    },
    onSuccess: (pricelistId) => {
      queryClient.invalidateQueries({ queryKey: ["pricelist-items", pricelistId] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeletePricelistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pricelistId }: { id: string; pricelistId: string }) => {
      const { error } = await supabase
        .from("pricelist_items" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return pricelistId;
    },
    onSuccess: (pricelistId) => {
      queryClient.invalidateQueries({ queryKey: ["pricelist-items", pricelistId] });
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
    mutationFn: async ({ pricelistId, items }: { pricelistId: string; items: { id: string; display_order: number }[] }) => {
      const updates = items.map((item) =>
        supabase
          .from("pricelist_items" as any)
          .update({ display_order: item.display_order } as any)
          .eq("id", item.id)
      );
      await Promise.all(updates);
      return pricelistId;
    },
    onSuccess: (pricelistId) => {
      queryClient.invalidateQueries({ queryKey: ["pricelist-items", pricelistId] });
    },
  });
};
