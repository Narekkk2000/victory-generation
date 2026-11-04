import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export interface AnimationAsset { src: string; width: number; height: number }

/** Lazy GIF playback shared by every case study, with a still for reduced motion. */
export default function ProjectAnimation({ asset, poster, alt, aspectRatio }: { asset: AnimationAsset; poster: string; alt: string; aspectRatio?: number }) {
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPaused(preference.matches)
    preference.addEventListener('change', update)
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, { root: ref.current?.closest('.project-viewer'), rootMargin: '300px' })
    if (ref.current) observer.observe(ref.current)
    return () => { observer.disconnect(); preference.removeEventListener('change', update) }
  }, [])
  return <figure ref={ref} className={`guide-animation ${asset.height > asset.width ? 'is-portrait' : ''}`} data-scroll-reveal="media">
    <img src={visible && !paused ? asset.src : poster} alt={alt} width={asset.width} height={asset.height} style={{ aspectRatio: aspectRatio ?? `${asset.width}/${asset.height}`, objectFit: aspectRatio ? 'cover' : 'contain' }} decoding="async" />
    <button onClick={() => setPaused(value => !value)} aria-label={`${paused ? 'Play' : 'Pause'} ${alt}`} aria-pressed={!paused}><Icon name={paused ? 'play' : 'pause'} size={12} /></button>
  </figure>
}
