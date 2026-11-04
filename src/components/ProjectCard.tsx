import { thumbnail } from '../data'
import type { Project } from '../data'
import Icon from './Icon'
import { elementOrigin } from '../projectMotion'
import type { ProjectOrigin } from '../projectMotion'

export default function ProjectCard({ project, onClick }: { project: Project; onClick: (origin: ProjectOrigin) => void }) {
  return <button className="project-card" onPointerMove={event => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.effects === 'off') return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--tilt-x', `${((event.clientY - bounds.top) / bounds.height - .5) * -7}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 9}deg`)
    event.currentTarget.style.setProperty('--shine-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`)
    event.currentTarget.style.setProperty('--shine-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`)
  }} onPointerLeave={event => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg') }} onClick={event => onClick(elementOrigin(event.currentTarget))} aria-label={`View: ${project.title}`} style={{ '--project-color': project.color } as React.CSSProperties}>
    <img src={thumbnail(project)} alt="" loading="lazy" decoding="async" />
    <span className="card-scrim" />
    <span className="card-copy"><strong>{project.title}</strong><small>{project.subtitle}</small></span>
    <span className="card-play"><Icon name="play" size={16} /></span>
    <span className="card-rim" />
    <span className="card-hologram" aria-hidden="true" />
  </button>
}
