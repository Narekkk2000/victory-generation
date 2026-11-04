import { useEffect, useRef, useState } from 'react'
import { thumbnail, webp } from '../data'
import type { Project } from '../data'
import Icon from './Icon'

const formatTime = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`

export default function VideoPlayer({ project, autoPlay = true }: { project: Project; autoPlay?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(true)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTime(0)
    setDuration(0)
    setFailed(false)
    setPlaying(autoPlay)
    setShowControls(true)
    return () => { if (controlTimer.current) clearTimeout(controlTimer.current) }
  }, [project.slug, autoPlay])

  const toggle = () => {
    const video = videoRef.current
    if (!video || failed) return
    if (video.paused) video.play().catch(() => setPlaying(false))
    else video.pause()
  }

  const reveal = () => {
    setShowControls(true)
    if (controlTimer.current) clearTimeout(controlTimer.current)
    controlTimer.current = setTimeout(() => { if (!videoRef.current?.paused) setShowControls(false) }, 2200)
  }

  const expand = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen().catch(() => setFullscreen(value => !value))
    else setFullscreen(value => !value)
  }

  return <div ref={containerRef} className={`video-player ${fullscreen ? 'is-expanded' : ''} ${showControls || !playing ? 'show-controls' : ''}`} onPointerMove={reveal} onPointerLeave={() => playing && setShowControls(false)} onFocus={reveal}>
    {project.video && !failed ? <video
      key={project.slug} ref={videoRef} src={project.video} poster={thumbnail(project)}
      autoPlay={autoPlay} playsInline muted={muted} loop preload="metadata"
      onClick={toggle} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
      onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
      onError={() => { setFailed(true); setPlaying(false) }}
      aria-label={`${project.title} project film`}
    /> : <img className="player-still" src={webp(project.image)} alt={`${project.title} — ${project.industry}`} />}
    <div className="player-glass" aria-hidden="true" />
    {!playing && !failed && project.video && <button className="big-play" onClick={toggle} aria-label="Play film"><Icon name="play" size={26} /></button>}
    {project.video && !failed && <div className="player-controls">
      <input className="video-seek" type="range" min="0" max={duration || 1} step="0.1" value={time} aria-label="Seek" onChange={event => {
        const next = Number(event.target.value)
        if (videoRef.current) videoRef.current.currentTime = next
        setTime(next)
      }} style={{ '--progress': `${duration ? time / duration * 100 : 0}%` } as React.CSSProperties} />
      <div className="player-control-row">
        <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}><Icon name={playing ? 'pause' : 'play'} size={16} /></button>
        <span className="video-time">{formatTime(time)} <span>/</span> {formatTime(duration)}</span>
        <div className="control-spacer" />
        <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute' : 'Mute'}><Icon name={muted ? 'mute' : 'volume'} size={16} /></button>
        <button onClick={expand} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}><Icon name="expand" size={16} /></button>
      </div>
    </div>}
    {(!project.video || failed) && <div className="still-controls"><span>PROJECT OVERVIEW</span><button onClick={expand} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}><Icon name="expand" /></button></div>}
    {fullscreen && <button className="expanded-close" onClick={() => setFullscreen(false)} aria-label="Exit full screen"><Icon name="close" /></button>}
  </div>
}
