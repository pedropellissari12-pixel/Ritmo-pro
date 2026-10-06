import { useMemo, useState } from 'react'
import BodyMap from './BodyMap.jsx'
import { useStore, today, calc, context, askAI, RULES } from './lib.js'

const T = today()
const TABS = [
  ['home', '⚡', 'Início'],
  ['pt', '🏋️', 'Personal'],
  ['sc', '📷', 'Scan'],
  ['di', '🥗', 'Dieta'],
  ['pe', '👤', 'Perfil']
]

export default function App() {
  const [S, setS] = useStore('ritmo_v1', {
    p: { n: 'Atleta', b: '2000-01-01', s: 'M', h: 175, w: 70, m: 75, o: 'ganhar', d: 4, l: 'academia', e: 'intermediário', f: 4, i: '', r: '' },
    focus: ['peito', 'ombros'],
    logs: {},
    ex: null
  })

  const [tab, setTab] = useState('home')
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState([])
  const [msg, setMsg] = useState('')

  const m = useMemo(() => calc(S.p), [S.p])
  const day = S.logs[T] || { agua: 0, ex: [], check: {} }

  const setDay = (fn) => {
    setS((old) => {
      const cur = old.logs[T] || { agua: 0, ex: [], check: {} }
      return { ...old, logs: { ...old.logs, [T]: fn(cur) } }
    })
  }

  const toggleFocus = (name) => {
    setS((old) => {
      const f = old.focus || []
      const next = f.includes(name) ? f.filter((x) => x !== name) : [...f, name]
      return { ...old, focus: next }
    })
  }

  const sendPT = async () => {
    if (!msg) return
    const userM = { role: 'user', text: msg }
    setChat((c) => [...c, userM])
    setLoading(true)
    try {
      const prompt = `${RULES}\n\n${context(S)}\n\nHistórico:\n${chat.map((c) => `${c.role}:${c.text}`).join('\n')}\n\nUsuário: ${msg}`
      const text = await askAI(prompt, [], false)
      setChat((c) => [...c, { role: 'assistant', text }])
      setMsg('')
    } catch {
      setChat((c) => [...c, { role: 'assistant', text: 'Tente novamente.' }])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#14122b] text-[#f2f0ff] font-sans pb-28">
      {/* Header */}
      <header className="p-4 bg-[#1f1c42] border-b border-[#322e63] flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-[#8b7bff] tracking-tight">Ritmo Pro</h1>
          <p className="text-xs text-[#a9a4d6]">{S.p.n} • Meta: {S.p.m} kg</p>
        </div>
        <span className="text-xs bg-[#14122b] text-[#ffd166] px-3 py-1 rounded-full border border-[#322e63] font-semibold">
          {m.k} kcal/dia
        </span>
      </header>

      {/* Main Container */}
      <main className="p-4 max-w-md mx-auto space-y-4">
        {tab === 'home' && (
          <>
            <div className="bg-[#1f1c42] p-5 rounded-[24px] border border-[#322e63]">
              <h2 className="font-bold text-lg text-white mb-2">Resumo de Hoje</h2>
              <div className="grid grid-cols-3 gap-2 text-center my-3">
                <div className="bg-[#14122b] p-3 rounded-2xl border border-[#322e63]">
                  <p className="text-[10px] text-[#a9a4d6]">PROTEÍNA</p>
                  <p className="font-bold text-[#8b7bff] text-sm">{m.p}g</p>
                </div>
                <div className="bg-[#14122b] p-3 rounded-2xl border border-[#322e63]">
                  <p className="text-[10px] text-[#a9a4d6]">CARBO</p>
                  <p className="font-bold text-[#ffd166] text-sm">{m.c}g</p>
                </div>
                <div className="bg-[#14122b] p-3 rounded-2xl border border-[#322e63]">
                  <p className="text-[10px] text-[#a9a4d6]">GORDURA</p>
                  <p className="font-bold text-[#ff7a59] text-sm">{m.g}g</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#322e63]">
                <span className="text-xs text-[#a9a4d6]">Água consumida:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDay((d) => ({ ...d, agua: Math.max(0, (d.agua || 0) - 250) }))} className="px-2 py-1 bg-[#14122b] border border-[#322e63] rounded-lg text-xs">-</button>
                  <span className="font-bold text-sm text-[#8b7bff]">{day.agua || 0} ml</span>
                  <button onClick={() => setDay((d) => ({ ...d, agua: (d.agua || 0) + 250 }))} className="px-2 py-1 bg-[#8b7bff] text-white rounded-lg text-xs font-bold">+</button>
                </div>
              </div>
            </div>

            {/* Músculos Prioritários com BodyMap */}
            <div className="bg-[#1f1c42] p-5 rounded-[24px] border border-[#322e63]">
              <h2 className="font-bold text-lg text-white mb-1">Músculos Prioritários</h2>
              <p className="text-xs text-[#a9a4d6] mb-3">Toque no corpo para selecionar os focos:</p>
              <div className="bg-[#14122b] p-3 rounded-2xl border border-[#322e63] flex justify-center">
                <BodyMap selected={S.focus || []} onToggle={toggleFocus} />
              </div>
            </div>
          </>
        )}

        {tab === 'pt' && (
          <div className="bg-[#1f1c42] p-5 rounded-[24px] border border-[#322e63] space-y-3">
            <h2 className="font-bold text-lg">Personal Trainer IA</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto p-2 bg-[#14122b] rounded-2xl border border-[#322e63]">
              {chat.length === 0 && <p className="text-xs text-[#a9a4d6] text-center py-4">Pergunte sobre seus treinos ou peça ajustes.</p>}
              {chat.map((c, i) => (
                <div key={i} className={`p-3 rounded-xl text-xs ${c.role === 'user' ? 'bg-[#8b7bff] text-white ml-auto max-w-[80%]' : 'bg-[#1f1c42] text-[#f2f0ff] border border-[#322e63] mr-auto max-w-[85%]'}`}>
                  {c.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Digite sua dúvida..." className="flex-1 p-3 bg-[#14122b] border border-[#322e63] rounded-xl text-xs text-white" />
              <button onClick={sendPT} disabled={loading} className="px-4 bg-[#8b7bff] text-white font-bold rounded-xl text-xs">{loading ? '...' : 'Enviar'}</button>
            </div>
          </div>
        )}

        {tab === 'sc' && (
          <div className="bg-[#1f1c42] p-5 rounded-[24px] border border-[#322e63] text-center space-y-3">
            <h2 className="font-bold text-lg">Scan de Alimentos e Exames</h2>
            <p className="text-xs text-[#a9a4d6]">Envie fotos de pratos de comida ou resultados de exames de sangue para análise rápida.</p>
            <button onClick={() => alert('Selecione a câmera para enviar.')} className="w-full py-3 bg-[#8b7bff] text-white font-bold rounded-xl text-sm">
              📷 Enviar Imagem / Documento
            </button>
          </div>
        )}

        {tab === 'di' && (
          <div className="bg-[#1f1c42] p-5 rounded-[24px] border border-[#322e63] space-y-3">
            <h2 className="font-bold text-lg">Plano de Dieta</h2>
            <p className="text-xs text-[#a9a4d6]">Meta: {m.k} kcal por dia distribuídas em {S.p.f} refeições.</p>
            <button onClick={() => alert('Gerando sugestão de cardápio...')} className="w-full py-3 bg-[#8b7bff] text-white font-bold rounded-xl text-sm">
              🥗 Gerar Cardápio Sugerido
            </button>
          </div>
        )}

        {tab === 'pe' && (
          <div className="bg-[#1f1c42] p-5 rounded-[24px] border border-[#322e63] space-y-3">
            <h2 className="font-bold text-lg">Seu Perfil</h2>
            <div className="space-y-2 text-xs">
              <p><span className="text-[#a9a4d6]">Nome:</span> {S.p.n}</p>
              <p><span className="text-[#a9a4d6]">Peso Atual:</span> {S.p.w} kg</p>
              <p><span className="text-[#a9a4d6]">Altura:</span> {S.p.h} cm</p>
              <p><span className="text-[#a9a4d6]">Objetivo:</span> {S.p.o}</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1f1c42] border-t border-[#322e63] p-2 z-30">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center">
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`py-2 rounded-xl transition-all ${tab === id ? 'text-[#8b7bff] font-bold bg-[#14122b]' : 'text-[#a9a4d6]'}`}>
              <span className="text-base block">{icon}</span>
              <span className="text-[10px] block mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
                                                              }
