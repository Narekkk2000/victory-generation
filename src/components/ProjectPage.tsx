import { useLayoutEffect } from 'react'
import type { Project } from '../data'
import ProjectArticle from './ProjectArticle'

export default function ProjectPage({ project, onBack }: { project: Project; onBack: () => void }) {
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [project.slug])
  return <main className="project-case-page">
    <ProjectArticle key={project.slug} project={project} onBack={onBack} />
  </main>
}
