import { useMemo, useRef, useState } from 'react'
import BodyMap from './BodyMap.jsx'
import { useStore, today, ageOf, calc, context, askAI, RULES } from './lib.js'

const T = today()
const TABS = [['home', '🏠', 'Início'], ['pt', '🏋️', 'Personal'], ['sc', '📷', 'Scan'], ['di', '🍽️', 'Dieta'], ['pe', '👤', 'Perfil']]

/* ---------- peças de interface ---------- */
const Card = ({ className = '', ...p }) => <div className={`bg-card border border-line rounded-card p-4 mb-3 ${className}`} {...p} />
const Mut = ({ className = '', ...p }) => <p className={`text-mut text-sm leading-relaxed ${className}`} {...p} />
const Tag = ({ on, ...p }) => <span className={`inline-block border rounded-full px-2.5 py-1 text-xs mr-1.5 mb-1.5 ${on ? 'bg-pri border-pri text-white' : 'border-line text-mut'}`} {...p} />

function Ring({ v, label = 'do dia' }) {
  const r = 64, c = 2 * Math.PI * r
  return (
    <div className="relative w-[150px] h-[150px] mx-auto shrink-0">
      <svg width="150" height="150" className="-rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#322e63" strokeWidth="14" />
        <circle cx="75" cy="75" r={r} fill="none" stroke="#ffd166" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} className="transition-all duration-700" />
      </svg>
      <b className="absolute inset-0 grid place-content-center text-center text-3xl font-extrabold leading-none">{v}%<small className="text-xs font-normal text-mut">{label}</small></b>
    </div>
  )
}

function Check({ on, children, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 py-3 border-b border-line last:border-0 cursor-pointer">
      <div className={`w-6 h-6 rounded-lg border-2 grid place-content-center text-sm text-white ${on ? 'bg-pri border-pri' : 'border-line'}`}>{on ? '✓' : ''}</div>
      <div className={on ? 'line-through text-mut' : ''}>{children}</div>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm text-mut">{label}
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  )
}

function Field({ label, ...p }) {
  return <label className="block text-sm text-mut">{label}<input className="field" {...p} /></label>
}

function Photos({ files, setFiles, max = 3, label }) {
  const cam = useRef(), gal = useRef()
  const add = (list) => setFiles((f) => [...f, ...Array.from(list)].slice(0, max))
  return (
    <div>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      <input ref={gal} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      <div className="flex gap-2">
        <button className="btn" onClick={() => cam.current.click()}>📷 Tirar foto</button>
        <button className="btn btn-g" onClick={() => gal.current.click()}>🖼️ Galeria</button>
      </div>
      <p className="text-xs text-mut mb-2">{files.length} de {max} {label}</p>
      {files.length > 0 && (
        <div className="flex gap-2 mb-3">
          {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="w-[30%] aspect-[3/4] object-cover rounded-2xl" />)}
        </div>
      )}
      {files.length > 0 && <button className="btn btn-g" onClick={() => setFiles([])}>Limpar</button>}
    </div>
  )
}

