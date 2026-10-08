import { Badge } from "@/components/ui/badge"
import { mapCardStatus } from "@/lib/utils"
import type { CardDisplayStatus } from "@/lib/utils"

interface SearchResultItemProps {
  word: string
  meaning: string
  deckName: string
  folderName: string | null
  status: "new" | "learning" | "review"
  interval?: number
  stepIndex?: number
  query: string
  onClick: () => void
}

const statusLabel: Record<CardDisplayStatus, string> = {
  unknown: "모름",
  learning: "배우는중",
  upcoming: "복습예정",
  memorized: "암기완료",
  suspended: "제외됨",
}

function highlightMatch(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)
  return (
    <>
      {before}
      <span className="text-accent font-semibold">{match}</span>
      {after}
    </>
  )
}

export default function SearchResultItem({
  word,
  meaning,
  deckName,
  folderName,
  status,
  interval,
  stepIndex,
  query,
  onClick,
}: SearchResultItemProps) {
  const location = folderName ? `${folderName} · ${deckName}` : deckName
  const mappedStatus = mapCardStatus(status, interval, stepIndex)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-2 active:bg-bg-subtle transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="typo-body-lg font-display">
            {highlightMatch(word, query)}
          </span>
          <span className="typo-mono-sm text-text-secondary truncate">
            {highlightMatch(meaning, query)}
          </span>
        </div>
        <div className="typo-mono-sm text-text-tertiary mt-[2px]">
          {location}
        </div>
      </div>
      <Badge variant={mappedStatus} className="shrink-0">
        {statusLabel[mappedStatus]}
      </Badge>
    </button>
  )
}
