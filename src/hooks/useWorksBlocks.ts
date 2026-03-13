import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BlockType = "single" | "carousel";

export interface WorksBlock {
  id: string;
  series_id: string;
  block_type: BlockType;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorksBlockItem {
  id: string;
  block_id: string;
  artwork_id: string;
  display_order: number;
  created_at: string;
  image_overrides: {
    hidden_images?: string[];
    image_order?: string[];
  } | null;
}

export interface WorksBlockWithItems extends WorksBlock {
  items: (WorksBlockItem & {
    artwork: {
      id: string;
      title: string;
      year: string | null;
      dimensions: string | null;
      materials: string | null;
      description: string | null;
      image_url: string;
      image_detail_url: string | null;
      series_id: string;
      is_visible: boolean;
      display_order: number;
    };
  })[];
}

// Fetch all blocks with their items and artwork data, grouped by series
export const useWorksBlocks = () => {
  return useQuery({
    queryKey: ["works-blocks"],
    queryFn: async () => {
      const { data: blocks, error: blocksError } = await supabase
        .from("works_blocks" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (blocksError) throw blocksError;

      const { data: items, error: itemsError } = await (supabase
        .from("works_block_items" as any)
        .select("*, artwork:artworks(id, title, year, dimensions, materials, description, image_url, image_detail_url, series_id, is_visible, display_order)")
        .order("display_order", { ascending: true }) as any);
      if (itemsError) throw itemsError;

      const itemsByBlock = new Map<string, typeof items>();
      for (const item of items as any[]) {
        const list = itemsByBlock.get(item.block_id) || [];
        list.push(item);
        itemsByBlock.set(item.block_id, list);
      }

      return (blocks as any[]).map((block) => ({
        ...block,
        items: (itemsByBlock.get(block.id) || []) as WorksBlockWithItems["items"],
      })) as WorksBlockWithItems[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch blocks for a specific series
export const useWorksBlocksBySeries = (seriesId: string) => {
  const { data: allBlocks, ...rest } = useWorksBlocks();
  const blocks = allBlocks?.filter((b) => b.series_id === seriesId) || [];
  return { data: blocks, ...rest };
};

// Create a new block
export const useCreateWorksBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { series_id: string; block_type: BlockType; display_order: number }) => {
      const { data: result, error } = await supabase
        .from("works_blocks" as any)
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result as unknown as WorksBlock;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Delete a block
export const useDeleteWorksBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("works_blocks" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Update block type
export const useUpdateWorksBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Pick<WorksBlock, "block_type" | "display_order"> & { is_hidden?: boolean }> }) => {
      const { error } = await supabase.from("works_blocks" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Reorder blocks within a series
export const useReorderWorksBlocks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      await Promise.all(
        items.map((item) =>
          supabase.from("works_blocks" as any).update({ display_order: item.display_order } as any).eq("id", item.id)
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
  });
};

// Add artwork to a block
export const useAddBlockItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { block_id: string; artwork_id: string; display_order: number }) => {
      const { error } = await supabase.from("works_block_items" as any).insert(data as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Remove artwork from a block
export const useRemoveBlockItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("works_block_items" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Reorder items within a block
export const useReorderBlockItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      await Promise.all(
        items.map((item) =>
          supabase.from("works_block_items" as any).update({ display_order: item.display_order } as any).eq("id", item.id)
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
  });
};

// Update image overrides for a block item (Works-specific image order/visibility)
export const useUpdateImageOverrides = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockItemId, overrides }: { blockItemId: string; overrides: { hidden_images?: string[]; image_order?: string[] } }) => {
      const { error } = await supabase
        .from("works_block_items" as any)
        .update({ image_overrides: overrides } as any)
        .eq("id", blockItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works-blocks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
