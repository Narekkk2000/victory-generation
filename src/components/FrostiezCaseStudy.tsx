import { useEffect, useRef, useState } from 'react'
import portfolio from '../content/portfolio.json'
import Icon from './Icon'
import { contactEmail } from '../data'
import { RevealText, ScrollReveal, useScrollReveals } from '../scrollReveal'
import '../frostiez.css'

const { content, media } = portfolio.frostiez
type MediaName = keyof typeof media
type CopyName = keyof typeof content

const disciplines = [
  ['Rebranding', 'identity'], ['Flowers', 'flowers'], ['Glass jar', 'glass-jar'],
  ['Pre-rolls', 'pre-rolls'], ['Social media / Weedmaps', 'social'],
  ['Premium concentrate', 'concentrates'], ['All-in-one vape', 'vapes'],
  ['Edibles', 'edibles'], ['Product photos', 'vapes'], ['Mylar bag', 'flowers'],
] as const

function Copy({ title, section, children }: { title: string; section?: CopyName; children?: React.ReactNode }) {
  return <div className="frostiez-copy">
    <RevealText as="h2">{title}</RevealText>
    {section && content[section].map(text => <RevealText key={text}>{text}</RevealText>)}
    {children}
  </div>
}

function Artwork({ name, alt, eager = false }: { name: MediaName; alt: string; eager?: boolean }) {
  const asset = media[name]
  return <ScrollReveal className="frostiez-artwork-reveal"><img className="frostiez-artwork" src={asset.src} alt={alt} width={asset.width} height={asset.height} loading={eager ? 'eager' : 'lazy'} decoding="async" /></ScrollReveal>
}

function Animation({ name, poster, alt }: { name: 'brand-animation' | 'octopus-animation'; poster: MediaName; alt: string }) {
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, { rootMargin: '200px' })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const asset = media[name]
  return <figure ref={ref} className="frostiez-animation" data-scroll-reveal="media">
    <img src={visible && !paused ? asset.src : media[poster].src} alt={alt} width={asset.width} height={asset.height} decoding="async" />
    <button onClick={() => setPaused(value => !value)} aria-label={`${paused ? 'Play' : 'Pause'} ${alt}`} aria-pressed={!paused}><Icon name={paused ? 'play' : 'pause'} size={12} /></button>
  </figure>
}

