import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import CardForm from "@/components/forms/CardForm"
import type { CardFormData } from "@/components/forms/CardForm"
import ConfirmDialog from "@/components/feedback/ConfirmDialog"
import PageContent from "@/components/layouts/PageContent"
import SettingsRow from "@/components/forms/SettingsRow"
import { useCard, useCreateCard, useUpdateCard, useDeleteCard, useSetCardSuspended } from "@/hooks/useCards"

export default function CardFormPage() {
  const { id: deckId, cardId } = useParams<{ id: string; cardId: string }>()
  const navigate = useNavigate()
  const isEdit = !!cardId
  const { data: card } = useCard(cardId)
  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const deleteCard = useDeleteCard()
  const setSuspended = useSetCardSuspended()
  const [key, setKey] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const loading = createCard.isPending || updateCard.isPending
  const isSuspended = card?.card_states?.[0]?.status === "suspended"

  const handleToggleSuspend = () => {
    if (setSuspended.isPending) return
    setSuspended.mutate(
      { id: cardId!, deckId: deckId!, suspended: !isSuspended },
      {
        onSuccess: () =>
          toast.success(isSuspended ? "복습에 다시 포함했어요" : "복습에서 제외했어요"),
      },
    )
  }

  const handleSubmit = (data: CardFormData) => {
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const synonyms = data.synonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (isEdit) {
      updateCard.mutate(
        {
          id: cardId!,
          deckId: deckId!,
          word: data.word,
          meaning: data.meaning,
          example: data.example || null,
          pronunciation: data.pronunciation || null,
          tags,
          synonyms,
        },
        {
          onSuccess: () => navigate(-1),
        },
      )
    } else {
      createCard.mutate(
        {
          deck_id: deckId!,
          word: data.word,
          meaning: data.meaning,
          example: data.example || null,
          pronunciation: data.pronunciation || null,
          tags,
          synonyms,
        },
        {
          onSuccess: () => {
            toast.success(`${data.word} 추가 완료`)
            setKey((k) => k + 1)
          },
        },
      )
    }
  }

  return (
    <>
      <TopBar
        left="close"
        title={isEdit ? "카드 편집" : "카드 추가"}
        right={
          <button
            type="submit"
            form="card-form"
            className="typo-caption text-accent font-semibold cursor-pointer"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        }
      />
      <CardForm
        key={key}
        initialData={isEdit ? card : null}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {isEdit && (
        <>
          <PageContent className="pt-0 mt-6 pb-10">
            <SettingsRow
              label="복습에서 제외"
              description="켜면 학습과 복습 큐에 나오지 않아요"
              toggle
              toggleOn={isSuspended}
              onPress={handleToggleSuspend}
            />
            <button
              className="w-full py-3 rounded-[14px] typo-body-md text-danger font-semibold transition-colors active:bg-danger/10"
              onClick={() => setDeleteOpen(true)}
            >
              카드 삭제
            </button>
          </PageContent>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="카드 삭제"
            description="이 카드를 삭제합니다. 되돌릴 수 없습니다."
            onConfirm={() => {
              deleteCard.mutate(
                { id: cardId!, deckId: deckId! },
                { onSuccess: () => navigate(-1) },
              )
            }}
            loading={deleteCard.isPending}
          />
        </>
      )}
    </>
  )
}