/* ---------- cadastro ---------- */
function Onboarding({ onDone }) {
  const [f, setF] = useState({ n: '', b: '', s: 'M', h: '', w: '', m: '', o: 'perder', d: 3, l: 'academia', e: 'iniciante', i: '', r: '', f: 4 })
  const [err, setErr] = useState('')
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  const go = () => {
    const p = { ...f, h: +f.h, w: +f.w, m: +f.m, d: +f.d, f: +f.f }
    if (!p.n.trim() || !p.b || !p.h || !p.w || !p.m) return setErr('Preencha nome, nascimento, altura, peso e meta.')
    if (ageOf(p.b) < 18) return setErr('O Ritmo Pro é para maiores de 18 anos. Use o Ritmo Teen.')
    if (p.h < 120 || p.h > 230 || p.w < 35 || p.w > 250 || p.m < 35 || p.m > 250) return setErr('Confira altura e peso.')
    onDone(p)
  }
  return (
    <div className="max-w-md mx-auto p-4 text-ink">
      <h1 className="text-3xl font-extrabold">Ritmo Pro</h1>
      <Mut className="mb-4">Seu personal trainer digital: treino, scan de postura e dieta sob medida. Para maiores de 18 anos.</Mut>
      <Card>
        <Field label="Nome" value={f.n} maxLength={20} onChange={(e) => set('n')(e.target.value)} />
        <Field label="Data de nascimento" type="date" value={f.b} onChange={(e) => set('b')(e.target.value)} />
        <Select label="Sexo" value={f.s} onChange={set('s')} options={[['M', 'Masculino'], ['F', 'Feminino']]} />
        <Field label="Altura (cm)" type="number" inputMode="numeric" value={f.h} onChange={(e) => set('h')(e.target.value)} />
        <Field label="Peso atual (kg)" type="number" inputMode="decimal" value={f.w} onChange={(e) => set('w')(e.target.value)} />
        <Field label="Peso meta (kg)" type="number" inputMode="decimal" value={f.m} onChange={(e) => set('m')(e.target.value)} />
        <Select label="Objetivo" value={f.o} onChange={set('o')} options={[['perder', 'Perder gordura'], ['ganhar', 'Ganhar massa'], ['manter', 'Recomposição / manter']]} />
        <Select label="Dias de treino por semana" value={f.d} onChange={set('d')} options={[2, 3, 4, 5, 6].map((n) => [n, n])} />
        <Select label="Onde treina" value={f.l} onChange={set('l')} options={[['academia', 'Academia'], ['casa', 'Em casa']]} />
        <Select label="Experiência" value={f.e} onChange={set('e')} options={[['iniciante', 'Iniciante'], ['intermediário', 'Intermediário'], ['avançado', 'Avançado']]} />
        <Field label="Lesões, dores ou condições de saúde" placeholder="Deixe vazio se não tiver" value={f.i} onChange={(e) => set('i')(e.target.value)} />
        <Field label="Alimentos que não come ou alergias" value={f.r} onChange={(e) => set('r')(e.target.value)} />
        <Select label="Refeições por dia" value={f.f} onChange={set('f')} options={[3, 4, 5, 6].map((n) => [n, n])} />
        {err && <p className="text-acc text-sm mb-2">{err}</p>}
        <button className="btn" onClick={go}>Criar meu perfil</button>
      </Card>
    </div>
  )
}

/* ---------- telas ---------- */
function Strip() {
  const wk = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  return (
    <div className="flex gap-1.5 my-3">
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
        const d = new Date(); d.setDate(d.getDate() + i)
        return <div key={i} className={`flex-1 text-center rounded-xl py-2 text-sm ${i === 0 ? 'bg-pri text-white font-semibold' : 'bg-card text-mut'}`}>{wk[d.getDay()]}<br />{d.getDate()}</div>
      })}
    </div>
  )
}

function Home({ S, setS, m, setTab }) {
  const plan = S.plan?.treinos
  const tr = plan ? plan[new Date().getDay() % plan.length] : null
  const done = S.done?.[T] || []
  const pc = tr ? Math.min(100, Math.round((done.length / tr.exercicios.length) * 100)) : 0
  const tog = (i) => setS((s) => {
    const a = [...(s.done?.[T] || [])]; const x = a.indexOf(i)
    x < 0 ? a.push(i) : a.splice(x, 1)
    return { ...s, done: { ...s.done, [T]: a } }
  })
  return (
    <>
      <h1 className="text-3xl font-extrabold">Oi, {S.p.n}!</h1>
      <Mut>Objetivo: {S.p.o} · meta {S.p.m} kg</Mut>
      <Strip />
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[[S.p.w, 'kg atual'], [m.k, 'kcal/dia'], [m.bmi, 'IMC']].map(([v, l]) => (
          <div key={l} className="bg-card border border-line rounded-3xl py-3 text-center"><b className="block text-xl">{v}</b><span className="text-xs text-mut">{l}</span></div>
        ))}
      </div>
      <Card className="flex items-center gap-3">
        <Ring v={pc} />
        <div><b>Hoje</b><Mut>{tr ? (pc === 100 ? 'Treino completo! Ótimo trabalho.' : 'Marque os exercícios do treino de hoje.') : 'Monte seu plano para começar.'}</Mut></div>
      </Card>
      {tr ? (
        <>
          <Card className="!border-0 bg-gradient-to-br from-pri to-acc"><p className="text-sm text-white/80">Treino de hoje</p><h2 className="text-lg font-bold">{tr.nome}</h2><p className="text-sm text-white/80">{tr.foco}</p></Card>
          <Card>{tr.exercicios.map((e, i) => <Check key={i} on={done.includes(i)} onClick={() => tog(i)}>{e.n} · {e.series}</Check>)}</Card>
        </>
      ) : (
        <Card className="!border-0 bg-gradient-to-br from-pri to-acc">
          <h2 className="text-lg font-bold">Seu plano ainda não existe</h2>
          <p className="text-sm text-white/80 mb-3">Escolha as partes do corpo e peça ao seu personal para montar o treino.</p>
          <button className="btn !bg-white !text-[#2a1f80] !mb-0" onClick={() => setTab('pt')}>Ir para o Personal</button>
        </Card>
      )}
    </>
  )
}

