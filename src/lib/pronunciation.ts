interface PronunciationResult {
  audioUrl: string | null
  phonetic: string | null
  source: "dictionary-api"
}

export async function fetchPronunciation(
  word: string,
): Promise<PronunciationResult> {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
  )
  if (!res.ok) {
    return { audioUrl: null, phonetic: null, source: "dictionary-api" }
  }

  const data = await res.json()
  const entry = data[0]

  let audioUrl: string | null = null
  let phonetic: string | null = entry?.phonetic ?? null

  for (const p of entry?.phonetics ?? []) {
    if (p.audio) {
      audioUrl = p.audio
      if (p.text) phonetic = p.text
      break
    }
  }

  return { audioUrl, phonetic, source: "dictionary-api" }
}

export function playAudioUrl(url: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    const audio = new Audio(url)

    const onAbort = () => {
      audio.pause()
      audio.removeAttribute("src")
      reject(new DOMException("Aborted", "AbortError"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })

    audio.addEventListener("ended", () => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    })
    audio.addEventListener("error", () => {
      signal?.removeEventListener("abort", onAbort)
      reject(new Error("Audio playback failed"))
    })
    audio.play().catch((err) => {
      signal?.removeEventListener("abort", onAbort)
      reject(err)
    })
  })
}

// Apple 기기에서 받은 고품질 음성(Premium > Enhanced)을 우선 선택. 없으면 null → 브라우저 기본 음성
const VOICE_QUALITY_KEYWORDS: [string[], number][] = [
  [["premium", "프리미엄"], 2],
  [["enhanced", "향상"], 1],
]

export function pickPreferredVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null
  let bestScore = 0
  for (const v of voices) {
    if (!v.lang.toLowerCase().startsWith("en")) continue
    const id = `${v.name} ${v.voiceURI}`.toLowerCase()
    const quality =
      VOICE_QUALITY_KEYWORDS.find(([keys]) => keys.some((k) => id.includes(k)))?.[1] ?? 0
    if (quality === 0) continue
    const score = quality * 10 + (v.lang.replace("_", "-") === "en-US" ? 1 : 0)
    if (score > bestScore) {
      best = v
      bestScore = score
    }
  }
  return best
}

// Chrome은 첫 getVoices() 호출 시 빈 배열을 주므로 voiceschanged를 잠깐 기다림
function loadVoices(timeoutMs = 1000): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis
  const voices = synth.getVoices()
  if (voices.length > 0) return Promise.resolve(voices)
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", done)
      clearTimeout(timer)
      resolve(synth.getVoices())
    }
    const timer = setTimeout(done, timeoutMs)
    synth.addEventListener("voiceschanged", done)
  })
}

export async function speakWord(word: string, signal?: AbortSignal): Promise<void> {
  const voice = window.speechSynthesis
    ? pickPreferredVoice(await loadVoices())
    : null

  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("SpeechSynthesis not supported"))
      return
    }

    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = voice?.lang ?? "en-US"
    if (voice) utterance.voice = voice
    utterance.rate = 0.9
    utterance.onend = () => resolve()
    utterance.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") {
        reject(new DOMException("Aborted", "AbortError"))
      } else {
        reject(new Error(e.error))
      }
    }

    signal?.addEventListener("abort", () => {
      window.speechSynthesis.cancel()
    }, { once: true })

    window.speechSynthesis.speak(utterance)
  })
}
