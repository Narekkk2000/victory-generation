export type IconName = 'grid' | 'document' | 'hourglass' | 'more' | 'close' | 'arrow' | 'back' | 'play' | 'pause' | 'volume' | 'mute' | 'expand' | 'down' | 'mail' | 'link' | 'motion'

export default function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <>{[3, 9, 15].flatMap(x => [3, 9, 15].map(y => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx=".6" fill="currentColor" stroke="none" />))}</>,
    document: <><path d="M6 3h8l4 4v14H6z" fill="currentColor" stroke="none" /><path d="M14 3v5h4M9 12h6M9 15h6" stroke="var(--icon-inverse, #333)" /></>,
    hourglass: <><path d="M6 3h12M6 21h12M7 3c0 5 1 6 5 9-4 3-5 4-5 9M17 3c0 5-1 6-5 9 4 3 5 4 5 9" /><path d="m8 19 4-5 4 5zM8 5l4 5 4-5z" fill="currentColor" stroke="none" /></>,
    more: <>{[4, 12, 20].map(x => <circle key={x} cx={x} cy="12" r="1.8" fill="currentColor" stroke="none" />)}</>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M6 18 18 6M6 6h12v12" />,
    back: <path d="m14 5-7 7 7 7" />,
    down: <path d="M12 4v16m-5-5 5 5 5-5" />,
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="3.5" /></>,
    volume: <><path d="m11 4-6 5H2v6h3l6 5zM15 8c3 2 3 6 0 8M18 4c6 4 6 12 0 16" /></>,
    mute: <><path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6" /></>,
    expand: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    link: <><path d="m10 13 4-4m-7 6-1 1a4 4 0 0 0 6 6l3-3a4 4 0 0 0 0-6M9 9a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1 1" transform="translate(1 1) scale(.9)" /></>,
    motion: <><path d="M3 8h5M1 12h5M3 16h5" /><circle cx="15" cy="12" r="6" /><path d="m14 9 4 3-4 3z" fill="currentColor" stroke="none" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
