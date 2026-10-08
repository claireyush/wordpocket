import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MEMORIZED_INTERVAL_THRESHOLD = 7;

export type CardDisplayStatus = "unknown" | "learning" | "upcoming" | "memorized" | "suspended";

export function mapCardStatus(
  dbStatus: string | undefined,
  interval: number | undefined,
  stepIndex: number | undefined,
): CardDisplayStatus {
  if (!dbStatus || dbStatus === "new") return "unknown";
  if (dbStatus === "suspended") return "suspended";
  if (dbStatus === "learning") {
    return (stepIndex ?? 0) === 0 ? "unknown" : "learning";
  }
  if (dbStatus === "review") {
    return (interval ?? 0) >= MEMORIZED_INTERVAL_THRESHOLD ? "memorized" : "upcoming";
  }
  return "unknown";
}

export function formatInterval(days: number): string {
  if (days < 1) {
    const minutes = Math.round(days * 24 * 60);
    return minutes <= 0 ? "1분" : `${minutes}분`;
  }
  if (days < 30) return `${Math.round(days)}일`;
  if (days < 365) return `${Math.round(days / 30)}개월`;
  return `${+(days / 365).toFixed(1)}년`;
}

interface CardForInterval {
  status: string;
  ease_factor: number;
  interval: number;
  step_index: number;
}

export function computeIntervals(card: CardForInterval): {
  again: string;
  hard: string;
  good: string;
  easy: string;
} {
  if (card.status === "new" || card.status === "learning") {
    return { again: "1분", hard: "10분", good: "1일", easy: "4일" };
  }

  const ef = card.ease_factor || 2.5;
  const iv = card.interval || 1;

  const hardDays = Math.max(1, Math.round(iv * 1.2));
  const goodDays = Math.max(1, Math.round(iv * ef));
  const easyDays = Math.max(1, Math.round(iv * ef * 1.3));

  return {
    again: "1분",
    hard: formatInterval(hardDays),
    good: formatInterval(goodDays),
    easy: formatInterval(easyDays),
  };
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000,
  );

  if (seconds < 60) return "방금 전";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;

  const months = Math.floor(days / 30);
  return `${months}개월 전`;
}
