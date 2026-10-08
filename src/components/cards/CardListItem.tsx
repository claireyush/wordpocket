import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CardDisplayStatus } from "@/lib/utils"

interface CardListItemProps {
  word: string
  meaning: string
  status: CardDisplayStatus
  showCheckbox?: boolean
  checked?: boolean
}

const statusLabel: Record<CardDisplayStatus, string> = {
  unknown: "모름",
  learning: "배우는중",
  upcoming: "복습예정",
  memorized: "암기완료",
  suspended: "제외됨",
}

export default function CardListItem({ word, meaning, status, showCheckbox, checked }: CardListItemProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {showCheckbox && (
        <div
          className={cn(
            "w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
            checked
              ? "bg-accent border-accent"
              : "bg-transparent border-text-tertiary"
          )}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
      )}
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <span className="typo-body-lg font-display shrink-0">{word}</span>
        <span className="typo-mono-sm text-text-secondary truncate">{meaning}</span>
      </div>
      <Badge variant={status} className="shrink-0">{statusLabel[status]}</Badge>
    </div>
  )
}
