import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SizeCategory = "S" | "M" | "L";
export type MediumType = "PHOTO" | "POW" | "PAINTING";
export type ArtworkStatus = "available" | "sold" | "reserved";

export interface CatalogArtwork {
  id: string;
  title: string;
  year: string | null;
  dimensions: string | null;
  materials: string | null;
  image_url: string;
  series_id: string;
  is_visible: boolean;
  size_category: SizeCategory | null;
  medium_type: MediumType | null;
  status: ArtworkStatus | null;
  location: string | null;
  notes: string | null;
  edition: string | null;
  catalog_series: string | null;
  ref: string | null;
  series_name?: string;
  series_visible?: boolean;
}

export const useCatalogArtworks = () => {
  return useQuery({
    queryKey: ["catalog-artworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("id, title, year, dimensions, materials, image_url, series_id, is_visible, size_category, medium_type, status, location, notes, edition, catalog_series, series:series(name, is_visible)")
        .order("year", { ascending: false, nullsFirst: false });
      if (error) throw error;

      return (data as any[]).map((d) => ({
        ...d,
        series_name: d.series?.name || "",
        series_visible: d.series?.is_visible ?? true,
        series: undefined,
      })) as CatalogArtwork[];
    },
  });
};

export const useUpdateCatalogField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string | null }) => {
      const { error } = await supabase
        .from("artworks")
        .update({ [field]: value } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-artworks"] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};
