import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router";
import TopBar from "@/components/navigation/TopBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatBox, SegmentedProgress } from "@/components/stats";
import { CardListItem, TagFilterBar } from "@/components/cards";
import FAB from "@/components/feedback/FAB";
import NoReviewBanner from "@/components/feedback/NoReviewBanner";
import InputDialog from "@/components/feedback/InputDialog";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import ActionSheet from "@/components/feedback/ActionSheet";
import SortSheet from "@/components/feedback/SortSheet";
import PickerSheet from "@/components/feedback/PickerSheet";
import PageContent from "@/components/layouts/PageContent";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  FileText,
  Camera,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useDeck,
  useDeckProgress,
  useUpdateDeck,
  useDeleteDeck,
  useMoveDeck,
} from "@/hooks/useDecks";
import { useFolders } from "@/hooks/useFolders";
import { useCardsByDeck, useDeleteCards } from "@/hooks/useCards";
import { useStudyQueue, useReviewOnlyQueue } from "@/hooks/useStudy";
import { mapCardStatus } from "@/lib/utils";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/csvExporter";

const DISPLAY_STATUS_ORDER: Record<string, number> = { unknown: 0, learning: 1, upcoming: 2, memorized: 3, suspended: 4 };

const SORT_OPTIONS = [
  { value: "created", label: "추가일순", description: "최신 먼저" },
  {
    value: "status",
    label: "상태순",
    description: "모름 → 배우는중 → 복습예정 → 암기완료",
  },
  { value: "alpha", label: "알파벳순", description: "A → Z" },
  { value: "due", label: "복습일순", description: "오래된 먼저" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export default function DeckPage() {
  const { id: deckId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deck } = useDeck(deckId!);
  const { data: cards, isLoading: cardsLoading } = useCardsByDeck(deckId!);
  const { data: studyQueue } = useStudyQueue(deckId!);
  const { data: reviewQueue } = useReviewOnlyQueue(deckId!, true);
  const { data: deckProgress } = useDeckProgress();
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();
  const moveDeck = useMoveDeck();
  const { data: folders } = useFolders();

  const deleteCards = useDeleteCards();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCards.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    deleteCards.mutate(
      { ids: [...selectedIds], deckId: deckId! },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.size}장 카드 삭제 완료`);
          exitSelectMode();
          setBulkDeleteOpen(false);
        },
      },
    );
  };

  const allTags = useMemo(() => {
    if (!cards) return [];
    const tagSet = new Set<string>();
    cards.forEach((c) => c.tags?.forEach((t: string) => tagSet.add(t)));
    return [...tagSet].sort((a, b) => {
      const dayA = a.match(/^Day (\d+)$/);
      const dayB = b.match(/^Day (\d+)$/);
      if (dayA && dayB) return Number(dayA[1]) - Number(dayB[1]);
      if (dayA) return -1;
      if (dayB) return 1;
      return a.localeCompare(b);
    });
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    const base = selectedTag
      ? cards.filter((c) => c.tags?.includes(selectedTag))
      : [...cards];

    switch (sortKey) {
      case "status": {
        return base.sort((a, b) => {
          const sa = a.card_states?.[0];
          const sb = b.card_states?.[0];
          const oa = DISPLAY_STATUS_ORDER[mapCardStatus(sa?.status, sa?.interval, sa?.step_index)] ?? 0;
          const ob = DISPLAY_STATUS_ORDER[mapCardStatus(sb?.status, sb?.interval, sb?.step_index)] ?? 0;
          return oa - ob;
        });
      }
      case "alpha":
        return base.sort((a, b) => a.word.localeCompare(b.word));
      case "created":
        return base.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "due":
        return base.sort((a, b) => {
          const da = a.card_states?.[0]?.due_date;
          const db = b.card_states?.[0]?.due_date;
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return new Date(da).getTime() - new Date(db).getTime();
        });
      default:
        return base;
    }
  }, [cards, selectedTag, sortKey]);

  const progress = deckProgress?.find((d) => d.deck_id === deckId);
  const unknownCount = progress?.unknown_count ?? 0;
  const learningCount = progress?.learning_count ?? 0;
  const upcomingCount = progress?.upcoming_count ?? 0;
  const memorizedCount = progress?.memorized_count ?? 0;
  const totalCards = progress?.total_cards ?? 0;

  const studyableCount = studyQueue?.length ?? 0;
  const reviewableCount = reviewQueue?.length ?? 0;

  const nextDueLabel = useMemo(() => {
    if (!cards) return null;
    const now = new Date();
    const dueDates = cards
      .map((c) => c.card_states?.[0]?.due_date)
      .filter((d): d is string => !!d)
      .map((d) => new Date(d))
      .filter((d) => d > now);
    if (dueDates.length === 0) return null;
    const nearest = new Date(Math.min(...dueDates.map((d) => d.getTime())));
    const diffMs = nearest.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}분 후`;
    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 후`;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (nearest.toDateString() === tomorrow.toDateString()) {
      return `내일 오전 ${nearest.getHours()}시`;
    }
    const diffDay = Math.round(diffHour / 24);
    return `${diffDay}일 후`;
  }, [cards]);

  const handleRename = (name: string) => {
    updateDeck.mutate(
      { id: deckId!, name },
      { onSuccess: () => setRenameOpen(false) },
    );
  };

  const handleDelete = () => {
    deleteDeck.mutate(deckId!, {
      onSuccess: () => navigate(-1),
    });
  };

  const handleMoveDeck = (targetFolderId: string) => {
    moveDeck.mutate(
      { deckId: deckId!, targetFolderId },
      {
        onSuccess: () => {
          const targetFolder = folders?.find((f) => f.id === targetFolderId);
          toast.success(`"${targetFolder?.name}" 폴더로 이동했습니다`);
        },
      },
    );
  };

  const folderPickerItems = useMemo(
    () =>
      (folders ?? []).map((f) => ({
        id: f.id,
        label: f.name,
      })),
    [folders],
  );

  const actionSheetItems = useMemo(
    () => [
      {
        label: "단어 개별추가",
        icon: Plus,
        onClick: () => navigate(`/deck/${deckId}/add`),
      },
      {
        label: "CSV 가져오기",
        icon: FileText,
        onClick: () => navigate(`/deck/${deckId}/import`),
      },
      {
        label: "사진으로 가져오기",
        icon: Camera,
        onClick: () => navigate(`/deck/${deckId}/photo-import`),
      },
    ],
    [deckId, navigate],
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)!.label;

  return (
    <>
      <PageContent className={totalCards === 0 && !cardsLoading ? "flex flex-col min-h-[calc(100dvh-80px)]" : ""}>
        {selectMode ? (
          <TopBar
            noPadding
            left="back"
            onLeftClick={exitSelectMode}
            title={
              selectedIds.size > 0
                ? `${selectedIds.size}장 선택됨`
                : "카드 선택"
            }
            right={
              <button
                onClick={toggleSelectAll}
                className="typo-body-sm text-accent font-semibold whitespace-nowrap"
              >
                {selectedIds.size === filteredCards.length ? "전체해제" : "전체선택"}
              </button>
            }
          />
        ) : (
          <TopBar
            left="back"
            title={deck?.name ?? ""}
            noPadding
            right={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary">
                    <MoreHorizontal className="w-[18px] h-[18px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {totalCards > 0 && (
                    <DropdownMenuItem onClick={() => setSelectMode(true)}>
                      선택
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                    이름 편집
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMoveSheetOpen(true)}>
                    폴더 이동
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={totalCards === 0}
                    onClick={() => {
                      if (cards && deck) downloadCsv(cards, deck.name);
                    }}
                  >
                    CSV 내보내기
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-danger"
                    onClick={() => setDeleteOpen(true)}
                  >
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        )}
        {cardsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
          </div>
        ) : cards && cards.length > 0 ? (
          <>
            {/* Stat Boxes */}
            <div className="flex gap-[6px]">
              <StatBox value={unknownCount} label="모름" />
              <StatBox value={learningCount} label="배우는중" />
              <StatBox value={upcomingCount} label="복습예정" />
              <StatBox value={memorizedCount} label="암기완료" />
            </div>

            {/* Segmented Progress */}
            <SegmentedProgress
              segments={[
                { value: unknownCount, color: "#E57373" },
                { value: learningCount, color: "#FFB74D" },
                { value: upcomingCount, color: "#A99BF0" },
                { value: memorizedCount, color: "#7C6CE7" },
              ]}
            />

            {/* CTA Buttons */}
            {studyableCount > 0 || reviewableCount > 0 ? (
              <div className="flex gap-2">
                {reviewableCount > 0 && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={`/study/${deckId}?mode=review`}>
                      ▶ 복습만 · {reviewableCount}장
                    </Link>
                  </Button>
                )}
                {studyableCount > 0 && (
                  <Button asChild className="flex-1">
                    <Link to={`/study/${deckId}`}>
                      ▶ 학습 시작 · {studyableCount}장
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <NoReviewBanner nextDueLabel={nextDueLabel} />
            )}

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <TagFilterBar
                tags={allTags}
                selected={selectedTag}
                onSelect={setSelectedTag}
              />
            )}

            {/* Card List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="typo-body-sm text-text-secondary">
                  {selectedTag
                    ? `${filteredCards.length}/${totalCards}장 · ${selectedTag}`
                    : `카드 ${totalCards}장`}
                </span>
                <button
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1 typo-body-sm text-text-primary"
                  onClick={() => setSortSheetOpen(true)}
                >
                  {currentSortLabel}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="rounded-[20px] bg-bg-elevated overflow-hidden mb-6">
                {filteredCards.map((card, i) => {
                  const state = card.card_states?.[0];
                  const divider = i < filteredCards.length - 1 ? "border-b border-border" : "";
                  return selectMode ? (
                    <button
                      key={card.id}
                      type="button"
                      className={`block w-full text-left ${divider}`}
                      onClick={() => toggleSelect(card.id)}
                    >
                      <CardListItem
                        word={card.word}
                        meaning={card.meaning}
                        status={mapCardStatus(state?.status, state?.interval, state?.step_index)}
                        showCheckbox
                        checked={selectedIds.has(card.id)}
                      />
                    </button>
                  ) : (
                    <Link
                      key={card.id}
                      to={`/deck/${deckId}/edit/${card.id}`}
                      className={`block ${divider}`}
                    >
                      <CardListItem
                        word={card.word}
                        meaning={card.meaning}
                        status={mapCardStatus(state?.status, state?.interval, state?.step_index)}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Empty State — 3 CTA cards */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative mb-2">
              <div className="w-24 h-24 rounded-[24px] bg-bg-subtle flex items-center justify-center -rotate-6">
                <span className="text-[40px] rotate-6">📖</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <h2 className="typo-body-lg font-semibold text-text-primary mt-2">
              아직 비어있어요
            </h2>
            <p className="typo-body-sm text-text-secondary mt-1 mb-6">
              첫 단어를 추가하면 학습이 시작됩니다
            </p>
            <div className="w-full flex flex-col gap-3">
              <Link
                to={`/deck/${deckId}/add`}
                className="flex items-center gap-4 rounded-[16px] bg-bg-elevated p-4"
              >
                <div className="w-11 h-11 rounded-[12px] bg-accent-bg flex items-center justify-center text-[20px] shrink-0">
                  ✏️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="typo-body-md font-semibold text-text-primary">직접 입력</div>
                  <div className="typo-caption text-text-secondary">단어와 뜻을 하나씩 추가</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
              </Link>
              <Link
                to={`/deck/${deckId}/photo-import`}
                className="flex items-center gap-4 rounded-[16px] bg-bg-elevated p-4"
              >
                <div className="w-11 h-11 rounded-[12px] bg-accent-bg flex items-center justify-center text-[20px] shrink-0">
                  📷
                </div>
                <div className="flex-1 min-w-0">
                  <div className="typo-body-md font-semibold text-text-primary">사진으로 가져오기</div>
                  <div className="typo-caption text-text-secondary">교재 사진에서 단어 자동 추출</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
              </Link>
              <Link
                to={`/deck/${deckId}/import`}
                className="flex items-center gap-4 rounded-[16px] bg-bg-elevated p-4"
              >
                <div className="w-11 h-11 rounded-[12px] bg-accent-bg flex items-center justify-center text-[20px] shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <div className="typo-body-md font-semibold text-text-primary">CSV 파일 가져오기</div>
                  <div className="typo-caption text-text-secondary">엑셀이나 CSV 파일로 한번에 추가</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
              </Link>
            </div>
          </div>
        )}
      </PageContent>

      {totalCards > 0 && !selectMode && (
        <>
          <FAB
            onClick={() => setActionSheetOpen((v) => !v)}
            isOpen={actionSheetOpen}
          />
          <ActionSheet
            open={actionSheetOpen}
            onClose={() => setActionSheetOpen(false)}
            items={actionSheetItems}
          />
        </>
      )}

      {selectMode && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-bg-base border-t border-border z-50">
          <Button
            variant="destructive"
            className="w-full"
            disabled={selectedIds.size === 0}
            onClick={() => setBulkDeleteOpen(true)}
          >
            {selectedIds.size > 0 ? `${selectedIds.size}장 삭제` : "삭제"}
          </Button>
        </div>
      )}

      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        value={sortKey}
        onChange={(v) => setSortKey(v as SortKey)}
        options={[...SORT_OPTIONS]}
      />

      <InputDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="카드뭉치 이름 편집"
        placeholder="카드뭉치 이름"
        defaultValue={deck?.name}
        submitLabel="저장"
        onSubmit={handleRename}
        loading={updateDeck.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="카드뭉치 삭제"
        description="이 카드뭉치와 포함된 모든 카드가 삭제됩니다. 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={deleteDeck.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="카드 삭제"
        description={`${selectedIds.size}장의 카드를 삭제합니다. 되돌릴 수 없습니다.`}
        onConfirm={handleBulkDelete}
        loading={deleteCards.isPending}
      />

      <PickerSheet
        open={moveSheetOpen}
        onClose={() => setMoveSheetOpen(false)}
        title="폴더 이동"
        items={folderPickerItems}
        selectedId={deck?.folder_id ?? undefined}
        onSelect={handleMoveDeck}
      />
    </>
  );
}
