import type { Project } from '../data'
import FrostiezCaseStudy from './FrostiezCaseStudy'
import GuideCaseStudy from './GuideCaseStudy'

export default function ProjectArticle({ project, onBack }: { project: Project; onBack: () => void }) {
  return project.slug === 'frostiez' ? <FrostiezCaseStudy onBack={onBack} /> : <GuideCaseStudy project={project} onBack={onBack} />
}
