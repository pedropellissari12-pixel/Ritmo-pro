// Mapa do corpo: toque nos músculos que você quer treinar.
const FRONT = [
  ['ombros', 'M62 48C52 48 46 56 46 68C46 72 49 74 53 72C57 66 62 60 70 56Z', 1],
  ['peito', 'M72 56C80 52 92 54 99 58L99 82C90 86 78 84 70 76C68 68 69 61 72 56Z', 1],
  ['abdômen', 'M86 88L114 88L112 128C108 134 92 134 88 128Z', 0],
  ['bíceps', 'M48 74C44 84 44 96 47 104C52 106 57 104 58 98C59 90 58 80 55 74Z', 1],
  ['antebraços', 'M44 108C41 120 40 132 40 142C44 145 49 143 51 138C54 128 55 118 55 108Z', 1],
  ['quadríceps', 'M72 138C70 160 71 184 76 200C84 204 94 202 98 196C100 176 100 156 98 138C90 134 80 134 72 138Z', 1],
  ['panturrilhas', 'M76 208C74 226 76 244 80 256C86 258 92 256 94 250C96 236 96 220 94 208C88 206 82 206 76 208Z', 1],
]
const BACK = [
  ['costas', 'M100 44C112 44 120 46 124 52C130 64 130 80 126 96C122 108 116 114 100 116C84 114 78 108 74 96C70 80 70 64 76 52C80 46 88 44 100 44Z', 0],
  ['ombros', 'M62 48C52 48 46 56 46 68C46 72 49 74 53 72C57 66 62 60 70 56Z', 1],
  ['tríceps', 'M46 74C42 86 43 98 47 108C53 110 58 106 59 98C60 88 58 78 54 74Z', 1],
  ['antebraços', 'M44 110C41 122 40 134 40 144C44 147 49 145 51 140C54 130 55 120 55 110Z', 1],
  ['glúteos', 'M72 128C70 140 74 152 86 154C94 154 99 148 99 138L99 126C90 122 78 122 72 128Z', 1],
  ['posteriores', 'M73 158C71 176 73 192 78 204C86 208 94 206 98 200C100 184 100 168 98 156C90 154 80 154 73 158Z', 1],
  ['panturrilhas', 'M76 210C72 224 75 240 82 250C88 252 94 248 95 240C97 228 96 216 93 210C88 206 82 206 76 210Z', 1],
]
const ARM = 'M44 52C38 70 36 100 36 144L54 146C56 110 60 80 66 56Z'
const LEG = 'M70 134C68 180 70 230 74 262L98 262C100 230 100 180 100 134Z'
const MIRROR = 'matrix(-1 0 0 1 200 0)'

function Silhouette() {
  return (
    <g className="fill-line">
      <ellipse cx="100" cy="24" rx="12" ry="15" />
      <rect x="94" y="36" width="12" height="12" />
      <path d="M64 50C70 44 130 44 136 50L132 100C130 120 128 130 126 136L74 136C72 130 70 120 68 100Z" />
      {[ARM, LEG].map((d) => (<g key={d}><path d={d} /><path d={d} transform={MIRROR} /></g>))}
    </g>
  )
}

function Figure({ parts, label, sel, toggle, withDefs }) {
  const Part = ({ name, d, tr }) => (
    <path d={d} transform={tr} onClick={() => toggle(name)}
      fill={sel.includes(name) ? 'url(#ms)' : 'url(#mg)'} opacity={sel.includes(name) ? 1 : 0.7}
      stroke="rgba(0,0,0,.4)" strokeWidth=".8" className="cursor-pointer" />
  )
  return (
    <svg viewBox="0 0 200 278" className="flex-1 min-w-0">
      {withDefs && (
        <defs>
          <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9b2ff" /><stop offset="1" stopColor="#6d62d6" /></linearGradient>
          <linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffa183" /><stop offset="1" stopColor="#e0502c" /></linearGradient>
        </defs>
      )}
      <Silhouette />
      {parts.map(([name, d, mir]) => (
        <g key={name + d}>
          <Part name={name} d={d} />
          {mir ? <Part name={name} d={d} tr={MIRROR} /> : null}
        </g>
      ))}
      <text x="100" y="275" textAnchor="middle" className="fill-mut text-[10px]">{label}</text>
    </svg>
  )
}

export default function BodyMap({ selected, onToggle }) {
  return (
    <div className="flex gap-1.5">
      <Figure parts={FRONT} label="Frente" sel={selected} toggle={onToggle} withDefs />
      <Figure parts={BACK} label="Costas" sel={selected} toggle={onToggle} />
    </div>
  )
}
