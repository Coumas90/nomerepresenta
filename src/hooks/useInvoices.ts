import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceArtwork {
  id: string;
  invoice_id: string;
  artwork_id: string;
  display_order: number;
  artwork?: {
    id: string;
    title: string;
    year: string | null;
    dimensions: string | null;
    materials: string | null;
    image_url: string;
  };
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  price: number;
  display_order: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  seller_name: string;
  seller_address: string;
  buyer_name: string;
  buyer_address: string;
  conditions: string;
  total_price: number;
  currency: string;
  magic_token: string;
  status: string;
  created_at: string;
  updated_at: string;
  invoice_artworks?: InvoiceArtwork[];
  invoice_line_items?: InvoiceLineItem[];
}

const QUERY_KEY = ["invoices"];

export const useInvoices = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_artworks(*, artwork:artworks(id, title, year, dimensions, materials, image_url)), invoice_line_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Invoice[];
    },
  });
};

export const useInvoice = (id: string | undefined) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID required");
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_artworks(*, artwork:artworks(id, title, year, dimensions, materials, image_url)), invoice_line_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as Invoice;
    },
    enabled: !!id,
  });
};

export const useInvoiceByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ["invoice-public", token],
    queryFn: async () => {
      if (!token) throw new Error("Token required");
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_artworks(*, artwork:artworks(id, title, year, dimensions, materials, image_url)), invoice_line_items(*)")
        .eq("magic_token", token)
        .single();
      if (error) throw error;
      return data as unknown as Invoice;
    },
    enabled: !!token,
  });
};

export const useNextInvoiceNumber = () => {
  return useQuery({
    queryKey: ["next-invoice-number"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("next_invoice_number");
      if (error) throw error;
      return data as string;
    },
  });
};

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: {
      invoice_number: string;
      invoice_date: string;
      seller_name: string;
      seller_address: string;
      buyer_name: string;
      buyer_address: string;
      conditions: string;
      total_price: number;
      currency: string;
      artwork_ids: string[];
      line_items: { description: string; price: number; display_order: number }[];
    }) => {
      const { artwork_ids, line_items, ...invoiceData } = invoice;
      const { data, error } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select()
        .single();
      if (error) throw error;

      const invoiceId = (data as any).id;

      if (artwork_ids.length > 0) {
        const { error: artErr } = await supabase.from("invoice_artworks").insert(
          artwork_ids.map((aid, i) => ({
            invoice_id: invoiceId,
            artwork_id: aid,
            display_order: i,
          }))
        );
        if (artErr) throw artErr;
      }

      if (line_items.length > 0) {
        const { error: liErr } = await supabase.from("invoice_line_items").insert(
          line_items.map((li) => ({ ...li, invoice_id: invoiceId }))
        );
        if (liErr) throw liErr;
      }

      return invoiceId as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["next-invoice-number"] });
      toast.success("Invoice created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      invoice,
    }: {
      id: string;
      invoice: {
        invoice_number: string;
        invoice_date: string;
        seller_name: string;
        seller_address: string;
        buyer_name: string;
        buyer_address: string;
        conditions: string;
        total_price: number;
        currency: string;
        artwork_ids: string[];
        line_items: { description: string; price: number; display_order: number }[];
      };
    }) => {
      const { artwork_ids, line_items, ...invoiceData } = invoice;
      const { error } = await supabase.from("invoices").update(invoiceData).eq("id", id);
      if (error) throw error;

      // Replace artworks
      await supabase.from("invoice_artworks").delete().eq("invoice_id", id);
      if (artwork_ids.length > 0) {
        const { error: artErr } = await supabase.from("invoice_artworks").insert(
          artwork_ids.map((aid, i) => ({
            invoice_id: id,
            artwork_id: aid,
            display_order: i,
          }))
        );
        if (artErr) throw artErr;
      }

      // Replace line items
      await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
      if (line_items.length > 0) {
        const { error: liErr } = await supabase.from("invoice_line_items").insert(
          line_items.map((li) => ({ ...li, invoice_id: id }))
        );
        if (liErr) throw liErr;
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["invoice", variables.id] });
      toast.success("Invoice updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Invoice deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
