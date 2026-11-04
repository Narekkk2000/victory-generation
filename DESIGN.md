# Reference and implementation

## Independent art direction

Composition constraint: the homepage is a full-viewport project gallery with its header, footer controls, and navigation dock removed. Project pages retain their existing chrome. The skeleton — an infinite, draggable, curved wall of project cards — is fixed. Everything else is a lens over it. Do not introduce a separate hero, side section, sculpture, or promotional copy. Hold Space to activate Warp. Hit geometry and fast project transitions remain stable.

Card thesis: the catalogue card is a rounded diamond filled edge to edge with project artwork. There is no separate text panel, title, index, divider, or caption overlay. Project names remain available to keyboard and screen-reader users and appear when a project opens.

Field thesis: the lattice is a diamond mosaic, which is a square grid seen at 45 degrees. Tiles are chosen in that turned frame and each fragment is measured back in the upright frame, so the diamonds interlock with no gaps while their artwork stays level. Hit testing and the flight origin read the same turned lattice. Each tile carries its own arrival, sway, recoil, and lift. Cards arrive outward from the view centre with their artwork visible. Hover raises the diamond and eases the image inward; a press sends a geometric shockwave through the lattice. Idle swell, pointer lean, dragging, inertia, and Warp refraction remain.

Color constraint: idle diamonds retain their source colors. Restore the glass rim, sheen, highlights, subtle color fringing, and brightness treatment only on the hovered diamond, blended with its existing hover easing. Fade back to source colors on pointer leave. Keep rendering direct, without global bloom, grain, or tone mapping, so the other cards remain unaffected. Shadows, background accents, and edge shading stay in the gaps between diamonds.

Reference departure: allanleone.com is a uniform wall of soft rounded tiles, each a full-bleed photograph with its title floating on a gradient scrim, packed edge to edge under a fixed radial blur, with no visible field and no per-card behaviour. This build shares none of that: a different card object, a ruled sheet behind it, near-square corners, and behaviour on every tile.

Visual thesis: a cinematic design observatory, combining warm coral signals, an ink-black technical field, editorial typography, and photographic work that reacts to exploration.

Content plan: a distinctive masthead frames the project canvas; a live project caption and an alternate editorial index support discovery; each case study follows its original cover with a readable editorial article.

Interaction thesis: a lightweight pointer reticle and geometric hover lift make the canvas tactile; Canvas / Index changes the way work is explored; an interactive project constellation reveals the thinking behind the finished work. Ambient motion can be disabled. Existing 480 ms project transitions remain unchanged.

Reference: https://allanleone.com/ (inspected October 28, 2026).

Selecting a tile or index thumbnail opens the existing cinematic project cover with three related projects. “Read the story” scrolls into the article below it; the project title opens the standalone `/work/:slug/` page. The original award badge, monogram, and archive navigation have been replaced by a typographic masthead, independent navigation, and a process panel.

Article visual thesis: a quiet editorial case page on cool paper. One large headline, one column of prose, one column of work, and nothing competing with the photography. Reference: https://mubien.com/case/youtube-shopping (inspected November 1, 2026). The cover media, dimensions, playback handoff, and morph timing remain unchanged.

Article content plan: a category chip; a two-line headline; a standfirst; a sticky rail of three or four project-specific sections beside a column of large media plates, one group per section; a credits grid; an expandable discipline map; two next-project plates; a footer. Each project uses its supplied narrative, original artwork, and animations. Media retain their full proportions; pairs, offset compositions, and portrait triptychs vary the rhythm without changing the editorial grid.

Article interaction thesis: the open rail section follows whichever media group crosses the reading band, and a rail label scrolls to its group. Photographs open in a full-screen viewer with arrow and Escape control. The fixed masthead switches to ink type when the paper surface reaches it. Below 900px the rail becomes a sticky horizontal section menu, with the full section copy rendered next to its media. Reduced-motion preferences keep all content immediately readable and remove the reveal and panel transitions.

Performance thesis: the gallery is readable on its first frame and never blocks on the full asset set. Covers decode to the atlas tile size; only cards with running footage are repainted, and only their corner of the texture is re-uploaded. Phones and save-data connections get a smaller atlas, a lower pixel ratio, a single texture fetch per card, and no video decoding.

Project transition: lift the selected tile into the player with an immediate 480 ms ease-out, unfolding it from a diamond into a rectangle as it travels. The two shapes are traced as the same ring of 48 points — a superellipse whose exponent runs from 1.4 to 22 — so the browser interpolates one into the other. This is the one place the transition animates something other than transform and backdrop opacity; a clip path is the only way to carry the shape across, and it is removed the moment the flight settles. Closing back to the catalogue folds the rectangle into a diamond again over 280 ms; opening a standalone case page does not, because the card there was never a diamond. Reveal the caption and related projects after 120 ms while the card settles, and keep Close available throughout. Animate only transforms and the opacity of a separate backdrop layer. Handoff frames stay in 2D canvas memory; no WebGL readback, buffer preservation, image encoding, full-canvas filter, or animated corner radii. Closing takes 280 ms, with a short fade when the original tile no longer matches the selected project or viewport. Resize and interrupted navigation cancel pending animations and timers. Playback time carries across the transition. Reduced-motion users get an immediate handoff.

Scope: a local Vite + React + TypeScript scaffold. No hosted deployment. Original code with the supplied portfolio media and copy. See MEDIA.md for the import workflow and src/caseStudies.ts for editorial sequence.

Project variation: Frostiez uses warm paper and bright blue section rules; Happy Botanist uses stone paper, square markers, and paired product studies; Frost uses cool paper and gently rounded plates; Weeed uses green rules and asymmetric brand-asset spreads; Call The Queens uses lavender paper and staggered portrait character stories. The shared typography, two-column grid, whitespace, lightbox, scope map, and project transitions remain the base.
