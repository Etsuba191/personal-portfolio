import { useEffect, useRef, useState } from 'react'
import { getPublicContent } from '../../api/content.api'

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [audioConfig, setAudioConfig] = useState<{ loop: boolean; volume: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicContent()
      .then((content) => {
        if (content.audio?.enabled && content.audio.url) {
          setAudioSrc(content.audio.url)
          setAudioConfig({ loop: content.audio.loop ?? true, volume: content.audio.volume ?? 0.5 })
        }
      })
      .catch(() => { /* audio load failed */ })
      .finally(() => setLoading(false))
  }, [])

  const toggleAudio = async () => {
    const audio = audioRef.current

    if (!audio || !audioSrc) return

    try {
      if (audio.paused) {
        await audio.play()
        setPlaying(true)
      } else {
        audio.pause()
        setPlaying(false)
      }
    } catch {
      alert('Audio file could not be played.')
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio && audioConfig) {
      audio.loop = audioConfig.loop
      audio.volume = audioConfig.volume
    }
  }, [audioConfig])

  if (loading || !audioSrc) return null

  return (
    <>
      <audio
        ref={audioRef}
        loop={audioConfig?.loop ?? true}
        preload="auto"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      >
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      <button
        type="button"
        className={`audio-player ${playing ? 'playing' : ''}`}
        onClick={toggleAudio}
        aria-label={playing ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      >
        <span className="audio-wave" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>{playing ? 'SOUND ON' : 'SOUND OFF'}</span>
      </button>
    </>
  )
}

export default AudioPlayer