function Personal({ S, setS, ai, busy, err }) {
  const [chat, setChat] = useState([])
  const [q, setQ] = useState('')
  const toggle = (n) => setS((s) => { const f = s.focus || []; return { ...s, focus: f.includes(n) ? f.filter((x) => x !== n) : [...f, n] } })
  const genPlan = async () => {
    const x = context(S) + (S.scan ? ` Resultado do scan de postura: ${JSON.stringify(S.scan)}. Respostas do usuário às perguntas do scan: ${S.ans || 'não respondeu'}.` : '')
    const r = await ai('plan', x + RULES + ` Monte um plano de treino com exatamente ${S.p.d} treinos por semana, adequado ao local e à experiência, priorizando o objetivo. Responda só JSON: {"resumo":string,"treinos":[{"nome":string,"foco":string,"exercicios":[{"n":string,"series":string}]}],"dicas":[string]}`)
    if (r?.treinos) setS((s) => ({ ...s, plan: r }))
  }
  window.__genPlan = genPlan
  const send = async () => {
    const t = q.trim(); if (!t) return
    const hist = [...chat, { role: 'user', text: t }]
    setChat(hist); setQ('')
    const r = await ai('chat', context(S) + RULES + (S.plan ? ` Plano atual: ${JSON.stringify(S.plan)}.` : '') + ' Responda de forma curta e prática. Conversa:\n' + hist.map((m) => `${m.role === 'user' ? 'Usuário' : 'Personal'}: ${m.text}`).join('\n'), [], false)
    if (r) setChat([...hist, { role: 'assistant', text: r }])
  }
  const fc = S.focus || []
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2">Personal</h1>
      {err && <p className="text-acc text-sm">{err}</p>}
      {S.plan && (
        <Card>
          <Mut>{S.plan.resumo}</Mut>
          {S.plan.treinos.map((t) => (
            <div key={t.nome} className="mt-3"><h2 className="font-bold">{t.nome}</h2><Mut>{t.foco}</Mut>
              {t.exercicios.map((e) => <div key={e.n} className="flex justify-between py-1"><span>{e.n}</span><span className="text-mut text-sm">{e.series}</span></div>)}
            </div>
          ))}
          {S.plan.dicas?.length > 0 && <Mut className="mt-3">{S.plan.dicas.join(' · ')}</Mut>}
        </Card>
      )}
      <Card>
        <h2 className="font-bold mb-1">Quais partes você quer treinar?</h2>
        <Mut className="mb-2">Toque no corpo para marcar. Os músculos escolhidos ganham prioridade no plano.</Mut>
        <BodyMap selected={fc} onToggle={toggle} />
        <div className="mt-2">{fc.length ? fc.map((x) => <span key={x} onClick={() => toggle(x)}><Tag on>{x} ✕</Tag></span>) : <Mut>Nenhuma parte marcada ainda.</Mut>}</div>
      </Card>
      <button className="btn" disabled={!!busy} onClick={genPlan}>{busy === 'plan' ? 'Gerando… pode levar um minuto' : S.plan ? 'Refazer meu plano' : 'Montar meu plano de treino'}</button>
      <h2 className="text-lg font-bold mt-5 mb-2">Pergunte ao personal</h2>
      {chat.map((m, i) => <div key={i} className={`rounded-2xl px-3 py-2 mb-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-pri text-white ml-9' : 'bg-card mr-9'}`}>{m.text}</div>)}
      {busy === 'chat' && <Mut>Pensando…</Mut>}
      <input className="field" placeholder="Ex.: posso treinar com dor no ombro?" value={q} onChange={(e) => setQ(e.target.value)} />
      <button className="btn btn-g" disabled={!!busy} onClick={send}>Enviar</button>
    </>
  )
}

