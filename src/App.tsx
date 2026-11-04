import { useCallback, useEffect, useRef, useState } from 'react'
import Gallery from './components/Gallery'
import Icon from './components/Icon'
import type { IconName } from './components/Icon'
import ProjectViewer from './components/ProjectViewer'
import ProjectPage from './components/ProjectPage'
import ContactPage from './components/ContactPage'
import { projects } from './data'
import type { Project } from './data'
import type { ProjectOrigin } from './projectMotion'
import { StudioHeader, StudioStatus } from './components/StudioChrome'
import ProjectIndex from './components/ProjectIndex'
import ExploreCursor from './components/ExploreCursor'

type Panel = 'experience' | 'process'

function InfoPanel({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [onClose])
  return <div className="info-panel" role="dialog" aria-modal="true" aria-label={panel.replace('-', ' ')}>
    <div className="info-content">
      <button className="close-button" onClick={onClose} autoFocus><Icon name="close" size={14} />Close</button>
      {panel === 'experience' && <>
        <p className="eyebrow">A little about me</p><h1>Craft. Curiosity.<br />Twenty years in the making.</h1>
        <p className="info-intro">Victory Generation connects people, design, and technology through distinctive brand identities.</p>
        <div className="experience-list">{[
          ['2022 — 2026', 'Senior Product Designer', 'Input Output'],
          ['2021 — 2022', 'UX / Web Designer', 'One Voice Consulting'],
          ['2018 — 2021', 'UI Developer', 'Bridge SEA'],
          ['2014 — 2017', 'Front-End Analyst', 'Falconi'],
          ['2013 — 2014', 'UI / UX Designer', 'Senac'],
          ['2003 — 2012', 'Art Director & Webmaster', 'Starbit · Microlins · Microcamp'],
        ].map(([year, role, company]) => <div key={year}><span>{year}</span><h2>{role}</h2><p>{company}</p></div>)}</div>
      </>}
      {panel === 'process' && <><p className="eyebrow">How the pieces come together</p><h1>Good questions.<br /><em>Better possibilities.</em></h1><p className="info-intro">From the first conversation to the smallest interaction, a little curiosity goes a long way.</p><div className="process-steps">{[['Discover', 'Get close to the people and the problem. Ask the questions that reveal what really matters.'], ['Explore', 'Sketch, prototype, and follow the interesting threads. Give good ideas room to become something better.'], ['Make', 'Bring design and code together. Build a system that feels as thoughtful as it looks.'], ['Refine', 'Put it in people’s hands. Listen, learn, and take care of the details.']].map(([title, text], index) => <div key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{text}</p><Icon name="arrow" size={22} /></div>)}</div></>}
    </div>
  </div>
}

