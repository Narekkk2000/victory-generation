import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { projects } from './src/data.ts'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'static-route-entries',
      apply: 'build',
      generateBundle: {
        order: 'post',
        handler(_, bundle) {
          const index = bundle['index.html']
          if (!index || index.type !== 'asset') {
            this.error('The built index.html is required to generate static route entries.')
          }

          // Serve the React entry directly at each route on static hosts.
          const projectRoutes = projects
            .filter(project => project.hasCaseStudy)
            .map(project => `work/${project.slug}`)
          const routes = ['contact', ...projectRoutes]
          for (const route of routes) {
            this.emitFile({ type: 'asset', fileName: `${route}/index.html`, source: index.source })
          }
        },
      },
    },
  ],
})
