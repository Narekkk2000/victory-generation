import portfolio from './content/portfolio.json'

export const contactEmail = 'info@vgeneration.co'

export interface Project {
  slug: string
  title: string
  subtitle: string
  industry: string
  color: string
  paper: string
  block: string
  symbol: string
  image: string
  galleryImage: string
  hasCaseStudy: boolean
  video?: string
  previewVideo?: string
  disciplines: string[]
  disciplineNotes: string[]
  description: string[]
}

const definitions = [
  {
    slug: 'frostiez', subtitle: 'A bold, playful world of flavor.',
    industry: 'Cannabis / Brand & packaging', color: '#00a9e7', paper: '#f8f5ec', block: '#eee9de', symbol: 'F',
    scope: [['Brand identity', 'Rebranding'], ['Packaging design', 'Packaging'], ['Custom illustration', 'Glass Jar'], ['Product design', 'All-in-One Vape'], ['Social & Weedmaps', 'Social Media / Weedmaps']],
  },
  {
    slug: 'happy-botanist', subtitle: 'Natural purity. Scientific precision.',
    industry: 'Cannabis / Identity & packaging', color: '#b39a60', paper: '#f0f0ec', block: '#e4e5df', symbol: 'HB',
    scope: [['Naming', 'Naming'], ['Brand identity', 'Brand Identity'], ['Packaging design', 'Packaging'], ['Pre-rolls', 'Single Pre-Roll'], ['Concentrates', 'Concentrate']],
  },
  {
    slug: 'frost', subtitle: 'A fresh identity with a signature melt.',
    industry: 'Cannabis delivery / Branding', color: '#e774be', paper: '#eff7fa', block: '#dfedf2', symbol: 'F',
    scope: [['Brand identity', 'Solution'], ['Logo design', 'Solution'], ['Social media', 'Social Media'], ['Delivery bags', 'Delivery Bag']],
  },
  {
    slug: 'weeed', subtitle: 'The one-stop cannabis shop.',
    industry: 'Cannabis retail / Brand identity', color: '#269455', paper: '#f1f4ed', block: '#e3e9dc', symbol: 'W',
    scope: [['Brand concept', 'Solution'], ['Brand identity', 'Brand Identity'], ['Design assets', 'Brand Identity'], ['Social media', 'Social Media']],
  },
  {
    slug: 'call-the-queens', subtitle: 'Choose a mood. Call a Queen.',
    industry: 'Cannabis delivery / Brand universe', color: '#ad3bda', paper: '#f6f1f8', block: '#ece3f0', symbol: '♛',
    scope: [['Naming & narrative', 'Solution'], ['Character design', 'Brand Concept & Characters'], ['Gamification', 'Gamification & Community'], ['Packaging', 'Delivery Mylar Bags'], ['Digital experience', 'Website Design']],
  },
] as const

const caseStudyProjects: Project[] = definitions.map(({ scope, ...definition }) => {
  const source = portfolio[definition.slug]
  const content = source.content as Record<string, string[]>
  return {
    ...definition,
    title: source.title,
    image: source.media.cover.src,
    galleryImage: `/media/gallery/${definition.slug}.webp`,
    hasCaseStudy: true,
    video: source.media.film.src,
    disciplines: scope.map(([title]) => title),
    disciplineNotes: scope.map(([, section]) => content[section].join(' ')),
    description: [content.Task.join(' '), content.Solution.join('\n\n')],
  }
})

const additionalDefinitions = [
  { slug: 'canabotanica', title: 'Canabotanica', color: '#f7941d', symbol: 'C', subtitle: 'A clear system. A growing collection.' },
  { slug: 'hardys', title: 'Hardy’s Cannabis', color: '#ef802a', symbol: 'H', subtitle: 'A language of hands. A feeling of connection.' },
  { slug: 'sunset', title: 'Sunset', color: '#f47b2b', symbol: 'S', subtitle: 'A familiar spirit. A new perspective.' },
  { slug: 'sunset-collection', title: 'Sunset Collection', color: '#ffd951', symbol: 'SC', subtitle: 'Warm color. A laid-back collection.' },
] as const

const additionalProjects: Project[] = additionalDefinitions.map(project => {
  const content = portfolio[project.slug].content as Record<string, string[]>
  return {
    ...project,
    industry: 'Cannabis / Brand identity & packaging',
    image: `/media/gallery/${project.slug}.webp`,
    galleryImage: `/media/gallery/${project.slug}.webp`,
    hasCaseStudy: true,
    paper: '#fff', block: '#f7f7f7',
    disciplines: ['Brand identity', 'Packaging', 'Art direction'],
    disciplineNotes: [],
    description: [content.Task?.join(' ') || project.subtitle, content.Solution?.join('\n\n') || ''],
  }
})

export const projects: Project[] = [...caseStudyProjects, ...additionalProjects]

export const webp = (src: string) => src.replace(/\.(jpg|jpeg|png)$/, '.webp')
export const thumbnail = (project: Project) => webp(project.galleryImage.replace('/media/', '/media/thumb/'))

/** Curated still covers lead the gallery; optional preview footage can be added per project. */
export const galleryVideo = (project: Project) => project.previewVideo

export const relatedProjects = (project: Project) => {
  const index = projects.findIndex(item => item.slug === project.slug)
  return [...projects.slice(index + 1), ...projects.slice(0, index)].slice(0, 3)
}

/** A five-column, four-row repeat with no matching edge neighbours. Shared with the shader. */
export const galleryOrder = Array.from({ length: 20 }, (_, index) => (index % 5 + Math.floor(index / 5) * 2) % projects.length)
