# Portfolio media

The active portfolio uses the supplied `Portfolio` folder, `Untitled document.md`, and `Hero Section Banners` folder. The source originals are unchanged. Nine projects appear in the gallery and open into individual case studies.

## Source mapping

`scripts/portfolio-sources.json` maps original filenames to descriptive web asset names. `src/content/portfolio.json` contains the imported document paragraphs and asset dimensions. Editorial sequence, captions, and layouts live in `src/caseStudies.ts`.

| Original folder | Project | Web asset directory |
| --- | --- | --- |
| Frostiez | Frostiez | public/media/projects/frostiez |
| HB | Happy Botanist | public/media/projects/happy-botanist |
| Frost | Frost | public/media/projects/frost |
| Weeed | Weeed | public/media/projects/weeed |
| CTQ | Call The Queens | public/media/projects/call-the-queens |
| Hero Section Covers | Gallery and page covers | cover.webp in each project directory |
| Hero Section Banners | All nine gallery logos | public/media/gallery and public/media/thumb/gallery |

The new gallery banners are separate from the existing case-study covers. Their filename mapping is `Frostiez_2` → `frostiez`, `HB` → `happy-botanist`, `Frost` → `frost`, `Weeed` → `weeed`, `CTQ` → `call-the-queens`, `Canabotanica` → `canabotanica`, `Hardy_s` → `hardys`, `Sunset` → `sunset`, and `Sunset Collection` → `sunset-collection`. Each source filename ends with ` - Home Page Banner.png`.

## Reimport

Requires Python 3, ImageMagick, cwebp, ffmpeg, and ffprobe:

```sh
python3 scripts/import-portfolio.py /path/to/Portfolio '/path/to/Untitled document.md'
```

The importer skips existing media files and refreshes the imported copy. To regenerate a particular asset after replacing its source, remove its generated WebP or MP4 first.

Images are converted to WebP at quality 86 with a maximum dimension of 2200px. Covers also get 800px, quality 82 thumbnails. The gallery banners use the same conversion settings and total approximately 90KB for all nine thumbnails. Image dimensions are retained so detail pages reserve the correct space and show complete artwork.

Supplied 1080p logo animations are copied intact. Larger video files are encoded to H.264 with fast-start metadata. Detail-page videos load on demand and use native playback controls. The gallery uses the curated still covers; its field animation and project transitions remain active.

Earlier stock assets remain in the media directory but are no longer referenced by the project list or case studies. Their original source list remains in `public/media/article/sources.json`; the previous download script is retained separately.

## Typography

Inter by Rasmus Andersson is bundled locally under the SIL Open Font License. See `public/media/Inter-OFL.txt`.

## Figma case-study batch (November 4, 2026)

All nine projects now open directly into case-study pages. Frostiez keeps its existing custom layout; the other eight use the shared `GuideCaseStudy` renderer with individual content and spread sequences in `src/content/guideStories.json`. Text and image entrances reuse `src/scrollReveal.tsx`. GIFs use the shared lazy `ProjectAnimation` component and retain a still for reduced-motion visitors.

The supplied `Gif Animations` folder supplies the animations for all eight new pages. Original animations are copied intact into each project's media directory. They load near the viewport, rather than loading the whole animation collection when the gallery opens.

Happy Botanist, Frost, Weeed, and Call The Queens use the existing original WebP artwork. Hardy’s, Sunset, and Canabotanica now use full-resolution artwork from authenticated Figma PDF exports (`Hardy's Cannabis.pdf`, `Sunset.pdf`, and `Canabotanica.pdf`). The 27 replacement WebPs use original embedded photographs (up to 4096px before conversion, capped at 2560px for the web) or composed panels rendered at 2× from the exported vectors. Their filenames differ from the earlier preview JPGs to avoid stale cached images. Hardy’s pre-roll tubes use the complete original photograph with its natural aspect ratio.

Sunset Collection's five still images also use originals extracted from the authenticated `Sunset Collection.pdf` export, converted to WebP at quality 93 with a maximum dimension of 2560px. The Figma boards and the supplied portfolio document provide the copy. Sunset Collection's copy is transcribed from Figma.

No post-implementation browser or visual review was performed, as requested for this session. Production compilation remains available through `npm run build`.
