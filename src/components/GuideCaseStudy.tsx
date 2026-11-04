import { useRef } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../data'
import { contactEmail } from '../data'
import { guideStories } from '../guideStories'
import type { GuideBlock } from '../guideStories'
import { RevealText, ScrollReveal, useScrollReveals } from '../scrollReveal'
import ProjectAnimation from './ProjectAnimation'
import Icon from './Icon'
import '../guide.css'

function StoryBlock({ block, project }: { block: GuideBlock; project: Project }) {
  switch (block.kind) {
    case 'image': return <ScrollReveal className={`guide-artwork ${block.portrait ? 'is-portrait' : ''}`}><img src={block.asset.src} width={block.asset.width} height={block.asset.height} alt={block.alt} loading="lazy" decoding="async" /></ScrollReveal>
    case 'animation': return <ProjectAnimation asset={block.asset} poster={block.poster || project.galleryImage} alt={block.alt} aspectRatio={block.aspectRatio} />
    case 'copy': return <div className="guide-copy"><RevealText as="h2">{block.title}</RevealText>{block.paragraphs.map(text => <RevealText key={text}>{text}</RevealText>)}</div>
    case 'row': return <div className={`guide-row guide-row-${block.layout || 'pair'}`}>{block.children.map((child, index) => <StoryBlock key={index} block={child} project={project} />)}</div>
    case 'identity': return <div className="guide-identity">
      <div className="guide-logo" data-scroll-reveal="panel" style={{ background: block.logoBackground }}><img src={block.logo.src} width={block.logo.width} height={block.logo.height} alt={`${project.title} identity`} loading="lazy" /></div>
      <div className="guide-typography" data-scroll-reveal="panel" style={{ background: block.typeBackground, color: block.typeColor || '#111' }}><RevealText as="h2">Typography</RevealText><div>{block.typefaces.map(name => <span key={name}>{name}</span>)}</div></div>
      <StoryBlock project={project} block={{kind:'copy',title:block.title,paragraphs:block.paragraphs}} />
      <div className="guide-palette" data-scroll-reveal="panel"><RevealText as="h2">Color Palette</RevealText><div>{block.colors.map(color => <span key={color} style={{ background: color }} aria-label={color} />)}</div></div>
    </div>
  }
}

/** Each board supplies its own section order and spreads to the common Figma page frame. */
export default function GuideCaseStudy({ project, onBack }: { project: Project; onBack: () => void }) {
  const story = guideStories[project.slug]
  const ref = useRef<HTMLElement>(null)
  useScrollReveals(ref)
  return <article ref={ref} className="guide-case" data-project={project.slug} id={`${project.slug}-story`} style={{ '--guide-accent': project.color } as CSSProperties} aria-label={`${project.title} case study`}>
    <h1 className="sr-only">{project.title} — Brand identity and design</h1>
    <div className="guide-sheet">
      <nav className="guide-disciplines" aria-label={`${project.title} project sections`}>{story.sections.map(section => <a key={section.id} href={`#${project.slug}-${section.id}`}>{section.label}</a>)}</nav>
      <RevealText className="guide-brief">{story.brief}</RevealText>
      <div className="guide-layout">
        <aside className="guide-solution"><RevealText as="h2">Solution</RevealText>{story.solution.map(text => <RevealText key={text}>{text}</RevealText>)}</aside>
        <div className="guide-work">{story.sections.map(section => <section key={section.id} id={`${project.slug}-${section.id}`} aria-label={section.label}>{section.blocks.map((block,index) => <StoryBlock block={block} project={project} key={index} />)}</section>)}</div>
      </div>
      <footer className="guide-footer"><a href="/" onClick={event => { event.preventDefault(); onBack() }}><Icon name="back" size={14} />All projects</a><a href={`mailto:${contactEmail}`}>Let’s talk <Icon name="arrow" size={14} /></a></footer>
    </div>
  </article>
}