function Scan({ S, setS, ai, busy, err, goPlan }) {
  const [files, setFiles] = useState([])
  const run = async () => {
    const r = await ai('scan', context(S) + RULES + ' As imagens são fotos do corpo do usuário (frente, lado, costas) para avaliar postura e proporções. Descreva só observações visuais gerais e neutras: alinhamento de ombros, quadril e cabeça, simetria e quais grupos musculares priorizar no treino. Não estime percentual de gordura, peso nem faça diagnóstico, e não julgue estética. Faça de 3 a 5 perguntas sobre dores, lesões, cirurgias e histórico de treino. Responda só JSON: {"observacoes":[string],"prioridades":[string],"perguntas":[string]}', files)
    if (r?.observacoes) { setS((s) => ({ ...s, scan: r })); setFiles([]) }
  }
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2">Scan corporal</h1>
      <Mut className="mb-3">Envie fotos de frente, de lado e de costas, com boa luz e roupa de treino. Eu avalio postura e proporções para ajustar seu treino. Não calculo gordura corporal nem faço diagnóstico. As fotos não são guardadas.</Mut>
      {err && <p className="text-acc text-sm">{err}</p>}
      <Photos files={files} setFiles={setFiles} label="fotos. Deixe o corpo inteiro no enquadramento." />
      {files.length > 0 && <button className="btn" disabled={!!busy} onClick={run}>{busy === 'scan' ? 'Analisando…' : 'Analisar minhas fotos'}</button>}
      {S.scan && (
        <Card className="mt-3">
          <h2 className="font-bold mb-1">O que observei</h2>
          {S.scan.observacoes.map((x) => <Mut key={x}>• {x}</Mut>)}
          <h2 className="font-bold mt-3 mb-1">Prioridades no treino</h2>
          <div>{S.scan.prioridades.map((x) => <Tag key={x}>{x}</Tag>)}</div>
          <h2 className="font-bold mt-3 mb-1">Preciso saber de você</h2>
          {S.scan.perguntas.map((x) => <Mut key={x}>• {x}</Mut>)}
          <textarea rows={4} className="field mt-2" placeholder="Responda aqui as perguntas acima" value={S.ans || ''} onChange={(e) => setS((s) => ({ ...s, ans: e.target.value }))} />
          <button className="btn" onClick={goPlan}>Atualizar meu plano com isso</button>
        </Card>
      )}
    </>
  )
}

function Diet({ S, setS, m, ai, busy, err, setErr }) {
  const gen = async () => {
    if (S.p.o === 'perder' && m.bmi < 20) return setErr('Pelo seu IMC, não é indicado montar dieta de emagrecimento. Procure um nutricionista.')
    const r = await ai('diet', context(S) + RULES + ` Monte a dieta de um dia típico com comida brasileira simples e barata, ${S.p.f} refeições, respeitando as restrições e batendo perto da meta calórica. Responda só JSON: {"refeicoes":[{"nome":string,"hora":string,"itens":[string]}],"obs":[string]}`)
    if (r?.refeicoes) setS((s) => ({ ...s, diet: r }))
  }
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2">Dieta</h1>
      {err && <p className="text-acc text-sm">{err}</p>}
      <Card className="flex gap-2">
        {[[m.k, 'kcal'], [m.p + 'g', 'proteína'], [m.c + 'g', 'carbo'], [m.g + 'g', 'gordura']].map(([v, l]) => (
          <div key={l} className="flex-1 bg-bg rounded-2xl py-2 text-center"><b className="block text-lg">{v}</b><span className="text-xs text-mut">{l}</span></div>
        ))}
      </Card>
      {S.diet?.refeicoes.map((r) => (
        <Card key={r.nome}><div className="flex justify-between"><b>{r.nome}</b><span className="text-mut text-sm">{r.hora}</span></div>{r.itens.map((i) => <Mut key={i}>• {i}</Mut>)}</Card>
      ))}
      {S.diet?.obs && <Mut className="mb-2">{S.diet.obs.join(' ')}</Mut>}
      <p className="text-xs text-mut mb-2">{S.ex?.txt || S.ex?.sum ? 'Seus exames serão considerados na dieta.' : 'Dica: adicione seus exames no Perfil para uma dieta mais precisa.'}</p>
      <button className="btn" disabled={!!busy} onClick={gen}>{busy === 'diet' ? 'Gerando… pode levar um minuto' : S.diet ? 'Refazer minha dieta' : 'Montar minha dieta'}</button>
      <p className="text-xs text-mut">As metas são estimativas. Para tratamento de condição de saúde, consulte um nutricionista.</p>
    </>
  )
}

