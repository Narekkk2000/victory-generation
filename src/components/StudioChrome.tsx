import Icon from './Icon'
import { projects } from '../data'
import type { Project } from '../data'

export function StudioHeader({ compact, project = false, view, onView, onHome }: { compact: boolean; project?: boolean; view: 'canvas' | 'index'; onView: (view: 'canvas' | 'index') => void; onHome: () => void }) {
  return <header className={`studio-header ${compact ? 'is-compact' : ''} ${project ? 'is-project' : ''}`}>
    <div className="studio-masthead">
      <a className="studio-wordmark" href="/" onClick={event => { event.preventDefault(); onHome() }} aria-label="Victory Generation, home"><img src={project ? '/media/victory-generation-logo.svg' : '/media/victory-generation-logo-white.svg'} alt="Victory Generation" width={600} height={106} /></a>
      {project ? <a className="studio-project-back" href="/" onClick={event => { event.preventDefault(); onHome() }}>All projects <Icon name="back" size={14} /></a> : <p className="studio-signature">Design, code & a little curiosity.</p>}
    </div>
    {!project && <div className="studio-title-row">
      <h1>Selected <em>perspectives.</em><sup>({String(projects.length).padStart(2, '0')})</sup></h1>
      <div className="view-switch" role="group" aria-label="View work"><button aria-pressed={view === 'canvas'} onClick={() => onView('canvas')}><Icon name="grid" size={12} />Canvas</button><button aria-pressed={view === 'index'} onClick={() => onView('index')}><span className="index-view-icon" aria-hidden="true">☷</span>Index</button></div>
    </div>}
  </header>
}

export function StudioStatus({ project, motion, warp, canvas, onMotion, onWarp }: { project: Project; motion: boolean; warp: boolean; canvas: boolean; onMotion: () => void; onWarp: () => void }) {
  return <>
    <div className="studio-status" aria-live="polite"><span className="status-index">{String(projects.indexOf(project) + 1).padStart(2, '0')}<span> / {String(projects.length).padStart(2, '0')}</span></span><div key={project.slug}><strong>{project.title}</strong><small>{project.industry}</small></div></div>
    <div className="studio-tools"><span className="canvas-instruction">{canvas ? 'Drag to wander. Hold Space to warp.' : 'Select a project to explore.'}</span><div className="studio-effect-controls">{canvas && <button className="field-warp-toggle" onClick={onWarp} disabled={!motion} aria-pressed={warp} aria-label={warp ? 'Turn gallery warp off' : 'Turn gallery warp on'}><Icon name="motion" size={11} />Warp</button>}<button className="motion-toggle" onClick={onMotion} aria-pressed={motion} aria-label={motion ? 'Turn ambient motion off' : 'Turn ambient motion on'}><span className={motion ? 'motion-indicator is-on' : 'motion-indicator'} aria-hidden="true" />Motion {motion ? 'on' : 'off'}</button></div></div>
  </>
}
