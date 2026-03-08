import { useMemo } from "react";
import { useArtworks } from "@/hooks/useArtworks";
import { useSeries } from "@/hooks/useSeries";
import type { ArtworkData, SeriesData } from "@/types";

export interface SeriesWithArtworks extends SeriesData {
  artworks: ArtworkData[];
}

export const useArtworksBySeries = () => {
  const { data: artworks, isLoading: artworksLoading, error: artworksError } = useArtworks();
  const { data: series, isLoading: seriesLoading, error: seriesError } = useSeries();

  const seriesWithArtworks = useMemo(() => {
    if (!artworks || !series) return [];

    return series
      .filter((s) => s.is_visible !== false)
      .map((s) => ({
        ...s,
        artworks: artworks.filter((a) => a.series_id === s.id && a.is_visible !== false),
      }))
      // Only include series that have artworks
      .filter((s) => s.artworks.length > 0);
  }, [artworks, series]);

  return {
    data: seriesWithArtworks,
    isLoading: artworksLoading || seriesLoading,
    error: artworksError || seriesError,
    // Expose individual data for flexibility
    artworks,
    series,
  };
};
