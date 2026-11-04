import portfolio from './content/portfolio.json'
import type { Project } from './data'

type Slug = keyof typeof portfolio
export interface CaseMedia {
  src: string
  width: number
  height: number
  type: 'image' | 'video'
  alt: string
  caption: string
  poster?: string
}
export interface CaseBlock {
  title?: string
  text?: string[]
  media: CaseMedia[]
  layout?: 'stack' | 'pair' | 'triptych' | 'offset'
}
export interface CaseSection {
  id: string
  label: string
  lead: string
  body: string[]
  notes?: { title: string; text: string }[]
  blocks: CaseBlock[]
}
interface Story {
  headline: [string, string]
  sections: CaseSection[]
}

const copy = (slug: Slug, heading: string) => (portfolio[slug].content as Record<string, string[]>)[heading]
const media = (slug: Slug, name: string, caption: string, alt: string = caption, poster?: string): CaseMedia => {
  const asset = (portfolio[slug].media as Record<string, { src: string; width: number; height: number; type: string }>)[name]
  return { ...asset, type: asset.type === 'video' ? 'video' : 'image', alt: `${portfolio[slug].title} — ${alt}`, caption, poster: poster ? media(slug, poster, '').src : undefined }
}
const chapter = (slug: Slug, heading: string, images: CaseMedia[], layout?: CaseBlock['layout'], title = heading): CaseBlock => ({ title, text: copy(slug, heading), media: images, layout })
const overview = (slug: Slug, blocks: CaseBlock[]): CaseSection => ({
  id: 'overview', label: 'About the project', lead: 'The brief & the idea.', body: [],
  notes: ['Task', 'Solution'].map(title => ({ title, text: copy(slug, title).join('\n\n') })), blocks,
})

const f = (name: string, caption: string, alt?: string, poster?: string) => media('frostiez', name, caption, alt, poster)
const hb = (name: string, caption: string, alt?: string, poster?: string) => media('happy-botanist', name, caption, alt, poster)
const frost = (name: string, caption: string, alt?: string, poster?: string) => media('frost', name, caption, alt, poster)
const w = (name: string, caption: string, alt?: string, poster?: string) => media('weeed', name, caption, alt, poster)
const q = (name: string, caption: string, alt?: string, poster?: string) => media('call-the-queens', name, caption, alt, poster)

