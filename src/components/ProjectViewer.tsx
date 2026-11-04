import { useEffect, useLayoutEffect, useRef } from 'react'
import { relatedProjects } from '../data'
import type { Project } from '../data'
import Icon from './Icon'
import ProjectCard from './ProjectCard'
import VideoPlayer from './VideoPlayer'
import { elementOrigin, useProjectMorph } from '../projectMotion'
import type { ProjectOrigin } from '../projectMotion'
import ProjectFrame from './ProjectFrame'
import ProjectArticle from './ProjectArticle'

export default function ProjectViewer({ project, origin, returnTo, onClose, onSelect, onDetails }: {
  project: Project; origin?: ProjectOrigin; returnTo?: ProjectOrigin; onClose: () => void; onSelect: (project: Project, origin?: ProjectOrigin) => void; onDetails?: (origin: ProjectOrigin) => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => { dialogRef.current?.scrollTo(0, 0) }, [project.slug])
  const dismiss = useProjectMorph(dialogRef, mediaRef, origin, project.slug, returnTo)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (dialogRef.current?.querySelector('dialog[open]')) return
      if (event.key === 'Escape' && !document.fullscreenElement) dismiss(onClose)
      if (event.key === 'Tab') {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button, a, input, [tabindex="0"]')
        if (!elements?.length) return
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus() }
  }, [onClose, dismiss])

  return <div ref={dialogRef} className="project-viewer" style={{ '--project-color': project.color } as React.CSSProperties} data-motion={origin ? 'opening' : 'ready'} role="dialog" aria-modal="true" aria-labelledby="viewer-title">
    <div className="motion-backdrop" aria-hidden="true" />
    <div className="viewer-layout">
      <div className="viewer-main">
        <button ref={closeRef} className="close-button" onClick={() => dismiss(onClose)}><Icon name="close" size={14} />Close</button>
        <div ref={mediaRef} className="viewer-media morph-media">
          <VideoPlayer key={project.slug} project={project} />
          <ProjectFrame frame={origin?.frame} />
        </div>
        <div className="viewer-caption">
          <span className="app-icon" style={{ background: project.color }}>{project.symbol}</span>
          <div className="viewer-caption-text"><h1 id="viewer-title">{onDetails ? <a href={`/work/${project.slug}/`} onClick={event => { event.preventDefault(); if (mediaRef.current) onDetails(elementOrigin(mediaRef.current)) }}>{project.title}</a> : project.title}</h1><p>{project.subtitle}</p></div>
          {project.hasCaseStudy && <a href={`#${project.slug}-story`} className="know-more" onClick={event => { event.preventDefault(); storyRef.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }}>Read the story <Icon name="down" size={11} /></a>}
        </div>
      </div>
      <aside className="viewer-related" aria-label="You may also like">
        <p className="eyebrow">You may also like</p>
        <div className="related-stack">{relatedProjects(project).map(item => <ProjectCard key={item.slug} project={item} onClick={source => onSelect(item, source)} />)}</div>
      </aside>
    </div>
    {project.hasCaseStudy && <div ref={storyRef} className="case-article-anchor"><ProjectArticle key={project.slug} project={project} onBack={onClose} /></div>}
  </div>
}
