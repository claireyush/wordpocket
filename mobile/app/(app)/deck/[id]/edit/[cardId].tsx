import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { SettingsRow } from "@/components/forms/SettingsRow";
import { useCard, useUpdateCard, useDeleteCard, useSetCardSuspended } from "@/hooks/useCards";
import { colors } from "@/lib/theme";

export default function EditCardPage() {
  const { id: deckId, cardId } = useLocalSearchParams<{ id: string; cardId: string }>();
  const { data: card } = useCard(cardId);
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const setSuspended = useSetCardSuspended();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [tags, setTags] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (card) {
      setWord(card.word); setMeaning(card.meaning);
      setExample(card.example ?? ""); setPronunciation(card.pronunciation ?? "");
      setSynonyms(card.synonyms?.join(", ") ?? ""); setTags(card.tags?.join(", ") ?? "");
    }
  }, [card]);

  const loading = updateCard.isPending;
  const isSuspended = card?.card_states?.[0]?.status === "suspended";

  const handleToggleSuspend = () => {
    if (setSuspended.isPending) return;
    setSuspended.mutate({ id: cardId!, deckId: deckId!, suspended: !isSuspended });
  };

  const handleSubmit = () => {
    if (!word.trim() || !meaning.trim()) return;
    updateCard.mutate(
      {
        id: cardId!, deckId: deckId!,
        word: word.trim(), meaning: meaning.trim(),
        example: example.trim() || null, pronunciation: pronunciation.trim() || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        synonyms: synonyms.split(",").map((s) => s.trim()).filter(Boolean),
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}><X size={24} color={colors.text.primary} /></Pressable>
        <Text className="text-body-md font-semibold text-text-primary">카드 편집</Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text className="text-caption font-semibold text-accent">{loading ? "저장 중..." : "저장"}</Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerClassName="px-6 pb-8 gap-[10px]" keyboardShouldPersistTaps="handled">
          <View><Label>단어 *</Label><Input value={word} onChangeText={setWord} /></View>
          <View><Label>뜻 *</Label><Input value={meaning} onChangeText={setMeaning} /></View>
          <View><Label>예문</Label><Input value={example} onChangeText={setExample} /></View>
          <View><Label>발음</Label><Input value={pronunciation} onChangeText={setPronunciation} /></View>
          <View><Label>유의어</Label><Input value={synonyms} onChangeText={setSynonyms} placeholder="쉼표로 구분" /></View>
          <View><Label>태그</Label><Input value={tags} onChangeText={setTags} placeholder="쉼표로 구분" /></View>
          <View className="mt-4">
            <SettingsRow
              label="복습에서 제외"
              description="켜면 학습과 복습 큐에 나오지 않아요"
              toggle
              toggleOn={isSuspended}
              noBorder
              onPress={handleToggleSuspend}
            />
          </View>
          <Pressable onPress={() => setDeleteOpen(true)} className="mt-2 py-3 items-center rounded-xl">
            <Text className="text-body-md font-semibold text-danger">카드 삭제</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmDialog
        open={deleteOpen} onClose={() => setDeleteOpen(false)}
        title="카드 삭제" description="이 카드를 삭제합니다. 되돌릴 수 없습니다."
        onConfirm={() => deleteCard.mutate({ id: cardId!, deckId: deckId! }, { onSuccess: () => router.back() })}
        loading={deleteCard.isPending}
      />
    </SafeAreaView>
  );
}
