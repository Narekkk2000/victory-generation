# Allan portfolio

A local React + TypeScript + Vite portfolio with independent art direction: a full-width work gallery, refractive interactions applied directly to project cards, editorial typography, and an interactive project constellation. The initial gallery flow was inspired by [allanleone.com](https://allanleone.com/). The active projects use the supplied portfolio assets; all media is served locally from `public/media`.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. The current preview runs at **http://localhost:5174/**.

```sh
npm run build
npm run preview
```

The production output is `dist/`. For deployment to a static host, rewrite unmatched paths to `index.html` so project URLs work on reload.

## Included

- Full-width gallery composition, with no added hero or side section.
- **The catalogue is a diamond mosaic**, zoomed so only a handful of tiles share the screen. The tiles interlock edge to edge with only a seam between them, because the lattice is a square grid read at 45 degrees — tiles are chosen in that turned frame, then each fragment is measured back in the upright frame so the artwork stays level while the shapes tessellate.
- **Each diamond is filled edge to edge with project artwork.** There is no separate text panel or caption overlay; project names remain available through accessible controls and the project viewer.
- **Opening a project unfolds the diamond into a rectangle** as the card flies into the player, and closing folds it back. Both shapes are traced as the same ring of points so the browser can interpolate between them.
- Behaviour, all of it per-card — each tile holds its own arrival, sway, recoil and lift:
  - **Boot-up.** Cards arrive one at a time, sweeping outward from the middle of the view with their artwork visible.
  - **Hover.** The diamond lifts slightly and the artwork eases in. A glass rim, moving sheen, highlights, and subtle color treatment fade in on the hovered card and fade out when the pointer leaves.
  - **Press shockwave.** A press sends a ripple through the lattice that displaces each card in turn as it passes.
  - **Idle swell** and **pointer lean** retain the gallery's movement.
  - **Source colors.** Idle cards render with their original colors. Hover treatments stay local to the selected diamond; there is no global bloom, grain, or color grading.
- Interactive Warp mode: hold Space outside a control to intensify geometric refraction. The motion toggle disables Warp and ambient movement.
- Holographic card tilt and local light on the project cards outside the canvas.
- WebGL work canvas with a technical dot field, reactive coral highlights, pointer-following light, infinite two-axis dragging, inertia, and video textures.
- A lightweight exploration cursor, live project caption, Canvas / Index views, and an ambient-motion toggle. The alternate index opens the same project player from its thumbnail.
- Continuous card-to-player transitions: the clicked tile expands in 480 ms, with the caption and related work revealing during the motion. Frame handoff uses the existing 2D atlas without WebGL readback or image encoding. Closing takes 280 ms; resizing and interrupted navigation cancel stale animations safely. Reduced-motion preferences skip the flight.
- Nine projects, with an accessible keyboard alternative and a regular gallery fallback if WebGL is unavailable.
- Project viewer with its existing media cover and related projects, followed by a complete article. **Read the story** scrolls into the article; the project title opens its standalone page. Actual footage has play/pause, seeking, mute, and full-screen controls.
- Full case-study pages at `/work/:slug/`: a full-width cover plate, then a quiet paper page — a category chip, one large headline, a standfirst, and a two-column reading body. A sticky left rail holds three or four project-specific sections; the open section follows whichever block of work is crossing the reading band, and selecting a label scrolls to its media. A credits grid, an expandable project-scope map, two next-project plates, and a footer close the page. Below 900px the rail becomes a sticky horizontal section menu and the full text appears alongside its media.
- The fixed masthead switches to ink type once the paper surface reaches it.
- Supplied project artwork, packaging studies, campaign media, and brand animations, with captions and a full-screen image viewer. Use its arrows, keyboard arrows, and Escape to browse or dismiss it.
- Responsive layouts, reduced-motion support, browser history, shareable viewer links, and local fonts.
- About, process, and conversation panels. The standalone contact page and its navigation links have been removed.
- Inter is the only typeface.

## Portfolio content

The gallery includes Frostiez, Happy Botanist, Frost, Weeed, Call The Queens, Canabotanica, Hardy’s, Sunset, and Sunset Collection. All nine use the supplied `Hero Section Banners` artwork. The original five retain their existing case studies; the four new entries have image previews only, with no standalone pages or story links.

- `src/content/portfolio.json`: imported copy, media paths, and dimensions.
- `src/data.ts`: the project list, short descriptions, palette, and disciplines.
- `src/caseStudies.ts`: chapters, media sequence, captions, and layout variations.
- `src/components/ProjectArticle.tsx` and `src/article.css`: the shared minimal case-study design.
- `scripts/portfolio-sources.json`: original-to-web asset mapping.
- `scripts/import-portfolio.py`: repeatable media and text import; see `MEDIA.md`.

The gallery order generates both the shader lookup and pointer-selection order from one shared list. Its atlas and related-project links adapt to the current project count. Gallery covers use full-size WebP banners; project animations appear in the viewer and as controlled films in the articles.

Each page keeps the editorial grid, typography, image viewer, and scope map. Subtle paper tints and variations in full-width images, paired products, offset compositions, and portrait triptychs give the brands individual pacing. On mobile, section navigation remains sticky and all body copy stays alongside the relevant media.

## Verified

- Production TypeScript compilation and Vite build.
- Desktop at 1512 × 725, mobile at 390 × 844.
- Canvas selection and drag gestures, project switching, playback controls, detail navigation, direct-route reload, scroll-to-details, contact panel, Escape dismissal, and horizontal-overflow checks.
- Case routes on desktop (1440 × 900) and mobile (375 × 812), with and without project footage: sticky rail travel, section tracking, masthead surface switching, the image lightbox and its keyboard controls, the scope map, next-project plates, and no horizontal overflow. Existing transition code is unchanged.

## Loading

The gallery paints immediately, then decodes full-size WebP banners into the atlas. The nine banners total approximately 350KB on disk. Landscape banners retain enough vertical resolution for the square atlas crop. Detail images are loaded lazily with explicit dimensions, and in-article films load only when played. Full-size gallery imagery is limited to 2200px on the longest side.

Phones use atlas tiles up to 1024px and canvas resolution up to 3× for sharp logos on high-density displays, subject to the GPU texture limit. Phones and save-data connections retain a lighter rendering path. Reduced-motion preferences remove ambient movement and reveal animations.
