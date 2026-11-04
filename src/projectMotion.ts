import { useCallback, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

export interface ProjectOrigin {
  left: number
  top: number
  width: number
  height: number
  radius: number
  frame?: HTMLCanvasElement
  currentTime?: number
  gallery?: boolean
  projectSlug?: string
  viewportWidth: number
  viewportHeight: number
}

export function elementOrigin(element: HTMLElement): ProjectOrigin {
  const rect = element.getBoundingClientRect()
  const media = element.querySelector('video, img') as HTMLVideoElement | HTMLImageElement | null
  let frame: HTMLCanvasElement | undefined
  if (media) {
    const width = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth
    const height = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight
    if (width && height) {
      frame = document.createElement('canvas')
      frame.width = Math.min(720, Math.ceil(rect.width))
      frame.height = Math.max(1, Math.round(frame.width * rect.height / rect.width))
      const ratio = Math.max(frame.width / width, frame.height / height)
      frame.getContext('2d')!.drawImage(media, (frame.width - width * ratio) / 2, (frame.height - height * ratio) / 2, width * ratio, height * ratio)
    }
  }
  return {
    left: rect.left, top: rect.top, width: rect.width, height: rect.height,
    radius: parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0,
    frame, currentTime: media instanceof HTMLVideoElement ? media.currentTime : undefined,
    viewportWidth: innerWidth, viewportHeight: innerHeight,
  }
}

/**
 * Both shapes are traced as the same ring of points, so the browser can interpolate
 * one into the other: a superellipse whose exponent runs from a rounded diamond to a
 * rectangle. The catalogue shows diamonds; opening a project unfolds one into its page.
 */
const SHAPE_STEPS = 48

function superellipse(exponent: number) {
  const points: string[] = []
  for (let step = 0; step < SHAPE_STEPS; step++) {
    const angle = (step / SHAPE_STEPS) * Math.PI * 2 - Math.PI / 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const radius = Math.pow(Math.pow(Math.abs(cos), exponent) + Math.pow(Math.abs(sin), exponent), -1 / exponent)
    points.push(`${(50 + 50 * cos * radius).toFixed(2)}% ${(50 + 50 * sin * radius).toFixed(2)}%`)
  }
  return `polygon(${points.join(',')})`
}

const DIAMOND = superellipse(1.4)
const RECTANGLE = superellipse(22)

const EASE = 'cubic-bezier(.22, 1, .36, 1)'
const OPEN_DURATION = 480
const CLOSE_DURATION = 280

/** Transform and opacity only: no encoding, full-screen repaint, or delayed controls. */
export function useProjectMorph(
  shellRef: RefObject<HTMLElement | null>,
  mediaRef: RefObject<HTMLElement | null>,
  origin: ProjectOrigin | undefined,
  identity: string,
  returnTo: ProjectOrigin | undefined = origin,
) {
  const controls = useRef<{ close: (finish: () => void) => void } | null>(null)
  useLayoutEffect(() => {
    const shell = shellRef.current
    const media = mediaRef.current
    if (!shell || !media) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const backdrop = shell.querySelector<HTMLElement>('.motion-backdrop')
    const snapshot = media.querySelector<HTMLElement>('.morph-snapshot')
    const player = media.querySelector('video')
    const animations: Animation[] = []
    const timers = new Set<ReturnType<typeof setTimeout>>()
    let closing = false
    let disposed = false
    let completed = false
    let closeFinished: (() => void) | undefined
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => { timers.delete(timer); if (!disposed) callback() }, delay)
      timers.add(timer)
    }
    const cancel = () => {
      animations.splice(0).forEach(animation => { animation.onfinish = null; animation.cancel() })
      timers.forEach(clearTimeout)
      timers.clear()
    }
    const ready = () => {
      if (disposed || closing) return
      shell.dataset.motion = 'ready'
      if (snapshot) snapshot.style.opacity = '0'
      cancel()
      media.style.clipPath = ''
    }
    const syncTime = () => {
      if (player && origin?.currentTime !== undefined && Number.isFinite(player.duration) && player.duration > 0) player.currentTime = origin.currentTime % player.duration
    }
    if (player && origin?.currentTime !== undefined) {
      if (player.readyState >= 1) syncTime()
      else player.addEventListener('loadedmetadata', syncTime, { once: true })
    }
    const validOrigin = origin && origin.width > 0 && origin.height > 0
    shell.dataset.motion = validOrigin && !reduced ? 'opening' : 'ready'
    if (validOrigin && !reduced) {
      const rect = media.getBoundingClientRect()
      const flight = media.animate([
        { transform: `translate3d(${origin.left - rect.left}px,${origin.top - rect.top}px,0) scale(${origin.width / rect.width},${origin.height / rect.height})` },
        { transform: 'none' },
      ], { duration: OPEN_DURATION, easing: EASE, fill: 'both' })
      animations.push(flight)
      if (backdrop) animations.push(backdrop.animate([{ opacity: origin.gallery ? 0 : 1 }, { opacity: 1 }], { duration: 260, easing: 'ease-out', fill: 'both' }))
      // A card lifted out of the catalogue arrives as a diamond and unfolds on the way in.
      if (origin.gallery) {
        const unfold = media.animate([{ clipPath: DIAMOND }, { clipPath: RECTANGLE }], { duration: OPEN_DURATION, easing: EASE, fill: 'both' })
        unfold.onfinish = () => { media.style.clipPath = '' }
        animations.push(unfold)
      }
      if (snapshot) animations.push(snapshot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: 80, fill: 'both' }))
      // Show the surrounding UI during settling, rather than waiting for the flight.
      later(() => { if (!closing) shell.dataset.motion = 'settling' }, 120)
      flight.onfinish = ready
      later(ready, OPEN_DURATION + 80)
    }
    const close = (onFinish: () => void) => {
      if (closing || disposed) return
      closing = true
      const currentTransform = getComputedStyle(media).transform
      const backdropOpacity = backdrop ? getComputedStyle(backdrop).opacity : '1'
      cancel()
      shell.dataset.motion = 'closing'
      if (snapshot) snapshot.style.opacity = '0'
      const complete = () => {
        if (disposed || completed) return
        completed = true
        timers.forEach(clearTimeout)
        timers.clear()
        onFinish()
      }
      closeFinished = complete
      if (reduced) { complete(); return }
      const validReturn = returnTo && returnTo.width > 0 && returnTo.height > 0
        && returnTo.viewportWidth === innerWidth && returnTo.viewportHeight === innerHeight
        && (!returnTo.projectSlug || returnTo.projectSlug === identity)
      const rect = media.getBoundingClientRect()
      // Fold back into a diamond only when the card is returning to the catalogue.
      if (returnTo?.gallery) animations.push(media.animate([{ clipPath: RECTANGLE }, { clipPath: DIAMOND }], { duration: CLOSE_DURATION, easing: EASE, fill: 'both' }))
      const flight = validReturn ? media.animate([
        { transform: currentTransform },
        { transform: `translate3d(${returnTo.left - rect.left}px,${returnTo.top - rect.top}px,0) scale(${returnTo.width / rect.width},${returnTo.height / rect.height})`, opacity: .4 },
      ], { duration: CLOSE_DURATION, easing: EASE, fill: 'both' }) : media.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'both' })
      animations.push(flight)
      if (backdrop) animations.push(backdrop.animate([{ opacity: backdropOpacity }, { opacity: 0 }], { duration: validReturn ? CLOSE_DURATION : 160, fill: 'both' }))
      flight.onfinish = complete
      later(complete, CLOSE_DURATION + 80)
    }
    const resize = () => { if (closing) closeFinished?.(); else ready() }
    controls.current = { close }
    window.addEventListener('resize', resize)
    return () => {
      disposed = true
      cancel()
      controls.current = null
      player?.removeEventListener('loadedmetadata', syncTime)
      window.removeEventListener('resize', resize)
    }
  }, [identity, origin, returnTo, shellRef, mediaRef])
  return useCallback((finish: () => void) => {
    if (controls.current) controls.current.close(finish)
    else finish()
  }, [])
}
