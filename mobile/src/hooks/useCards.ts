import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InsertDto, UpdateDto } from "@/types/database.types";

export function useCardsByDeck(deckId: string) {
  return useQuery({
    queryKey: ["cards", deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*, card_states(status, due_date, interval, step_index)")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCard(cardId: string | undefined) {
  return useQuery({
    queryKey: ["cards", "detail", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*, card_states(status)")
        .eq("id", cardId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!cardId,
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (card: InsertDto<"cards">) => {
      const { data, error } = await supabase
        .from("cards")
        .insert(card)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, card) => {
      qc.invalidateQueries({ queryKey: ["cards", card.deck_id] });
      qc.invalidateQueries({ queryKey: ["deck-progress"] });
    },
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      deckId,
      ...updates
    }: UpdateDto<"cards"> & { id: string; deckId: string }) => {
      const { error } = await supabase
        .from("cards")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { deckId }) => {
      qc.invalidateQueries({ queryKey: ["cards", deckId] });
      qc.invalidateQueries({ queryKey: ["cards", "detail"] });
    },
  });
}

export function useSetCardSuspended() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      suspended,
    }: {
      id: string;
      deckId: string;
      suspended: boolean;
    }) => {
      const { error } = await supabase.rpc("set_card_suspended", {
        p_card_id: id,
        p_suspended: suspended,
      });
      if (error) throw error;
    },
    onSuccess: (_data, { deckId }) => {
      qc.invalidateQueries({ queryKey: ["cards", deckId] });
      qc.invalidateQueries({ queryKey: ["cards", "detail"] });
      qc.invalidateQueries({ queryKey: ["deck-progress"] });
      qc.invalidateQueries({ queryKey: ["study-queue", deckId] });
      qc.invalidateQueries({ queryKey: ["review-only-queue", deckId] });
      qc.invalidateQueries({ queryKey: ["folder-review-queue"] });
      qc.invalidateQueries({ queryKey: ["range-review-queue"] });
    },
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; deckId: string }) => {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { deckId }) => {
      qc.invalidateQueries({ queryKey: ["cards", deckId] });
      qc.invalidateQueries({ queryKey: ["deck-progress"] });
    },
  });
}

export function useDeleteCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: { ids: string[]; deckId: string }) => {
      const { error } = await supabase.from("cards").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_data, { deckId }) => {
      qc.invalidateQueries({ queryKey: ["cards", deckId] });
      qc.invalidateQueries({ queryKey: ["deck-progress"] });
    },
  });
}