function Exams({ S, setS, ai, busy }) {
  const [files, setFiles] = useState([])
  const x = S.ex?.sum
  const run = async () => {
    const t = S.ex?.txt || ''
    if (!t && !files.length) return
    const r = await ai('ex', context(S) + RULES + ` O usuário enviou exames ou laudos (texto e/ou imagens). Extraia só o que for útil para treino e dieta: valores fora da referência, restrições e orientações dos profissionais. Não diagnostique e não substitua o médico; marque o que ele deve conversar com o profissional. Texto informado: ${t} Responda só JSON: {"resumo":string,"pontos":[string],"atencao":[string],"restricoes":[string]}`, files)
    if (r?.resumo) { setS((s) => ({ ...s, ex: { ...s.ex, sum: r } })); setFiles([]) }
  }
  return (
    <Card>
      <h2 className="font-bold mb-1">Exames e orientações médicas</h2>
      <Mut className="mb-2">Cole resultados de exames e o que o nutricionista ou médico orientou. Isso melhora sua dieta e seu treino. O texto fica só neste aparelho.</Mut>
      <textarea rows={5} className="field" placeholder="Ex.: glicemia 92, colesterol total 180, orientação: evitar excesso de sódio..." value={S.ex?.txt || ''} onChange={(e) => setS((s) => ({ ...s, ex: { ...s.ex, txt: e.target.value } }))} />
      <Photos files={files} setFiles={setFiles} label="imagens do exame." />
      <button className="btn" disabled={!!busy} onClick={run}>{busy === 'ex' ? 'Analisando…' : 'Analisar exames'}</button>
      {x && (
        <div className="mt-2">
          <h2 className="font-bold">Resumo</h2><Mut>{x.resumo}</Mut>
          {x.pontos?.map((i) => <Mut key={i}>• {i}</Mut>)}
          {x.atencao?.length > 0 && <><h2 className="font-bold mt-2">Converse com seu médico</h2>{x.atencao.map((i) => <Mut key={i}>• {i}</Mut>)}</>}
          <p className="text-xs text-mut mt-2">Isto não é diagnóstico nem substitui consulta.</p>
        </div>
      )}
    </Card>
  )
}

function Profile({ S, setS, ai, busy, reset }) {
  const rows = [['Nome', S.p.n], ['Idade', ageOf(S.p.b) + ' anos'], ['Altura', S.p.h + ' cm'], ['Peso', S.p.w + ' kg'], ['Meta', S.p.m + ' kg'], ['Treinos', `${S.p.d} dias · ${S.p.l}`], ['Lesões', S.p.i || 'nenhuma'], ['Restrições', S.p.r || 'nenhuma']]
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2">Perfil</h1>
      <Card>{rows.map(([k, v]) => <div key={k} className="flex justify-between py-1.5"><span className="text-mut">{k}</span><b>{v}</b></div>)}</Card>
      <Exams S={S} setS={setS} ai={ai} busy={busy} />
      <p className="text-xs text-mut mb-3">Seus dados ficam só neste aparelho. Este app não substitui médico, nutricionista ou educador físico.</p>
      <button className="btn btn-g" onClick={() => confirm('Apagar todos os dados do app?') && reset()}>Apagar meus dados</button>
    </>
  )
}

/* ---------- app ---------- */
export default function App() {
  const [S, setS] = useStore('ritmo-pro-v1', {})
  const [tab, setTab] = useState('home')
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const m = useMemo(() => (S.p ? calc(S.p) : null), [S.p])

  const ai = async (key, prompt, files = [], json = true) => {
    setBusy(key); setErr('')
    try { return await askAI(prompt, files, json) }
    catch { setErr('Não deu certo agora. Tente de novo.') }
    finally { setBusy('') }
  }

  if (!S.p) return <Onboarding onDone={(p) => setS({ p })} />
  const common = { S, setS, ai, busy, err }
  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      <main className="max-w-md mx-auto px-4 pt-4 pb-28">
        {tab === 'home' && <Home S={S} setS={setS} m={m} setTab={setTab} />}
        {tab === 'pt' && <Personal {...common} />}
        {tab === 'sc' && <Scan {...common} goPlan={() => { setTab('pt'); setTimeout(() => window.__genPlan?.(), 50) }} />}
        {tab === 'di' && <Diet {...common} m={m} setErr={setErr} />}
        {tab === 'pe' && <Profile {...common} reset={() => { setS({}); setTab('home') }} />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 bg-card border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex">
          {TABS.map(([k, ic, t]) => (
            <button key={k} onClick={() => { setErr(''); setTab(k) }} className={`flex-1 py-2.5 text-xs font-semibold ${tab === k ? 'text-pri' : 'text-mut'}`}>
              <span className="block text-xl">{ic}</span>{t}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