export default function App() {
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [entry, setEntry] = useState<ProjectOrigin>()
  const [view, setView] = useState<'canvas' | 'index'>('canvas')
  const [hovered, setHovered] = useState(projects[0])
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [warp, setWarp] = useState(false)
  const galleryOrigin = useRef<ProjectOrigin | undefined>(undefined)
  useEffect(() => {
    const update = () => { setLocation(window.location.pathname + window.location.search); setPanel(null); setEntry(undefined); galleryOrigin.current = undefined }
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  const navigate = useCallback((url: string, replace = false, origin?: ProjectOrigin) => {
    if (replace) window.history.replaceState({}, '', url)
    else window.history.pushState({}, '', url)
    setLocation(url)
    setPanel(null)
    setEntry(origin)
  }, [])

  const pathname = location.split('?')[0]
  const contactPage = /^\/contact\/?$/.test(pathname)
  const slug = pathname.match(/^\/work\/([^/]+)\/?$/)?.[1]
  const viewerSlug = new URLSearchParams(location.split('?')[1]).get('project')
  const viewerProject = contactPage ? undefined : projects.find(project => project.slug === viewerSlug)
  const projectPage = projects.find(project => project.slug === slug && project.hasCaseStudy) ?? (viewerProject?.hasCaseStudy ? viewerProject : undefined)
  const selected = viewerProject?.hasCaseStudy ? undefined : viewerProject
  const select = useCallback((project: Project, origin?: ProjectOrigin) => {
    const switching = Boolean(new URLSearchParams(window.location.search).get('project'))
    if (!switching) galleryOrigin.current = origin
    navigate(project.hasCaseStudy ? `/work/${project.slug}/` : `/?project=${project.slug}`, switching, origin)
  }, [navigate])
  const closeViewer = useCallback(() => navigate('/', true), [navigate])
  const closePanel = useCallback(() => setPanel(null), [])
  const home = useCallback(() => navigate('/'), [navigate])

  useEffect(() => {
    document.body.classList.toggle('page-scrollable', contactPage || Boolean(projectPage && !selected))
    document.title = contactPage ? 'Contact | Victory Generation' : projectPage ? `${projectPage.title} Case Study | Victory Generation` : selected ? `${selected.title} | Victory Generation` : 'Victory Generation — Brand & Design'
  }, [contactPage, projectPage, selected])
  useEffect(() => { document.documentElement.dataset.effects = motion ? 'on' : 'off' }, [motion])
  const galleryActive = !contactPage && !projectPage && !selected && !panel && view === 'canvas'
  useEffect(() => {
    document.documentElement.dataset.warp = warp ? 'on' : 'off'
  }, [warp])
  useEffect(() => {
    if (!motion || !galleryActive) { setWarp(false); return }
    let held = false
    const down = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || (event.target as HTMLElement).closest('button,a,input,textarea,select')) return
      event.preventDefault(); held = true; setWarp(true)
    }
    const up = (event: KeyboardEvent) => { if (event.code === 'Space' && held) { held = false; setWarp(false) } }
    const blur = () => setWarp(false)
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [motion, galleryActive])

  const navItems: { label: string; icon: IconName; panel?: Panel; href?: string }[] = [
    { label: 'Work', icon: 'grid' },
    { label: 'About', icon: 'document', panel: 'experience' },
    { label: 'Process', icon: 'hourglass', panel: 'process' },
    { label: 'Let’s talk', icon: 'arrow', href: '/contact/' },
  ]

  return <div className={`portfolio-shell ${projectPage || contactPage ? '' : 'is-gallery'}`} data-home={!contactPage && !projectPage && !selected && !panel}>
    <StudioHeader compact={Boolean(contactPage || projectPage || selected || panel)} project={Boolean(contactPage || projectPage || selected)} view={view} onView={setView} onHome={home} />
    <ExploreCursor />
    {contactPage ? <ContactPage /> : projectPage ? <ProjectPage project={projectPage} onBack={home} /> : <>
      <Gallery onSelect={select} onHover={setHovered} motion={motion} warp={warp} hidden={view === 'index'} paused={Boolean(selected || panel || view === 'index')} />
      {view === 'index' && <ProjectIndex onSelect={select} onHover={setHovered} />}
      <nav className={`navigation-dock ${selected ? 'is-hidden' : ''}`} aria-label="Pages">
        {navItems.map(item => item.href ? <a key={item.label} href={item.href} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(item.href!) }}><Icon name={item.icon} size={17} /><span>{item.label}</span></a> : <button key={item.label} className={panel === (item.panel ?? null) ? 'is-active' : ''} onClick={() => item.panel ? setPanel(panel === item.panel ? null : item.panel) : setPanel(null)} aria-current={panel === (item.panel ?? null) ? 'page' : undefined}><Icon name={item.icon} size={17} /><span>{item.label}</span></button>)}
      </nav>
      {!selected && !panel && <StudioStatus project={hovered} motion={motion} warp={warp} canvas={view === 'canvas'} onWarp={() => setWarp(value => !value)} onMotion={() => setMotion(value => !value)} />}
    </>}
    {panel && <InfoPanel panel={panel} onClose={closePanel} />}
    {selected && <ProjectViewer project={selected} origin={entry} returnTo={galleryOrigin.current} onClose={closeViewer} onSelect={select} onDetails={selected.hasCaseStudy ? origin => navigate(`/work/${selected.slug}/`, false, origin) : undefined} />}
    {!contactPage && !projectPage && !selected && !panel && <a className="home-contact-link" href="/contact/" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate('/contact/') }}>Contact <Icon name="arrow" size={15} /></a>}
    {!contactPage && !projectPage && !selected && <div className="brand-badge">
      <img src="/media/victory-generation-logo-white.svg" alt="Victory Generation" width={600} height={106} />
    </div>}
  </div>
}
