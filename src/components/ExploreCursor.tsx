import { useEffect, useRef } from 'react'

export default function ExploreCursor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return
    const cursor = ref.current!
    const label = cursor.querySelector('small')!
    let frame = 0
    let x = -100
    let y = -100
    let targetX = x
    let targetY = y
    let dragging = false
    const draw = () => {
      x += (targetX - x) * .35
      y += (targetY - y) * .35
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .3) frame = requestAnimationFrame(draw)
      else frame = 0
    }
    const move = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      const target = event.target as HTMLElement
      const visible = target.matches('.gallery-canvas') || Boolean(target.closest('.project-card, .project-index-row'))
      cursor.classList.toggle('is-visible', visible)
      if (!dragging) label.textContent = 'OPEN'
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const down = () => { dragging = true; cursor.classList.add('is-held'); label.textContent = 'DRAG' }
    const up = () => { dragging = false; cursor.classList.remove('is-held'); label.textContent = 'OPEN' }
    const leave = () => cursor.classList.remove('is-visible')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])
  return <div className="explore-cursor" ref={ref} aria-hidden="true"><span><b>↗</b><small>OPEN</small></span></div>
}
