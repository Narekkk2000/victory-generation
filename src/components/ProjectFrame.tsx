import { useLayoutEffect, useRef } from 'react'

/** Keep the handoff frame in canvas memory instead of encoding an image. */
export default function ProjectFrame({ frame }: { frame?: HTMLCanvasElement }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    if (!frame || !ref.current) return
    ref.current.width = frame.width
    ref.current.height = frame.height
    ref.current.getContext('2d')!.drawImage(frame, 0, 0)
  }, [frame])
  return frame ? <canvas ref={ref} className="morph-snapshot" aria-hidden="true" /> : null
}
