import { useEffect, useRef, useState } from 'react'
import { galleryOrder, galleryVideo, projects, thumbnail } from '../data'
import type { Project } from '../data'
import { elementOrigin } from '../projectMotion'
import type { ProjectOrigin } from '../projectMotion'

/** Draw the gallery directly, with visual treatments confined to the hovered card. */
const VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const SCENE = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uViewport;
uniform vec2 uOffset;
uniform vec2 uTile;
uniform float uTime;
uniform vec2 uSmear;
uniform vec2 uPointer;
uniform sampler2D uAtlas;
uniform vec2 uHoverCell;
uniform vec2 uHoverPrev;
uniform float uHoverMix;
uniform float uHover;
uniform float uWarp;
uniform vec3 uImpulse;
uniform vec3 uAccent;
uniform float uQuality;
uniform float uProjects;
uniform float uIntroTime;
uniform float uLife;

// Generate the GPU lookup from the same order used by pointer hit testing.
float projectAt(vec2 cell) {
  float col = mod(cell.x, 5.0);
  float row = mod(cell.y, 4.0);
  ${Array.from({ length: 4 }, (_, row) => `if (row < ${row + 1}.0) { ${galleryOrder.slice(row * 5, row * 5 + 4).map((id, col) => `if (col < ${col + 1}.0) return ${id}.0;`).join(' ')} return ${galleryOrder[row * 5 + 4]}.0; }`).join('\n  ')}
  return 0.0;
}

