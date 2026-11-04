import { projects, thumbnail } from '../data'
import type { Project } from '../data'
import { elementOrigin } from '../projectMotion'
import type { ProjectOrigin } from '../projectMotion'
import Icon from './Icon'

export default function ProjectIndex({ onSelect, onHover }: { onSelect: (project: Project, origin?: ProjectOrigin) => void; onHover: (project: Project) => void }) {
  return <section className="project-index" aria-label="Project index">
    <div className="index-table-heading"><span>Project</span><span>Discipline / Industry</span><span>Focus</span></div>
    {projects.map((project, index) => <button key={project.slug} className="project-index-row" onMouseEnter={() => onHover(project)} onFocus={() => onHover(project)} onClick={event => {
      const origin = elementOrigin(event.currentTarget.querySelector<HTMLElement>('.index-thumbnail')!)
      origin.projectSlug = project.slug
      onSelect(project, origin)
    }}>
      <span className="index-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="index-thumbnail"><img src={thumbnail(project)} alt="" loading="lazy" decoding="async" /></span>
      <strong>{project.title}</strong>
      <span className="index-industry">{project.industry}</span>
      <span className="index-year">{project.disciplines[0]}</span>
      <Icon name="arrow" size={20} />
    </button>)}
    <p className="index-endnote">A collection of ideas made real. Always a work in progress.</p>
  </section>
}