export const caseStudies: Record<string, Story> = {
  frostiez: {
    headline: ['A world of flavor.', 'Full of character.'],
    sections: [
      overview('frostiez', [
        chapter('frostiez', 'Rebranding', [f('brand-banner', 'The refreshed Frostiez identity', 'White outlined Frostiez wordmark on a bright blue comic-style burst')]),
        { media: [f('film', 'The brand in motion', 'Animated Frostiez brand banner', 'brand-banner')] },
      ]),
      {
        id: 'packaging', label: 'The packaging system', lead: 'One family. Every format.', body: copy('frostiez', 'Packaging'),
        blocks: [
          { media: [f('packaging-family', 'A complete packaging family', 'An illustrated range of Frostiez products in a shopping basket')] },
          { title: 'Flowers', media: [f('flower-bags', 'Sativa / Hybrid / Indica', 'Three illustrated yellow flower bags'), f('flower-hero', 'Sungrown flower', 'A yellow Frostiez flower bag against an orange starburst')], layout: 'offset' },
          chapter('frostiez', 'Glass Jar', [f('glass-jar', 'Indoor top-shelf flower', 'Illustrated glass jar with a blue lid and flower')]),
          chapter('frostiez', 'Master Cases', [f('pre-roll-cases', 'Retail-ready master cases', 'Blue and yellow illustrated boxes with matching retail cases')]),
          chapter('frostiez', 'Pre-Rolls', [f('flower-campaign', 'The Frostiez lineup', 'Yellow campaign banner presenting the colorful product lineup')]),
          chapter('frostiez', 'Single Pre-Roll Tube & Master Case', [f('single-pre-roll', 'Single pre-roll tubes', 'Illustrated clear tubes against a blue sky')]),
          { media: [f('master-case-closed', 'The closed case', 'Closed light blue illustrated retail box'), f('master-case-open', 'The open display', 'Open light blue retail case with tube slots'), f('master-case-yellow', 'An alternate colorway', 'Open yellow illustrated retail case')], layout: 'triptych' },
          chapter('frostiez', 'Premium Concentrate', [f('concentrates', 'Premium concentrates', 'Blue and yellow concentrate jars and illustrated boxes')]),
        ],
      },
      {
        id: 'flavors', label: 'Flavor & product', lead: 'Every flavor, its own world.', body: [],
        blocks: [
          chapter('frostiez', 'All-in-One Vape', [f('vape-range', 'All-in-one vape', 'Blue Frostiez banner with a custom vape device and matching packaging')]),
          { media: [f('vape-devices', 'Custom devices & packaging', 'Turquoise vape devices and colorful illustrated boxes'), f('vape-boxes', 'The product family', 'A stack of colorful illustrated vape boxes')], layout: 'pair' },
          { title: 'Edibles', media: [f('edibles-watermelon', 'Watermelon', 'Watermelon-flavored edible packaging'), f('edibles-mango', 'Mango', 'Mango-flavored edible packaging'), f('edibles-blueraz', 'Blueraz', 'Blueraz-flavored edible packaging')], layout: 'triptych' },
          { media: [f('flower-range', 'Color, illustration & flavor', 'Three colorful Frostiez bags floating against a blue sky')] },
        ],
      },
      {
        id: 'rollout', label: 'Out in the world', lead: 'Impossible to scroll past.', body: [],
        blocks: [
          chapter('frostiez', 'Social Media / Weedmaps', [f('weedmaps', 'Social media / Weedmaps', 'Frostiez 420 campaign shown on the Weedmaps platform')]),
          { media: [f('octopus-film', 'The illustrated world in motion', 'Animated Frostiez octopus brand banner', 'weedmaps')] },
          { title: 'Product photos & merchandise', media: [f('vape-lifestyle', 'Product photography', 'A woman holding a Frostiez vape outdoors'), f('cap', 'The identity, worn', 'Light blue cap with the embroidered Frostiez logo')], layout: 'offset' },
        ],
      },
    ],
  },
  'happy-botanist': {
    headline: ['Rooted in nature.', 'Refined by science.'],
    sections: [
      overview('happy-botanist', [
        { media: [hb('brand-mark', 'The Happy Botanist identity', 'White HB monogram and wordmark against black')] },
        chapter('happy-botanist', 'Naming', []),
        chapter('happy-botanist', 'Brand Identity', [hb('film', 'A precise identity, in motion', 'Happy Botanist logo animation', 'brand-lockup')]),
      ]),
      {
        id: 'flowers', label: 'Flowers & packaging', lead: 'Purity, made visible.', body: copy('happy-botanist', 'Packaging'),
        blocks: [
          { media: [hb('flower-bags', 'Flowers / The mylar system', 'Hands holding black Happy Botanist flower bags with subtle molecule patterns'), hb('flower-still-life', 'Flowers / Material & detail', 'Three black Happy Botanist flower bags on a stone surface')], layout: 'offset' },
          { media: [hb('flower-campaign', 'Natural quality. A scientific backbone.', 'Black molecular-patterned flower packaging among green leaves')] },
        ],
      },
      {
        id: 'formats', label: 'New formats', lead: 'The same considered language.', body: [],
        blocks: [
          chapter('happy-botanist', 'Single Pre-Roll', [hb('pre-rolls', 'Single pre-rolls', 'Black and white pre-roll tubes and cones'), hb('pre-roll-detail', 'A compact, precise format', 'A single Happy Botanist tube on a sculpted white pedestal')], 'pair'),
          chapter('happy-botanist', 'Concentrate', [hb('concentrates', 'Concentrates / The full system', 'Black Happy Botanist concentrate boxes with glass jars'), hb('concentrate-detail', 'Concentrates / A closer look', 'Detail of premium black concentrate packaging')], 'pair'),
          { media: [hb('weedmaps', 'The identity on Weedmaps', 'Monochrome Happy Botanist 420 promotional banner')] },
        ],
      },
    ],
  },
  frost: {
    headline: ['A fresh identity.', 'A signature melt.'],
    sections: [
      overview('frost', [
        { media: [frost('dimensional-logo', 'The signature melt', 'Blue dimensional Frost lettering with dripping pink tops')] },
        { media: [frost('film', 'Frost in motion', 'Looping Frost melting logo animation', 'dimensional-logo')] },
        { media: [frost('logo', 'The Frost wordmark', 'Flat outlined blue and pink Frost logo')] },
      ]),
      {
        id: 'social', label: 'Social & campaigns', lead: 'Refreshing. Colorful. In motion.', body: copy('frost', 'Social Media'),
        blocks: [
          { media: [frost('brand-world', 'The visual world', 'A collection of blue and pink sweets, cannabis motifs, and branded objects')] },
          { media: [frost('delivery-campaign', 'Fastest delivery / Highest quality', 'Colorful delivery campaign with a branded scooter and product packaging')] },
          { media: [frost('weedmaps', 'Frost on Weedmaps', 'Blue and pink illustrated octopus campaign banner on Weedmaps')] },
        ],
      },
      {
        id: 'delivery', label: 'The delivery experience', lead: 'The identity, delivered.', body: copy('frost', 'Delivery Bag'),
        blocks: [{ media: [frost('delivery-bags', 'The delivery bags', 'Two white delivery bags with blue and pink Frost branding')] }],
      },
    ],
  },
  weeed: {
    headline: ['Load the cart.', 'Enter the world.'],
    sections: [
      overview('weeed', [
        { media: [w('trolley-identity', 'The trolley-inspired identity', 'A green W in a shopping trolley above a repeating monogram pattern')] },
        { media: [w('film', 'The identity in motion', 'Weeed animated logo in lime green', 'social-campaign')] },
      ]),
      {
        id: 'identity', label: 'Slogan & identity', lead: 'It’s time to Weeed.', body: copy('weeed', 'Brand Identity'),
        blocks: [
          { media: [w('slogan', 'It’s time to Weeed', 'Shopping trolley with flower and a glowing green brand slogan')] },
          { media: [w('keychain', 'Brand assets / Keychain', 'Metal keychain with trolley, Weeed wordmark, and cannabis leaf charms'), w('sticker', 'Brand assets / Sticker', 'Green round sticker with the brand slogan')], layout: 'offset' },
        ],
      },
      {
        id: 'social', label: 'Social & digital', lead: 'A vibrant shopping culture.', body: copy('weeed', 'Social Media'),
        blocks: [
          { media: [w('brand-campaign', 'The Weeed world', 'People with shopping trolleys in a green studio set')] },
          { media: [w('weedmaps', 'Load the cart. We deliver.', 'Weeed branded delivery banner on Weedmaps'), w('digital-presence', 'Across digital platforms', 'Weeed platform banners shown on a laptop and phone')], layout: 'stack' },
          { media: [w('seasonal-campaign', 'Seasonal brand campaign', 'A festive shopping trolley against a green Weeed wordmark')] },
          { media: [w('social-campaign', 'The 420 campaign', 'A social gathering at a 420-shaped table in a green-lit room')] },
        ],
      },
    ],
  },
  'call-the-queens': {
    headline: ['Choose your mood.', 'Meet your Queen.'],
    sections: [
      overview('call-the-queens', [
        { media: [q('characters', 'Haze / Lumi / Selenia', 'Three illustrated Queens in purple, orange, and blue')] },
        { media: [q('film', 'The crown, in motion', 'Call The Queens animated logo', 'brand-banner')] },
        chapter('call-the-queens', 'Brand Concept & Characters', [q('queens-moods', 'Three Queens. Three states of mind.', 'The three Queens with their individual mood labels')]),
      ]),
      {
        id: 'social', label: 'The Queens, in character', lead: 'An ongoing story.', body: copy('call-the-queens', 'Social Media'),
        blocks: [
          { media: [q('queens-story', 'A character-led brand universe', 'Haze, Lumi, and Selenia in three illustrated everyday scenes')] },
          { media: [q('social-location', 'Our shop location', 'Illustrated Queens announcing the shop location'), q('social-mylar', 'The Queens make an offer', 'Lumi holding an illustrated promotional mylar bag'), q('social-handoff', 'A familiar face at your door', 'Haze delivering a Call The Queens bag through a car window')], layout: 'triptych' },
          { media: [q('characters-film', 'Meet the Queens', 'Animated character introduction', 'queens-story')] },
          { media: [q('weedmaps', 'Discover the Queens / Weedmaps', 'Purple illustrated brand banner on Weedmaps'), q('weedmaps-queens', 'Meet Haze, Lumi & Selenia', 'Colorful character campaign banner on Weedmaps')], layout: 'stack' },
        ],
      },
      {
        id: 'delivery', label: 'From the world to your door', lead: 'Every handoff, a brand moment.', body: [],
        blocks: [
          chapter('call-the-queens', 'Delivery Bags', [q('delivery-bags', 'The delivery bags', 'Black and purple Call The Queens branded paper bags'), q('social-delivery', 'The delivery, in character', 'A purple branded delivery bag alongside the illustrated Queens')], 'offset'),
          chapter('call-the-queens', 'Delivery Mylar Bags', [q('queens-banner', 'Your Queens are on the way', 'Three Queens holding branded purple mylar bags')], undefined, 'Mylar bags'),
          { media: [q('delivery-scooter', 'The delivery experience', 'Purple delivery scooter with an open branded delivery box')] },
        ],
      },
      {
        id: 'experience', label: 'Beyond the delivery', lead: 'A world to participate in.', body: [],
        blocks: [
          chapter('call-the-queens', 'Gamification & Community', [q('merchandise', 'Collectible brand moments', 'Branded pouch, grinder, rolling papers, and character stickers')]),
          chapter('call-the-queens', 'Website Design', []),
          chapter('call-the-queens', 'Coming Soon Game Concept', []),
          { media: [q('brand-banner', 'Call The Queens', 'White crown and brush-lettered logo on the brand gradient')] },
        ],
      },
    ],
  },
}

export function getCaseStudy(project: Project) {
  return caseStudies[project.slug as Slug]
}
