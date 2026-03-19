import { useMemo } from "react";
import { useWorksSections, type WorksSection } from "@/hooks/useWorksSections";
import { useWorksBlocks, type WorksBlockWithItems } from "@/hooks/useWorksBlocks";
import type { ArtworkData, ArtworkImage } from "@/types";

export interface WorksBlockDisplay {
  id: string;
  block_type: "single" | "carousel";
  display_order: number;
  artworks: ArtworkData[];
  imageOverridesByArtwork?: Record<string, { hidden_images?: string[]; image_order?: string[] }>;
}

export interface SectionWithBlocks {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
  show_name_in_menu: boolean;
  blocks: WorksBlockDisplay[];
  artworks: ArtworkData[];
}

export const useArtworksBySeries = () => {
  const { data: sections, isLoading: sectionsLoading, error: sectionsError } = useWorksSections();
  const { data: allBlocks, isLoading: blocksLoading, error: blocksError } = useWorksBlocks();

  const sectionsWithBlocks = useMemo(() => {
    if (!sections || !allBlocks) return [];

    return sections
      .filter((s) => s.is_visible !== false)
      .sort((a, b) => a.display_order - b.display_order)
      .map((s) => {
        const sectionBlocks = allBlocks
          .filter((b) => b.section_id === s.id)
          .sort((a, b) => a.display_order - b.display_order)
          .map((block) => {
            const validItems = block.items
              .filter((item) => item.artwork && item.artwork.is_visible !== false)
              .sort((a, b) => a.display_order - b.display_order);

            if ((block as any).is_hidden === true) return null;

            const imageOverridesByArtwork: Record<string, { hidden_images?: string[]; image_order?: string[] }> = {};
            for (const item of validItems) {
              const overrides = (item as any).image_overrides;
              if (overrides && (overrides.hidden_images?.length || overrides.image_order?.length)) {
                imageOverridesByArtwork[item.artwork_id] = overrides;
              }
            }

            return {
              id: block.id,
              block_type: block.block_type as "single" | "carousel",
              display_order: block.display_order,
              artworks: validItems.map((item) => ({
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
              imageOverridesByArtwork: Object.keys(imageOverridesByArtwork).length > 0 ? imageOverridesByArtwork : undefined,
            };
          })
          .filter((block): block is NonNullable<typeof block> => block !== null && block.artworks.length > 0);

        const allArtworks = sectionBlocks.flatMap((b) => b.artworks);

        return {
          id: s.id,
          name: s.name,
          description: null,
          display_order: s.display_order,
          is_visible: s.is_visible,
          show_name_in_menu: true,
          blocks: sectionBlocks,
          artworks: allArtworks,
        } as SectionWithBlocks;
      })
      .filter((s) => s.blocks.length > 0);
  }, [sections, allBlocks]);

  return {
    data: sectionsWithBlocks,
    isLoading: sectionsLoading || blocksLoading,
    error: sectionsError || blocksError,
    series: sections,
  };
};
