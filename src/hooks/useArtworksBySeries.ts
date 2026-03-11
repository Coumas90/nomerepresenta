import { useMemo } from "react";
import { useSeries } from "@/hooks/useSeries";
import { useWorksBlocks, type WorksBlockWithItems } from "@/hooks/useWorksBlocks";
import type { ArtworkData, SeriesData } from "@/types";

export interface WorksBlockDisplay {
  id: string;
  block_type: "single" | "carousel";
  display_order: number;
  artworks: ArtworkData[];
  /** Per-artwork image overrides from works_block_items, keyed by artwork_id */
  imageOverridesByArtwork?: Record<string, { hidden_images?: string[]; image_order?: string[] }>;
}

export interface SeriesWithBlocks extends SeriesData {
  blocks: WorksBlockDisplay[];
  /** Flattened artworks for backward compat (header counting, etc.) */
  artworks: ArtworkData[];
}

export const useArtworksBySeries = () => {
  const { data: series, isLoading: seriesLoading, error: seriesError } = useSeries();
  const { data: allBlocks, isLoading: blocksLoading, error: blocksError } = useWorksBlocks();

  const seriesWithBlocks = useMemo(() => {
    if (!series || !allBlocks) return [];

    return series
      .filter((s) => s.is_visible !== false)
      .map((s) => {
        const seriesBlocks = allBlocks
          .filter((b) => b.series_id === s.id)
          .sort((a, b) => a.display_order - b.display_order)
          .map((block) => ({
            id: block.id,
            block_type: block.block_type as "single" | "carousel",
            display_order: block.display_order,
            artworks: block.items
              .filter((item) => item.artwork && item.artwork.is_visible !== false)
              .sort((a, b) => a.display_order - b.display_order)
              .map((item) => ({
                id: item.artwork.id,
                title: item.artwork.title,
                year: item.artwork.year || "",
                dimensions: item.artwork.dimensions || "",
                materials: item.artwork.materials || "",
                description: item.artwork.description || "",
                image_url: item.artwork.image_url,
                image_detail_url: item.artwork.image_detail_url || "",
                series_id: item.artwork.series_id,
                display_order: item.artwork.display_order,
                is_visible: item.artwork.is_visible,
              })) as ArtworkData[],
          }))
          .filter((block) => block.artworks.length > 0);

        // Flatten for backward compat
        const allArtworks = seriesBlocks.flatMap((b) => b.artworks);

        return {
          ...s,
          blocks: seriesBlocks,
          artworks: allArtworks,
        } as SeriesWithBlocks;
      })
      .filter((s) => s.blocks.length > 0);
  }, [series, allBlocks]);

  return {
    data: seriesWithBlocks,
    isLoading: seriesLoading || blocksLoading,
    error: seriesError || blocksError,
    series,
  };
};
