import { useMemo, useState } from 'react'
import BodyMap from './BodyMap.jsx'
import { useStore, today, calc, context, askAI, RULES } from './lib.js'

const T = today()

export default function App() {
  const [S, setS] = useStore('ritmo_v1', {
    p: { n: 'Atleta', b: '2000-01-01', s: 'M', h: 175, w: 80, m: 70, o: 'perder', d: 4, l: 'academia', e: 'intermediário', f: 4, i: '', r: '' },
    focus: ['peito', 'ombros'],
    logs: {},
    ex: null
  })

  const [tab, setTab] = useState('di') // Inicializa na aba Dieta / 360
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState([])
  const [msg, setMsg] = useState('')

  const m = useMemo(() => calc(S.p), [S.p])
  const day = S.logs[T] || { agua: 0, ex: [], check: {} }

  const toggleFocus = (name) => {
    setS((old) => {
      const f = old.focus || []
      const next = f.includes(name) ? f.filter((x) => x !== name) : [...f, name]
      return { ...old, focus: next }
    })
  }

  return (
    <div className="min-h-screen bg-[#050705] text-white pb-32 font-sans selection:bg-[#00ff66]">
      
      {/* Top Header - Estilo Grid 360 */}
      <header className="px-5 py-4 bg-[#050705]/90 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center border-b border-[#14381b]">
        <h1 className="text-2xl font-extrabold text-[#00ff66] tracking-tight">
          {tab === 'di' ? 'Dieta' : tab === 'tr' ? 'Treino' : tab === 'pt' ? 'Personal' : 'Perfil'}
        </h1>
        <div className="flex items-center gap-2">
          <div className="bg-[#0b120c] border border-[#14381b] px-3 py-1 rounded-full text-xs font-bold text-[#00ff66] flex items-center gap-1.5">
            <span>🛡️</span> 0 pts
          </div>
          <div className="w-8 h-8 rounded-full bg-[#14381b] border border-[#00ff66] flex items-center justify-center text-xs font-bold">
            👤
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 max-w-md mx-auto space-y-4">

        {/* Seleção de Dias estilo Grid 360 */}
        <div className="flex justify-between items-center bg-[#0b120c] p-1.5 rounded-2xl border border-[#14381b] text-center text-xs font-bold">
          {[
            { d: '3', w: 'sáb' },
            { d: '4', w: 'dom' },
            { d: '5', w: 'seg' },
            { d: '6', w: 'ter', active: true },
            { d: '7', w: 'qua' },
            { d: '8', w: 'qui' },
            { d: '9', w: 'sex' }
          ].map((item, i) => (
            <div key={i} className={`p-2 rounded-xl transition-all ${item.active ? 'bg-[#00ff66] text-black font-black neon-glow' : 'text-zinc-500'}`}>
              <div className="text-sm">{item.d}</div>
              <div className="text-[9px] uppercase">{item.w}</div>
            </div>
          ))}
        </div>

        {/* Tab Selector: Plano / Meus Planos */}
        <div className="grid grid-cols-2 gap-2 bg-[#0b120c] p-1 rounded-full border border-[#14381b]">
          <button className="py-2.5 rounded-full bg-[#14381b] text-[#00ff66] font-bold text-xs border border-[#00ff66]/30">Plano</button>
          <button className="py-2.5 rounded-full text-zinc-400 font-bold text-xs">Meus Planos</button>
        </div>

        {/* Card Principal: Anel de Progresso Nutricional (Meta) */}
        <div className="bg-[#0b120c] border border-[#14381b] rounded-3xl p-5 relative overflow-hidden text-center">
          <div className="flex justify-between items-center my-2">
            <div className="text-left">
              <span className="text-xl font-extrabold text-[#00ff66] block">{S.p.w} kg</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Peso atual</span>
            </div>

            {/* Anel Central */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#14381b]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#00ff66] border-t-transparent -rotate-45 neon-glow"></div>
              <div>
                <span className="text-lg font-black block text-white">0%</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase block">DA META</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold text-[#00ff66] block">0kg</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Perdeu ↓</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#14381b]/50">
            <span className="bg-[#14381b]/60 text-emerald-300 border border-[#00ff66]/20 px-4 py-1.5 rounded-full text-xs font-bold inline-block">
              Meta: <strong className="text-white">{S.p.m} kg</strong> • Continue firme
            </span>
          </div>
        </div>

        {/* Seção Nutrientes do Dia */}
        <div className="bg-[#0b120c] border border-[#14381b] rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Nutrientes do dia</h2>
            <button className="text-xs text-[#00ff66] bg-[#14381b]/50 px-3 py-1 rounded-full border border-[#00ff66]/20 font-bold">Ocultar</button>
          </div>

          <div className="space-y-3">
            {/* Caloria */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5"><span className="text-orange-500">🔥</span> Calorias</span>
                <span className="text-zinc-400">0 / {m.k} kcal</span>
                <span className="text-[#00ff66]">0%</span>
              </div>
              <div className="w-full bg-[#14381b] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00ff66] h-full w-[5%] neon-glow"></div>
              </div>
            </div>

            {/* Proteína */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5"><span className="text-rose-500">🐟</span> Proteína</span>
                <span className="text-zinc-400">0 / {m.p}g</span>
                <span className="text-[#00ff66]">0%</span>
              </div>
              <div className="w-full bg-[#14381b] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00ff66] h-full w-[5%] neon-glow"></div>
              </div>
            </div>

            {/* Carbo */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5"><span className="text-amber-500">🍞</span> Carbo</span>
                <span className="text-zinc-400">0 / {m.c}g</span>
                <span className="text-[#00ff66]">0%</span>
              </div>
              <div className="w-full bg-[#14381b] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00ff66] h-full w-[5%] neon-glow"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Refeições em Timeline Lateral */}
        <div className="relative pl-6 space-y-4 border-l-2 border-[#14381b] ml-3">
          
          {/* Card Cafe da manha */}
          <div className="bg-[#0b120c] border border-[#14381b] rounded-3xl p-5 relative">
            <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-[#050705] border-2 border-[#00ff66]"></div>
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#14381b] rounded-xl text-sm">☕</span>
                <div>
                  <h3 className="font-bold text-base text-white">Café da manhã</h3>
                  <span className="text-[10px] text-zinc-400 font-bold">🕒 06:30</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#14381b] text-[#00ff66] px-2.5 py-1 rounded-full border border-[#00ff66]/30">+30 pts</span>
            </div>

            <p className="text-xs text-zinc-400 font-medium my-3">
              826 kcal • P 42,9g • C 133,2g • G 19,5g
            </p>

            <button className="w-full py-3 bg-[#00ff66] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider neon-glow">
              ✓ FAZER CHECK-IN
            </button>
          </div>

          {/* Card Almoco */}
          <div className="bg-[#0b120c] border border-[#14381b] rounded-3xl p-5 relative">
            <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-[#050705] border-2 border-zinc-700"></div>
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#14381b] rounded-xl text-sm">🥗</span>
                <div>
                  <h3 className="font-bold text-base text-white">Almoço</h3>
                  <span className="text-[10px] text-zinc-400 font-bold">🕒 12:30</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#14381b] text-[#00ff66] px-2.5 py-1 rounded-full border border-[#00ff66]/30">+30 pts</span>
            </div>

            <button className="w-full py-3 bg-[#14381b] text-[#00ff66] font-extrabold rounded-2xl text-xs uppercase tracking-wider border border-[#00ff66]/30 mt-2">
              ✓ FAZER CHECK-IN
            </button>
          </div>

        </div>

      </main>

      {/* Dock Inferior Estilo Grid 360 */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md bg-[#0b120c]/95 backdrop-blur-xl border border-[#14381b] rounded-3xl p-2 z-40 shadow-2xl">
        <div className="grid grid-cols-5 items-center text-center relative">
          
          <button onClick={() => setTab('home')} className={`py-2 rounded-2xl flex flex-col items-center ${tab === 'home' ? 'text-[#00ff66]' : 'text-zinc-500'}`}>
            <span className="text-lg">🏠</span>
          </button>

          <button onClick={() => setTab('tr')} className={`py-2 rounded-2xl flex flex-col items-center ${tab === 'tr' ? 'text-[#00ff66]' : 'text-zinc-500'}`}>
            <span className="text-lg">🏋️</span>
          </button>

          {/* Botão de Adicionar Central Flutuante Neon */}
          <div className="relative -top-5 flex justify-center">
            <button onClick={() => alert('Adicionar refeição/treino')} className="w-13 h-13 bg-[#00ff66] text-black rounded-full border-4 border-[#050705] text-2xl font-black flex items-center justify-center neon-glow">
              +
            </button>
          </div>

          <button onClick={() => setTab('di')} className={`py-2 rounded-2xl flex flex-col items-center ${tab === 'di' ? 'text-[#00ff66]' : 'text-zinc-500'}`}>
            <span className="text-lg">🥗</span>
          </button>

          <button onClick={() => setTab('pe')} className={`py-2 rounded-2xl flex flex-col items-center ${tab === 'pe' ? 'text-[#00ff66]' : 'text-zinc-500'}`}>
            <span className="text-lg">👤</span>
          </button>

        </div>
      </nav>

    </div>
  )
}