/** Frostiez_2's white canvas, left narrative, and right-hand product sequence. */
export default function FrostiezCaseStudy({ onBack }: { onBack: () => void }) {
  const articleRef = useRef<HTMLElement>(null)
  useScrollReveals(articleRef)
  return <article ref={articleRef} className="frostiez-case" id="frostiez-story" aria-label="Frostiez case study">
    <h1 className="sr-only">Frostiez — Brand identity and packaging</h1>
    <div className="frostiez-sheet">
      <nav className="frostiez-disciplines" aria-label="Frostiez project disciplines">
        {disciplines.map(([title, id]) => <a href={`#frostiez-${id}`} key={title}>{title}</a>)}
      </nav>
      <RevealText className="frostiez-brief">{content.Task[0]}</RevealText>
      <div className="frostiez-layout">
        <aside className="frostiez-solution">
          <RevealText as="h2">Solution</RevealText>
          {[...content.Solution, ...content.Rebranding, ...content.Packaging, ...content['Pre-Rolls']].map(text => <RevealText key={text}>{text}</RevealText>)}
        </aside>
        <div className="frostiez-work">
          <section id="frostiez-identity" aria-label="Brand identity">
            <Animation name="brand-animation" poster="brand-banner" alt="Frostiez animated brand banner" />
            <div className="frostiez-identity-grid">
              <Copy title="Brand Identity" section="Rebranding" />
              <div className="frostiez-palette" data-scroll-reveal="panel"><RevealText as="h2">Color Palette</RevealText><div aria-label="Orange, yellow, blue, sky blue, teal, and black"><i /><i /><i /><i /><i /><i /></div></div>
            </div>
          </section>
          <section id="frostiez-flowers" aria-label="Flower packaging">
            <Artwork name="cover" alt="Frostiez flower and edible packaging photographed on a beach" />
            <div className="frostiez-grid frostiez-packaging-copy"><Copy title="Packaging" section="Packaging" /><Copy title="Master Cases" section="Master Cases" /></div>
          </section>
          <section id="frostiez-glass-jar" aria-label="Glass jar packaging">
            <Artwork name="glass-jar" alt="Frostiez indoor top-shelf flower glass jar with illustrated packaging" />
            <Copy title="Glass Jar" section="Glass Jar" />
            <div className="frostiez-jar-row">
              <Artwork name="glass-jar" alt="Indoor top-shelf flower campaign" />
              <Animation name="octopus-animation" poster="brand-banner" alt="Frostiez animated octopus banner" />
            </div>
          </section>
          <section id="frostiez-pre-rolls" aria-label="Single pre-roll tubes and master cases">
            <Artwork name="single-pre-roll" alt="Illustrated Frostiez pre-roll tubes floating in a blue sky" />
            <div className="frostiez-grid">
              <Copy title="Single Pre-Roll Tube & Master Case" section="Single Pre-Roll Tube & Master Case" />
              <Artwork name="master-case-open" alt="Blue open master case with illustrated clouds" />
              <Artwork name="master-case-closed" alt="Closed blue Frostiez master case" />
              <Artwork name="master-case-yellow" alt="Yellow and blue open Frostiez master case" />
            </div>
          </section>
          <section id="frostiez-concentrates" className="frostiez-concentrates" aria-label="Premium concentrate">
            <Artwork name="concentrates" alt="Blue and yellow concentrate jars and illustrated boxes" />
            <Copy title="Premium Concentrate" section="Premium Concentrate" />
          </section>
          <section id="frostiez-edibles" aria-label="Edibles">
            <div className="frostiez-edibles-row"><Copy title="Edibles"><RevealText>For the edibles line, we gave every flavor its own custom illustration. Bold sunburst backgrounds and a vibrant color system keep each pack distinct while staying unmistakably Frostiez.</RevealText></Copy><Artwork name="flower-range" alt="Three illustrated Frostiez edible flavors among clouds" /></div>
            <div className="frostiez-grid frostiez-grid-three">
              <Artwork name="edibles-mango" alt="Frostiez mango edible packaging" />
              <Artwork name="edibles-blueraz" alt="Frostiez blueraz edible packaging" />
              <Artwork name="edibles-watermelon" alt="Frostiez watermelon edible packaging" />
            </div>
          </section>
          <section aria-label="Retail packaging and flowers">
            <Copy title="Glass Jar" section="Glass Jar" />
            <Artwork name="pre-roll-cases" alt="Blue and yellow retail master cases with matching illustrated bags" />
            <Artwork name="flower-bags" alt="Sativa, hybrid, and indica Frostiez flower bags" />
          </section>
          <section id="frostiez-vapes" aria-label="All-in-one vapes">
            <Copy title="All-in-One Vape" section="All-in-One Vape" />
            <Artwork name="vape-lifestyle" alt="Frostiez vape product photography outdoors under palm trees" />
            <Artwork name="vape-range" alt="Frostiez all-in-one vape with custom device and packaging" />
            <Artwork name="vape-devices" alt="Custom turquoise vape device and illustrated flavor boxes" />
            <Artwork name="vape-boxes" alt="Colorful Frostiez vape master cases" />
          </section>
          <section id="frostiez-social" aria-label="Banners and Weedmaps">
            <div className="frostiez-banner-row"><Copy title="Banners"><RevealText>{content['Premium Concentrate'][0]}</RevealText><RevealText>We made Weedmaps photos for the full Frostiez lineup, from flower to edibles to concentrates. Each product type has its own color palette and playful setting, so shoppers can find what they’re looking for fast.</RevealText></Copy><Artwork name="flower-hero" alt="Frostiez flower bag in an orange starburst campaign" /></div>
            <Artwork name="flower-campaign" alt="Frostiez flavor collection campaign banner" />
            <Copy title="Social Media / Weedmaps" section="Social Media / Weedmaps" />
            <Artwork name="weedmaps" alt="Frostiez brand campaign on Weedmaps" />
            <Artwork name="packaging-family" alt="The complete Frostiez packaging collection" />
            <Artwork name="cap" alt="Blue cap with embroidered Frostiez wordmark" />
          </section>
        </div>
      </div>
      <footer className="frostiez-footer"><a href="/" onClick={event => { event.preventDefault(); onBack() }}><Icon name="back" size={14} />All projects</a><a href={`mailto:${contactEmail}`}>Let’s talk <Icon name="arrow" size={14} /></a></footer>
    </div>
  </article>
}
