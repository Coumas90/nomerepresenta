import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SoldArtwork {
  id: string;
  artwork_id: string;
  date_sold: string | null;
  sale_price: number | null;
  currency: string | null;
  payment_status: string | null;
  installment_count: number | null;
  installment_start_date: string | null;
  installment_end_date: string | null;
  collector_name: string | null;
  collector_type: string | null;
  collector_city: string | null;
  collector_country: string | null;
  collector_email: string | null;
  collector_phone: string | null;
  sold_through: string | null;
  gallery_name: string | null;
  commission_percentage: number | null;
  invoice_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  artwork?: {
    id: string;
    title: string;
    image_url: string;
    year: string | null;
    dimensions: string | null;
    materials: string | null;
    catalog_series: string | null;
  };
}

const QUERY_KEY = ["sold-artworks"];

export const useSoldArtworks = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sold_artworks")
        .select("*, artwork:artworks(id, title, image_url, year, dimensions, materials, catalog_series)")
        .order("date_sold", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as unknown as SoldArtwork[];
    },
  });
};

export const useAddSoldArtwork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (artworkId: string) => {
      const { error } = await supabase
        .from("sold_artworks")
        .insert({ artwork_id: artworkId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Artwork added to sold list");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateSoldArtwork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("sold_artworks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteSoldArtwork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sold_artworks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Removed from sold list");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUploadInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ soldId, file }: { soldId: string; file: File }) => {
      const ext = file.name.split(".").pop();
      const path = `${soldId}/invoice.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("invoices")
        .getPublicUrl(path);

      // Since bucket is private, we store the path and generate signed URLs on demand
      const { error } = await supabase
        .from("sold_artworks")
        .update({ invoice_url: path })
        .eq("id", soldId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Invoice uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDownloadInvoice = () => {
  return async (path: string) => {
    const { data, error } = await supabase.storage
      .from("invoices")
      .createSignedUrl(path, 60);
    if (error) {
      toast.error("Failed to download invoice");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };
};
