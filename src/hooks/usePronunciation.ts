import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  fetchPronunciation,
  playAudioUrl,
  speakWord,
} from "@/lib/pronunciation"

export function usePronunciation(word: string) {
  const queryClient = useQueryClient()
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel playback and reset state when word changes
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      abortRef.current = null
      setIsPlaying(false)
      setError(null)
    }
  }, [word])

  const play = useCallback(async () => {
    if (isPlaying || !word) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsPlaying(true)
    setError(null)

    try {
      const isPhrase = word.includes(" ")

      if (!isPhrase) {
        // 타임아웃·네트워크 에러면 녹음 없이 TTS로 진행
        const data = await queryClient
          .fetchQuery({
            queryKey: ["pronunciation", word],
            queryFn: () => fetchPronunciation(word),
            staleTime: Infinity,
            retry: false,
          })
          .catch(() => null)

        if (controller.signal.aborted) return

        if (data?.audioUrl) {
          try {
            await playAudioUrl(data.audioUrl, controller.signal)
            return
          } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return
            // MP3 failed, fall through to TTS
          }
        }
      }

      if (controller.signal.aborted) return
      await speakWord(word, controller.signal)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      if (!controller.signal.aborted) {
        setError("발음을 재생할 수 없습니다")
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsPlaying(false)
      }
    }
  }, [isPlaying, word, queryClient])

  return {
    play,
    isPlaying,
    error,
  }
}
