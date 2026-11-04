import { useState } from 'react'
import type { Project } from '../data'

const positions = [{ x: 22, y: 24 }, { x: 72, y: 17 }, { x: 88, y: 55 }, { x: 58, y: 86 }, { x: 16, y: 74 }]


export default function ProjectConstellation({ project }: { project: Project }) {
  const [active, setActive] = useState(0)
  const points = project.disciplines.length === positions.length ? positions : project.disciplines.map((_, index) => {
    const angle = index / project.disciplines.length * Math.PI * 2 - Math.PI / 2
    return { x: 50 + Math.cos(angle) * 35, y: 50 + Math.sin(angle) * 35 }
  })
  return <section className="project-constellation" style={{ '--constellation-color': project.color } as React.CSSProperties} aria-label="Project disciplines">
    <div className="constellation-copy"><div className="constellation-description" aria-live="polite"><span>0{active + 1} / 0{project.disciplines.length}</span><h3>{project.disciplines[active]}</h3><p>{project.disciplineNotes[active]}</p></div><small>Explore the points to see what went into the project.</small></div>
    <div className="constellation-map">
      <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="50" cy="50" rx="34" ry="34" />
        <ellipse cx="50" cy="50" rx="21" ry="21" />
        {points.map((position, index) => <g key={index} className={active === index ? 'is-active' : ''}><path d={`M 50 50 Q ${position.x} 50 ${position.x} ${position.y}`} /><path className="constellation-signal" d={`M 50 50 Q ${position.x} 50 ${position.x} ${position.y}`} /></g>)}
      </svg>
      <div className="constellation-core" aria-hidden="true"><span>{project.symbol}</span><small>{project.title}</small></div>
      {project.disciplines.map((discipline, index) => <button key={discipline} className={`constellation-node ${active === index ? 'is-active' : ''}`} style={{ left: `${points[index].x}%`, top: `${points[index].y}%` }} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)} aria-pressed={active === index}><span>0{index + 1}</span><small>{discipline}</small></button>)}
      <span className="constellation-coordinate coordinate-top">SCOPE / {String(project.disciplines.length).padStart(2, '0')}</span><span className="constellation-coordinate coordinate-bottom">IDEA → EXPERIENCE</span>
    </div>
  </section>
}
