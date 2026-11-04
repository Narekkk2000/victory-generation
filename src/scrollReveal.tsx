import { Fragment, useLayoutEffect } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import './scrollReveal.css'

type RevealKind = 'media' | 'panel'
type RevealOptions = { rootMargin?: string }

/** One observer per story; works with the window or an enclosing project viewer. */
export function useScrollReveals(scope: RefObject<HTMLElement | null>, { rootMargin = '0px 0px -8% 0px' }: RevealOptions = {}) {
  useLayoutEffect(() => {
    const container = scope.current
    if (!container) return
    const elements = [...container.querySelectorAll<HTMLElement>('[data-scroll-reveal]')]
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
    const root = container.closest<HTMLElement>('.project-viewer')
    let disposed = false
    const show = (element: HTMLElement) => {
      element.dataset.revealState = 'visible'
      observer.unobserve(element)
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) show(entry.target as HTMLElement)
    }, { root, rootMargin, threshold: 0 })

    // Measure natural wrapping rather than fixing lines to one screen width.
    const measureWords = () => {
      if (disposed) return
      for (const element of elements) {
        if (element.dataset.scrollReveal !== 'text' || element.dataset.revealState === 'visible') continue
        let line = 0
        let word = 0
        let previousTop = -Infinity
        for (const span of element.querySelectorAll<HTMLElement>('.reveal-word')) {
          const top = span.offsetTop
          if (top > previousTop + 2) { if (previousTop !== -Infinity) line++; word = 0; previousTop = top }
          span.style.setProperty('--word-delay', `${Math.min(line * 75 + word++ * 14, 650)}ms`)
        }
      }
    }
    const updateMotion = () => {
      const disabled = motionPreference.matches || document.documentElement.dataset.effects === 'off'
      for (const element of elements) {
        if (disabled) show(element)
        else if (element.dataset.revealState !== 'visible') {
          element.dataset.revealState = 'pending'
          observer.observe(element)
        }
      }
      if (!disabled) measureWords()
    }
    const focus = (event: FocusEvent) => {
      const element = (event.target as HTMLElement).closest<HTMLElement>('[data-scroll-reveal]')
      if (element && container.contains(element)) show(element)
    }
    const resize = new ResizeObserver(measureWords)
    resize.observe(container)
    const effects = new MutationObserver(updateMotion)
    effects.observe(document.documentElement, { attributes: true, attributeFilter: ['data-effects'] })
    updateMotion()
    void document.fonts.ready.then(measureWords)
    motionPreference.addEventListener('change', updateMotion)
    container.addEventListener('focusin', focus)
    return () => {
      disposed = true
      observer.disconnect()
      resize.disconnect()
      effects.disconnect()
      motionPreference.removeEventListener('change', updateMotion)
      container.removeEventListener('focusin', focus)
      elements.forEach(element => { delete element.dataset.revealState })
    }
  }, [scope, rootMargin])
}

/** Wrap artwork without changing its proportions or its surrounding grid. */
export function ScrollReveal({ children, className = '', kind = 'media', delay = 0 }: { children: ReactNode; className?: string; kind?: RevealKind; delay?: number }) {
  return <div className={`scroll-reveal ${className}`} data-scroll-reveal={kind} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>{children}</div>
}

/** Natural word wrapping with one uninterrupted copy for assistive technology. */
export function RevealText({ as: Tag = 'p', children, className }: { as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span'; children: string; className?: string }) {
  return <Tag className={className} data-scroll-reveal="text">
    <span className="sr-only">{children}</span>
    <span aria-hidden="true">{children.split(/(\s+)/).map((word, index) => /^\s+$/.test(word)
      ? <Fragment key={index}>{word}</Fragment>
      : <span className="reveal-word" key={index}><span>{word}</span></span>)}</span>
  </Tag>
}
