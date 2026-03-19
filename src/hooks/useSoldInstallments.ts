import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SoldInstallment {
  id: string;
  sold_artwork_id: string;
  installment_number: number;
  due_date: string | null;
  amount: number | null;
  status: string;
  paid_date: string | null;
  notes: string | null;
}

const QUERY_KEY = "sold-installments";

export const useSoldInstallments = (soldArtworkId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, soldArtworkId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sold_installments")
        .select("*")
        .eq("sold_artwork_id", soldArtworkId)
        .order("installment_number", { ascending: true });
      if (error) throw error;
      return data as SoldInstallment[];
    },
    enabled: !!soldArtworkId,
  });
};

export const useSyncInstallments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ soldArtworkId, count, totalPrice }: { soldArtworkId: string; count: number; totalPrice?: number | null }) => {
      // Get existing installments
      const { data: existing = [] } = await (supabase as any)
        .from("sold_installments")
        .select("id, installment_number")
        .eq("sold_artwork_id", soldArtworkId)
        .order("installment_number");

      const existingCount = existing?.length || 0;

      if (count > existingCount) {
        // Add missing installments
        const perInstallment = totalPrice && count > 0 ? Math.round((totalPrice / count) * 100) / 100 : null;
        const toInsert = [];
        for (let i = existingCount + 1; i <= count; i++) {
          toInsert.push({
            sold_artwork_id: soldArtworkId,
            installment_number: i,
            amount: perInstallment,
            status: "pending",
          });
        }
        const { error } = await (supabase as any).from("sold_installments").insert(toInsert);
        if (error) throw error;
      } else if (count < existingCount) {
        // Remove excess installments (highest numbers first)
        const toRemove = existing!.slice(count).map((e: any) => e.id);
        if (toRemove.length > 0) {
          const { error } = await (supabase as any).from("sold_installments").delete().in("id", toRemove);
          if (error) throw error;
        }
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, vars.soldArtworkId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateInstallment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, soldArtworkId, updates }: { id: string; soldArtworkId: string; updates: Record<string, unknown> }) => {
      const { error } = await (supabase as any)
        .from("sold_installments")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return soldArtworkId;
    },
    onSuccess: (soldArtworkId) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, soldArtworkId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