vec3 sampleCard(float id, vec2 uv) {
  vec2 atlas = (vec2(mod(id, 5.0), floor(id / 5.0)) + clamp(uv, .002, .998)) / vec2(5.0, ${Math.ceil(projects.length / 5)}.0);
  return texture2D(uAtlas, atlas).rgb;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float roundedBox(vec2 point, vec2 halfSize, float radius) {
  vec2 q = abs(point) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

/* Dust drifting between the cards, two layers at different depths. */
float dust(vec2 p, float scale, float seed) {
  vec2 q = p * scale;
  vec2 cell = floor(q);
  vec2 f = fract(q);
  float pick = hash(cell + seed);
  vec2 at = vec2(hash(cell + seed + 7.3), hash(cell + seed + 19.7));
  float grain = smoothstep(.085, 0.0, length(f - at));
  return grain * step(.86, pick) * (.45 + .55 * hash(cell + seed + 3.1));
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uResolution;
  vec2 p = (screen - .5) * 2.0;
  float aspect = uViewport.x / uViewport.y;
  vec2 curved = p * vec2(1.0 + .21*p.x*p.x + .11*p.y*p.y, 1.0 + .14*p.x*p.x + .035*p.y*p.y);
  curved.x += sin(p.y * 2.4 + uTime * .35) * .004 * min(length(uSmear) * 18.0, 2.0);
  // A diamond mosaic is a square lattice seen at 45 degrees. Choose the tile in that
  // turned frame, then measure the fragment back in the upright frame, so the tiles
  // interlock with no gaps while their artwork stays level.
  vec2 plane = curved * uViewport * .5 / uTile + uOffset + 1.5;
  vec2 woven = vec2(plane.x + plane.y, plane.y - plane.x) * .70710678;
  vec2 cell = floor(woven);
  vec2 middle = cell + .5;
  vec2 heart = vec2(middle.x - middle.y, middle.x + middle.y) * .70710678;
  float id = mod(projectAt(cell), uProjects);
  float selected = mix(1.0 - step(.1, distance(cell, uHoverPrev)), 1.0 - step(.1, distance(cell, uHoverCell)), uHoverMix) * uHover;

  float lens = dot(p, p);
  float depth = 1.0 - smoothstep(.3, 2.45, lens);
  vec2 field = (screen - .5) * vec2(aspect, 1.0);
  vec2 pointerField = (uPointer - .5) * vec2(aspect, 1.0);
  float toPointer = length(field - pointerField);

  // --- Per-card state. Every tile gets its own arrival, sway, recoil and lift,
  // so the lattice behaves like a wall of separate objects rather than one texture.
  vec2 relative = heart - (uOffset + 1.5);
  vec2 cellPixels = relative * uTile;
  float cellDistance = length(cellPixels) / (uViewport.y * .5);
  vec2 cellScreen = .5 + cellPixels / uViewport;

  // Arrival sweeps outward from the middle of the view, one card at a time.
  float arrive = clamp((uIntroTime - cellDistance * .22) / .55, 0.0, 1.0);
  float arrived = 1.0 - pow(1.0 - arrive, 3.0);

  // A slow travelling swell keeps the wall alive while nothing is happening.
  vec2 sway = vec2(sin(cell.x * 1.7 + cell.y * .9 + uTime * .55), cos(cell.y * 1.3 - cell.x * .7 + uTime * .44)) * .003 * uLife;

  // A press sends a shockwave out through the wall, card by card.
  float shockRadius = length((cellScreen - uImpulse.xy) * vec2(aspect, 1.0));
  float shock = sin(shockRadius * 8.0 - uImpulse.z * 5.0) * exp(-uImpulse.z * 2.4) * exp(-shockRadius * 1.1) * .014 * uLife;
  vec2 recoil = normalize(cellScreen - uImpulse.xy + vec2(.0001)) * shock;

  float cardScale = mix(.58, 1.0, arrived) * (1.0 + selected * .025);
  vec2 local = (plane - heart - sway - recoil) / cardScale;

  const float HALF = .478;
  const float EXTENT = HALF * 1.41421356;
  vec2 halfSize = vec2(uTile.x * HALF);
  float radius = uTile.y * .07;
  vec2 q = local * uTile;
  vec2 turned = vec2(q.x + q.y, q.y - q.x) * .70710678;
  float d = roundedBox(turned, halfSize, radius);
  float mask = (1.0 - smoothstep(-1.0, 1.0, d)) * step(.001, arrive);
  vec2 dropped = q - vec2(uTile.y * .012, uTile.y * .045);
  float dropShadow = roundedBox(vec2(dropped.x + dropped.y, dropped.y - dropped.x) * .70710678, halfSize, radius);

  vec2 uv = local / (EXTENT * 2.0) + .5;
  vec2 mediaUv = uv;
  // Each card leans toward the pointer, so the wall reads as panels rather than a print.
  mediaUv += clamp((cellScreen - uPointer) * vec2(aspect, 1.0), -1.2, 1.2) * .016;
  float edge = smoothstep(.62, 1.0, abs(uv.y - .5) * 2.0);
  float ripple = sin(uv.x * 15.0 + uTime * .5) * sin(uv.y * 12.0 - uTime * .2);
  float impulseRadius = length((screen - uImpulse.xy) * vec2(aspect, 1.0));
  float impulse = sin(impulseRadius * 42.0 - uImpulse.z * 8.0) * exp(-uImpulse.z * 2.5) * .018;
  float energy = min(length(uSmear) * 14.0, 1.0) + uWarp * .75;
  vec2 refracted = mediaUv + vec2(ripple * (.005 * edge + energy * .02), ripple * (.008 * edge + energy * .016));
  refracted += normalize(screen - uImpulse.xy + .0001) * impulse;
  // The artwork fills the diamond and eases inward on hover.
  refracted = (refracted - .5) * (1.0 - selected * .035) + .5;

  // Idle cards keep their source colors. Fade the glass treatment in only on hover.
  vec3 color = sampleCard(id, refracted);
  if (selected > .001) {
    vec3 hoverColor = color;
    if (uQuality > .5) {
      float disperse = (.0007 + edge * edge * .0026) * (1.0 - min(length(uSmear) * 22.0, 1.0));
      hoverColor.r = mix(hoverColor.r, sampleCard(id, refracted + vec2(disperse, 0.0)).r, edge * .8);
      hoverColor.b = mix(hoverColor.b, sampleCard(id, refracted - vec2(disperse, 0.0)).b, edge * .8);
    }

    float upright = -local.y / EXTENT;
    vec3 accent = mix(vec3(.52, .58, .63), uAccent, .6);
    float rim = 1.0 - smoothstep(0.0, 3.2, abs(d + 2.2));
    float pulse = pow(max(0.0, sin(uTime * .33 + hash(cell + 11.0) * 6.2831853)), 60.0) * uLife;
    hoverColor += rim * accent * (.2 + pulse * .7 + uWarp * .2);
    float catchLight = (1.0 - smoothstep(0.0, 2.6, abs(d + 1.4))) * smoothstep(.05, .8, upright);
    hoverColor += catchLight * .2;
    float bevel = smoothstep(uTile.y * .03, 0.0, -d) * smoothstep(0.0, .5, upright);
    hoverColor += bevel * .045;
    hoverColor -= smoothstep(uTile.y * .04, 0.0, -d) * smoothstep(0.0, .55, -upright) * .05;

    float sheenTravel = fract(uTime * .07 + hash(cell + 5.0)) * 2.4 - .2;
    float sheen = exp(-pow((uv.x + uv.y - sheenTravel) * 2.6, 2.0)) * uLife;
    hoverColor += vec3(.72, .82, 1.0) * sheen * .16;
    float rake = pow(max(0.0, 1.0 - abs(uv.x * .62 + uv.y * .38 - (uPointer.x * 1.5 - .25)) * 1.9), 3.0);
    hoverColor += vec3(.80, .88, 1.0) * rake * .018 * (.35 + depth * .65);
    hoverColor *= .96 + .22 * exp(-toPointer * 1.6);
    float luma = dot(hoverColor, vec3(.299, .587, .114));
    hoverColor = mix(vec3(luma * .7), hoverColor, .66 + depth * .34);
    color = mix(color, hoverColor, selected);
  }

  vec3 background = mix(vec3(.018, .024, .036), vec3(.030, .038, .054), screen.y);
  // Two dust layers track the drag at different rates, so the gaps hold depth.
  vec2 drift = uOffset * vec2(uTile.x / uViewport.x, uTile.y / uViewport.y);
  float grains = dust(field - drift * .35, 8.0, 0.0) * depth;
  background += vec3(.46, .60, .78) * grains * .22;
  background += vec3(.055, .028, .020) * smoothstep(1.3, 0.0, length(field + vec2(0.0, .55)));
  if (uQuality > .5) {
    float fine = dust(field - drift * .85, 15.0, 31.0) * depth;
    background += vec3(.78, .66, .58) * fine * .13;
    float nebula = pow(max(0.0, sin(atan(field.y, field.x) * 1.5 - length(field) * 5.0 + uTime * .1)), 24.0);
    background += mix(vec3(.10, .24, .40), uAccent, .45) * nebula * (.055 + uWarp * .14) * depth;
  }
  // The hovered project spills its colour into the field behind it.
  float spill = exp(-toPointer * 2.0) * (.05 + selected * .05 + uWarp * .1);
  background += uAccent * spill;
  background *= 1.0 - exp(-max(dropShadow, 0.0) * .045) * (1.0 - mask) * .66;
  float halo = exp(-max(d, 0.0) * .011) * (1.0 - mask) * selected;
  background += uAccent * halo * .08;
  float vignette = 1.0 - .55 * pow(abs(p.x), 3.5);
  vignette *= 1.0 - .72 * pow(abs(p.y), 7.0);
  // Edge shading belongs to the gaps, never to the artwork.
  background *= clamp(vignette, 0.0, 1.0);
  gl_FragColor = vec4(mix(background, color, mask), 1.0);
}
`

type CardSource = HTMLVideoElement | HTMLImageElement | ImageBitmap

function sourceSize(source: CardSource) {
  if (source instanceof HTMLVideoElement) return [source.videoWidth, source.videoHeight]
  if (source instanceof HTMLImageElement) return [source.naturalWidth, source.naturalHeight]
  return [source.width, source.height]
}

/** Decode off the main thread and down to the atlas tile, so a phone never holds a full-size bitmap. */
async function loadCover(src: string, width: number): Promise<CardSource> {
  try {
    const response = await fetch(src)
    if (!response.ok) throw new Error(src)
    return await createImageBitmap(await response.blob(), { resizeWidth: width, resizeQuality: 'high' })
  } catch {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = src
    })
  }
}

function drawCover(ctx: CanvasRenderingContext2D, source: CardSource, width: number, height: number, scale = 1) {
  const [sourceWidth, sourceHeight] = sourceSize(source)
  if (!sourceWidth || !sourceHeight) return
  const ratio = Math.max(width / sourceWidth, height / sourceHeight) * scale
  ctx.drawImage(source, (width - sourceWidth * ratio) / 2, (height - sourceHeight * ratio) / 2, sourceWidth * ratio, sourceHeight * ratio)
}

function accentOf(project: Project) {
  const value = parseInt(project.color.slice(1), 16)
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255]
}

// The card edges inside a cell, shared by the shader, the hit test and the flight origin.
/** Half-width of a tile in the turned lattice, and its reach in upright grid units. */
const TILE_HALF = .478
const TILE_EXTENT = TILE_HALF * Math.SQRT2
/** The four tips of a diamond, which bound it exactly. */
const TIPS = [[-TILE_EXTENT, 0], [TILE_EXTENT, 0], [0, -TILE_EXTENT], [0, TILE_EXTENT]]

export default function Gallery({ onSelect, onHover, paused, hidden, motion, warp }: { onSelect: (project: Project, origin?: ProjectOrigin) => void; onHover: (project: Project) => void; paused: boolean; hidden: boolean; motion: boolean; warp: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const selectRef = useRef(onSelect)
  const pausedRef = useRef(paused)
  const videosRef = useRef<HTMLVideoElement[]>([])
  const hoverRef = useRef(onHover)
  const motionRef = useRef(motion)
  const warpRef = useRef(warp)
  const [ready, setReady] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null)
  useEffect(() => { selectRef.current = onSelect }, [onSelect])
  useEffect(() => { hoverRef.current = onHover }, [onHover])
  useEffect(() => { warpRef.current = warp }, [warp])
  useEffect(() => {
    pausedRef.current = paused
    motionRef.current = motion
    videosRef.current.forEach(video => {
      if (paused || !motion || document.hidden) video.pause()
      else video.play().catch(() => {})
    })
  }, [paused, motion])

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
    if (!gl) { setFallback(true); return }
    let disposed = false
    let frame = 0
    let atlasTime = 0
    let lastTime = 0
    let introStart = 0
    let introSeconds = 0
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    // A phone runs a lighter field with smaller atlas tiles.
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection
    const compact = innerWidth < 760 || matchMedia('(pointer: coarse)').matches
    const frugal = compact || Boolean(connection?.saveData) || ((navigator as { deviceMemory?: number }).deviceMemory ?? 8) < 4
    const offset = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    const speed = { x: 0, y: 0 }
    const pointer = { x: .5, y: .5 }
    const hover = { x: -99, y: -99, prevX: -99, prevY: -99, mix: 1, active: 0, amount: 0, slug: '' }
    const impulse = { x: .5, y: .5, age: 10 }
    const accent = accentOf(projects[0])
    const accentTarget = accent.slice()
    const smear = { x: 0, y: 0 }
    let warpAmount = 0
    let intro = reducedMotion ? 1 : 0
    const drag = { active: false, x: 0, y: 0, moved: 0, time: 0 }
    const tile = { w: 480, h: 292 }
    const lens = { w: 480, h: 292 }
    let width = 0
    let height = 0
    const videos: HTMLVideoElement[] = []
    videosRef.current = videos

    function compile(type: number, source: string) {
      const result = gl!.createShader(type)!
      gl!.shaderSource(result, source)
      gl!.compileShader(result)
      if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(result) || 'Shader compilation failed')
      return result
    }
    const shaders: WebGLShader[] = []
    const programs: WebGLProgram[] = []
    function build(fragmentSource: string, names: string[]) {
      const program = gl!.createProgram()!
      const vertex = compile(gl!.VERTEX_SHADER, VERTEX)
      const fragment = compile(gl!.FRAGMENT_SHADER, fragmentSource)
      gl!.attachShader(program, vertex)
      gl!.attachShader(program, fragment)
      gl!.linkProgram(program)
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(program) || 'Link failed')
      shaders.push(vertex, fragment)
      programs.push(program)
      const uniforms = Object.fromEntries(names.map(name => [name, gl!.getUniformLocation(program, name)]))
      return { program, uniforms, position: gl!.getAttribLocation(program, 'aPosition') }
    }

    type Pass = ReturnType<typeof build>
    let scene: Pass
    try {
      scene = build(SCENE, ['uResolution', 'uViewport', 'uOffset', 'uTile', 'uTime', 'uSmear', 'uPointer', 'uHoverCell', 'uHoverPrev', 'uHoverMix', 'uHover', 'uWarp', 'uImpulse', 'uAccent', 'uQuality', 'uProjects', 'uIntroTime', 'uLife'])
    } catch { setFallback(true); return }

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

    const usePass = (pass: Pass) => {
      gl!.useProgram(pass.program)
      gl!.enableVertexAttribArray(pass.position)
      gl!.vertexAttribPointer(pass.position, 2, gl!.FLOAT, false, 0, 0)
    }

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    const atlas = document.createElement('canvas')
    const cardWidth = Math.min(compact ? 448 : 768, Math.floor(gl.getParameter(gl.MAX_TEXTURE_SIZE) / 5))
    const cardHeight = cardWidth
    atlas.width = cardWidth * 5
    atlas.height = cardHeight * Math.ceil(projects.length / 5)
    const ctx = atlas.getContext('2d')!
    // One card is painted at a time, then uploaded into its own corner of the texture.
    const card = document.createElement('canvas')
    card.width = cardWidth
    card.height = cardHeight
    const cardCtx = card.getContext('2d')!
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    const images: (CardSource | null)[] = Array(projects.length).fill(null)
    const videoMap = new Map<number, HTMLVideoElement>()

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(devicePixelRatio, compact ? 1.25 : 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      tile.w = width < 600 ? Math.max(226, width * .6) : Math.min(400, width * .26)
      tile.h = tile.w
      lens.w = tile.w
      lens.h = tile.h
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    /** Fill the atlas tile with artwork; the shader clips it to the diamond. */
    function paintCard(index: number, time: number) {
      const project = projects[index]
      const SIZE = 768
      cardCtx.save()
      cardCtx.scale(cardWidth / SIZE, cardWidth / SIZE)
      cardCtx.fillStyle = project.color
      cardCtx.fillRect(0, 0, SIZE, SIZE)

      const video = videoMap.get(index)
      const source = video && video.readyState >= 2 ? video : images[index]
      if (source) drawCover(cardCtx, source, SIZE, SIZE, video && !reducedMotion ? 1.04 + Math.sin(time * .00012 + index) * .016 : 1.02)
      cardCtx.restore()

      ctx.clearRect((index % 5) * cardWidth, Math.floor(index / 5) * cardHeight, cardWidth, cardHeight)
      ctx.drawImage(card, (index % 5) * cardWidth, Math.floor(index / 5) * cardHeight)
      gl!.bindTexture(gl!.TEXTURE_2D, texture)
      gl!.texSubImage2D(gl!.TEXTURE_2D, 0, (index % 5) * cardWidth, Math.floor(index / 5) * cardHeight, gl!.RGBA, gl!.UNSIGNED_BYTE, card)
    }

    const paintAll = (time: number) => projects.forEach((_, index) => paintCard(index, time))

    function render(time: number) {
      if (disposed) return
      const delta = Math.min((time - lastTime) / 16.667 || 1, 3)
      lastTime = time
      if (!pausedRef.current && !document.hidden) {
        if (!introStart) introStart = time
        if (!reducedMotion) {
          introSeconds = (time - introStart) / 1000
          const elapsed = Math.min((time - introStart) / 1500, 1)
          intro = 1 - Math.pow(1 - elapsed, 3)
        }
        // A slow push in: the wall starts a little further away and settles into place.
        lens.w = tile.w * (.9 + .1 * intro)
        lens.h = tile.h * (.9 + .1 * intro)
        if (!drag.active) {
          speed.x *= Math.pow(.92, delta)
          speed.y *= Math.pow(.92, delta)
          target.x += speed.x * delta
          target.y += speed.y * delta
          if (!reducedMotion && motionRef.current) target.x += .000025 * delta
        }
        offset.x += (target.x - offset.x) * (1 - Math.pow(.86, delta))
        offset.y += (target.y - offset.y) * (1 - Math.pow(.86, delta))
        // Only cards carrying running footage are repainted, and only their corner is re-uploaded.
        if (motionRef.current && videoMap.size && time - atlasTime > 80) {
          videoMap.forEach((video, index) => { if (video.readyState >= 2 && !video.paused) paintCard(index, time) })
          atlasTime = time
        }
        for (let channel = 0; channel < 3; channel++) accent[channel] += (accentTarget[channel] - accent[channel]) * .08
        // The trailing distance behind the pointer drives geometric refraction.
        const lag = Math.max(-.034, Math.min(.034, (target.x - offset.x) * .055))
        const lagY = Math.max(-.034, Math.min(.034, (target.y - offset.y) * .055))
        smear.x += (lag - smear.x) * .3
        smear.y += (lagY - smear.y) * .3
        warpAmount += ((warpRef.current && motionRef.current && !reducedMotion ? 1 : 0) - warpAmount) * .08
        impulse.age += delta / 60
        // Slow, frame-rate independent easing keeps the lift calm on 60Hz and 120Hz alike.
        hover.amount += (hover.active - hover.amount) * (1 - Math.pow(.92, delta))
        hover.mix += (1 - hover.mix) * (1 - Math.pow(.9, delta))

        // Render directly so hover effects cannot spill onto the other cards.
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
        gl!.viewport(0, 0, canvas.width, canvas.height)
        usePass(scene)
        gl!.activeTexture(gl!.TEXTURE0)
        gl!.bindTexture(gl!.TEXTURE_2D, texture)
        gl!.uniform1i(scene.uniforms.uAtlas, 0)
        gl!.uniform2f(scene.uniforms.uResolution, canvas.width, canvas.height)
        gl!.uniform2f(scene.uniforms.uViewport, width, height)
        gl!.uniform2f(scene.uniforms.uOffset, offset.x, offset.y)
        gl!.uniform2f(scene.uniforms.uTile, lens.w, lens.h)
        gl!.uniform2f(scene.uniforms.uPointer, pointer.x, pointer.y)
        gl!.uniform1f(scene.uniforms.uTime, reducedMotion || !motionRef.current ? 0 : time * .001)
        gl!.uniform2f(scene.uniforms.uHoverCell, hover.x, hover.y)
        gl!.uniform2f(scene.uniforms.uHoverPrev, hover.prevX, hover.prevY)
        gl!.uniform1f(scene.uniforms.uHoverMix, hover.mix)
        gl!.uniform1f(scene.uniforms.uHover, hover.amount)
        gl!.uniform3f(scene.uniforms.uAccent, accent[0], accent[1], accent[2])
        gl!.uniform1f(scene.uniforms.uQuality, compact ? 0 : 1)
        gl!.uniform1f(scene.uniforms.uProjects, projects.length)
        gl!.uniform1f(scene.uniforms.uIntroTime, reducedMotion ? 99 : introSeconds)
        gl!.uniform1f(scene.uniforms.uLife, motionRef.current && !reducedMotion ? 1 : 0)
        gl!.uniform1f(scene.uniforms.uWarp, warpAmount)
        gl!.uniform3f(scene.uniforms.uImpulse, impulse.x, impulse.y, motionRef.current && !reducedMotion ? impulse.age : 10)
        gl!.uniform2f(scene.uniforms.uSmear, motionRef.current ? smear.x : 0, motionRef.current ? smear.y : 0)
        gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      }
      frame = requestAnimationFrame(render)
    }

    const hitTest = (x: number, y: number) => {
      const bounds = canvas.getBoundingClientRect()
      x = (x - bounds.left) * width / bounds.width
      y = (y - bounds.top) * height / bounds.height
      const px = (x / width - .5) * 2
      const py = (y / height - .5) * 2
      const gx = px * (1 + .21 * px * px + .11 * py * py) * width * .5 / lens.w + offset.x + 1.5
      const gy = py * (1 + .14 * px * px + .035 * py * py) * height * .5 / lens.h + offset.y + 1.5
      const wx = (gx + gy) * Math.SQRT1_2
      const wy = (gy - gx) * Math.SQRT1_2
      const cellX = Math.floor(wx)
      const cellY = Math.floor(wy)
      if (Math.max(Math.abs(wx - cellX - .5), Math.abs(wy - cellY - .5)) > TILE_HALF) return null
      const col = ((cellX % 5) + 5) % 5
      const row = ((cellY % 4) + 4) % 4
      return { project: projects[galleryOrder[row * 5 + col] % projects.length], cellX, cellY }
    }
    // Invert the gallery lens to recover the selected tile's screen bounds.
    const tileOrigin = (cellX: number, cellY: number, project: Project): ProjectOrigin => {
      const points: { x: number; y: number }[] = []
      // The tile's centre, carried from the turned lattice back into upright grid units.
      const heartX = ((cellX + .5) - (cellY + .5)) * Math.SQRT1_2
      const heartY = ((cellX + .5) + (cellY + .5)) * Math.SQRT1_2
      for (const [tipX, tipY] of TIPS) {
        const wx = (heartX + tipX - offset.x - 1.5) * lens.w * 2 / width
        const wy = (heartY + tipY - offset.y - 1.5) * lens.h * 2 / height
        let x = wx
        let y = wy
        for (let iteration = 0; iteration < 8; iteration++) {
          const fx = x * (1 + .21 * x * x + .11 * y * y) - wx
          const fy = y * (1 + .14 * x * x + .035 * y * y) - wy
          const a = 1 + .63 * x * x + .11 * y * y
          const b = .22 * x * y
          const c = .28 * x * y
          const d = 1 + .14 * x * x + .105 * y * y
          const determinant = a * d - b * c
          x -= (d * fx - b * fy) / determinant
          y -= (a * fy - c * fx) / determinant
        }
        points.push({ x: (x * .5 + .5) * width, y: (y * .5 + .5) * height })
      }
      let left = Math.min(...points.map(point => point.x))
      let top = Math.min(...points.map(point => point.y))
      let cardBounds = Math.max(...points.map(point => point.x)) - left
      let cardTall = Math.max(...points.map(point => point.y)) - top
      // Match the card's live size: the arrival scale, plus the lift it gets under the pointer.
      const spread = Math.hypot((heartX - offset.x - 1.5) * lens.w, (heartY - offset.y - 1.5) * lens.h) / (height * .5)
      const arrive = Math.max(0, Math.min((introSeconds - spread * .22) / .55, 1))
      const cardScale = (reducedMotion ? 1 : .58 + .42 * (1 - Math.pow(1 - arrive, 3))) * 1.025
      left += cardBounds * (1 - cardScale) / 2
      top += cardTall * (1 - cardScale) / 2
      cardBounds *= cardScale
      cardTall *= cardScale
      const frame = document.createElement('canvas')
      frame.width = Math.min(640, Math.ceil(cardBounds))
      frame.height = Math.max(1, Math.round(frame.width * cardTall / cardBounds))
      const index = projects.indexOf(project)
      // Copy the existing 2D atlas tile, never read back or encode the WebGL surface.
      frame.getContext('2d')!.drawImage(atlas, (index % 5) * cardWidth, Math.floor(index / 5) * cardHeight, cardWidth, cardHeight, 0, 0, frame.width, frame.height)
      const bounds = canvas.getBoundingClientRect()
      const scale = bounds.width / width
      return {
        left: bounds.left + left * scale, top: bounds.top + top * scale,
        width: cardBounds * scale, height: cardTall * scale, radius: lens.h * .07 * scale,
        frame, projectSlug: project.slug, viewportWidth: innerWidth, viewportHeight: innerHeight,
        currentTime: videoMap.get(index)?.currentTime,
        gallery: true,
      }
    }
    const down = (e: PointerEvent) => {
      drag.active = true
      drag.x = e.clientX
      drag.y = e.clientY
      drag.moved = 0
      drag.time = performance.now()
      const bounds = canvas.getBoundingClientRect()
      impulse.x = (e.clientX - bounds.left) / bounds.width
      impulse.y = (e.clientY - bounds.top) / bounds.height
      impulse.age = 0
      speed.x = 0
      speed.y = 0
      canvas.setPointerCapture(e.pointerId)
      canvas.classList.add('is-dragging')
    }
    const move = (e: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = (e.clientX - bounds.left) / bounds.width
      pointer.y = (e.clientY - bounds.top) / bounds.height
      const hit = hitTest(e.clientX, e.clientY)
      hover.active = hit ? 1 : 0
      if (hit) {
        if (hit.cellX !== hover.x || hit.cellY !== hover.y) {
          hover.prevX = hover.x
          hover.prevY = hover.y
          hover.mix = 0
        }
        hover.x = hit.cellX
        hover.y = hit.cellY
        if (hit.project.slug !== hover.slug) {
          hover.slug = hit.project.slug
          accentTarget.splice(0, 3, ...accentOf(hit.project))
          hoverRef.current(hit.project)
        }
      }
      if (!drag.active) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      const elapsed = Math.max(performance.now() - drag.time, 8)
      drag.moved += Math.abs(dx) + Math.abs(dy)
      target.x -= dx / lens.w
      target.y -= dy / lens.h
      speed.x = -dx / lens.w * 16 / elapsed
      speed.y = -dy / lens.h * 16 / elapsed
      drag.x = e.clientX
      drag.y = e.clientY
      drag.time = performance.now()
    }
    const up = (e: PointerEvent) => {
      if (!drag.active) return
      drag.active = false
      canvas.classList.remove('is-dragging')
      if (e.type === 'pointerup' && drag.moved < 8) {
        const hit = hitTest(e.clientX, e.clientY)
        if (hit) {
          const origin = tileOrigin(hit.cellX, hit.cellY, hit.project)
          selectRef.current(hit.project, origin)
        }
      }
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1
      target.x += e.deltaX * unit / lens.w * .75
      target.y += e.deltaY * unit / lens.h * .75
    }
    const lost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(frame)
      videos.forEach(video => video.pause())
      setFallback(true)
    }
    const leave = () => { hover.active = 0 }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('wheel', wheel, { passive: false })
    canvas.addEventListener('webglcontextlost', lost)

    // The field appears immediately on its project colours, then each cover drops into place.
    paintAll(0)
    setReady(true)
    frame = requestAnimationFrame(render)
    const covers = projects.map(async (project, index) => {
      try {
        const cover = await loadCover(thumbnail(project), cardWidth)
        if (disposed) return
        images[index] = cover
        paintCard(index, 0)
      } catch { /* A colour fallback keeps the card usable. */ }
    })
    // Footage waits for the stills, so it never competes with the first readable frame.
    if (!reducedMotion && !frugal) Promise.allSettled(covers).then(() => projects.forEach((project, index) => {
      if (!galleryVideo(project) || disposed) return
      const video = document.createElement('video')
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.preload = 'auto'
      video.src = galleryVideo(project)!
      videoMap.set(index, video)
      videos.push(video)
      if (!pausedRef.current && motionRef.current && !document.hidden) video.play().catch(() => { /* The photo remains visible when autoplay is unavailable. */ })
    }))

    const visibility = () => videos.forEach(video => {
      if (document.hidden || pausedRef.current || !motionRef.current) video.pause()
      else video.play().catch(() => {})
    })
    document.addEventListener('visibilitychange', visibility)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('wheel', wheel)
      canvas.removeEventListener('webglcontextlost', lost)
      videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load() })
      images.forEach(image => { if (image instanceof ImageBitmap) image.close() })
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      programs.forEach(item => gl.deleteProgram(item))
      shaders.forEach(item => gl.deleteShader(item))
      queueMicrotask(() => { if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext() })
    }
  }, [])

  return <section className={`gallery ${ready ? 'is-ready' : ''} ${hidden ? 'is-hidden' : ''}`} aria-label="Selected work" aria-hidden={hidden || undefined} inert={hidden || undefined}>
    <h2 className="sr-only">Selected work canvas</h2>
    {!fallback && <canvas ref={canvasRef} className="gallery-canvas" aria-hidden="true" />}
    {!ready && !fallback && <div className="gallery-loading" aria-label="Loading selected work"><span /></div>}
    <div className={fallback ? 'fallback-grid' : 'gallery-accessibility'}>
      {projects.map((project, index) => <button key={project.slug} type="button" className={keyboardIndex === index ? 'keyboard-project is-focused' : 'keyboard-project'} onFocus={() => { setKeyboardIndex(index); onHover(project) }} onBlur={() => setKeyboardIndex(null)} onClick={event => onSelect(project, elementOrigin(event.currentTarget))} aria-label={`View ${project.title}: ${project.subtitle}`}>
        <img src={thumbnail(project)} alt="" loading="lazy" decoding="async" /><span><strong>{project.title}</strong><small>{project.subtitle}</small></span>
      </button>)}
    </div>
  </section>
}
