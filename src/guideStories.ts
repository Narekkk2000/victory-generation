import stories from './content/guideStories.json'
import type { AnimationAsset } from './components/ProjectAnimation'

export type GuideBlock =
  | { kind: 'image'; asset: AnimationAsset; alt: string; portrait?: boolean }
  | { kind: 'animation'; asset: AnimationAsset; alt: string; poster?: string; aspectRatio?: number }
  | { kind: 'copy'; title: string; paragraphs: string[] }
  | { kind: 'row'; layout?: 'pair' | 'triptych' | 'wide-left' | 'wide-right'; children: GuideBlock[] }
  | { kind: 'identity'; logo: AnimationAsset; logoBackground: string; typeBackground: string; typeColor?: string; typefaces: string[]; colors: string[]; title: string; paragraphs: string[] }

export interface GuideStory {
  brief: string
  solution: string[]
  sections: { id: string; label: string; blocks: GuideBlock[] }[]
}

export const guideStories = stories as Record<string, GuideStory>
