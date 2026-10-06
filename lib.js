import { useEffect, useState } from 'react'

export function useStore(key, init) {
  const [s, setS] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) || init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(s)) } catch {} }, [s])
  return [s, setS]
}

export const today = () => new Date().toISOString().slice(0, 10)

export function ageOf(b) {
  const n = new Date(), d = new Date(b)
  let a = n.getFullYear() - d.getFullYear()
  if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--
  return a
}

export function calc(p) {
  const a = ageOf(p.b)
  const bmr = 10 * p.w + 6.25 * p.h - 5 * a + (p.s === 'M' ? 5 : -161)
  const tdee = Math.round(bmr * (1.2 + 0.08 * p.d))
  const floor = p.s === 'M' ? 1600 : 1400
  let k = tdee
  if (p.o === 'perder') k = Math.max(floor, Math.round(tdee * 0.82))
  else if (p.o === 'ganhar') k = Math.round(tdee * 1.1)
  const pr = Math.round(p.w * (p.o === 'ganhar' ? 2 : 1.8))
  const g = Math.round((k * 0.27) / 9)
  const c = Math.max(0, Math.round((k - pr * 4 - g * 9) / 4))
  return { tdee, k, p: pr, g, c, bmi: +(p.w / (p.h / 100) ** 2).toFixed(1) }
}

export const RULES = ' Responda em português do Brasil. Você é um personal trainer e coach de nutrição esportiva, não um médico: não faça diagnóstico, não estime percentual de gordura, não prometa resultados. Se houver dor, lesão ou condição de saúde, adapte e recomende avaliação de um profissional. Nunca sugira dietas extremas, jejuns longos, purgação ou calorias abaixo da meta informada.'

export function context(S) {
  const p = S.p, m = calc(p)
  const med = (S.ex?.txt || '') + (S.ex?.sum ? ' Resumo dos exames: ' + JSON.stringify(S.ex.sum) : '')
  return `Perfil: ${p.n}, ${ageOf(p.b)} anos, sexo ${p.s}, ${p.h} cm, ${p.w} kg, meta ${p.m} kg, objetivo ${p.o}, treina ${p.d} dias/semana em ${p.l}, experiência ${p.e}. Lesões/saúde: ${p.i || 'nenhuma informada'}. Restrições alimentares: ${p.r || 'nenhuma'}. Informações médicas fornecidas pelo usuário (exames e orientações de profissionais): ${med || 'nenhuma'}. Priorize sempre as orientações dos profissionais de saúde. Partes do corpo que quer priorizar: ${S.focus?.length ? S.focus.join(', ') : 'nenhuma escolhida'}. Refeições/dia: ${p.f}. Meta calórica calculada: ${m.k} kcal (proteína ${m.p} g, carbo ${m.c} g, gordura ${m.g} g).`
}

const b64 = (f) => new Promise((res) => {
  const r = new FileReader()
  r.onload = () => res({ media_type: f.type, data: String(r.result).split(',')[1] })
  r.readAsDataURL(f)
})

// Chama o seu servidor (server/index.js). Nunca coloque a chave da API no front-end.
export async function askAI(prompt, files = [], json = true) {
  const images = await Promise.all(files.map(b64))
  const r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, images }) })
  if (!r.ok) throw new Error('ai')
  const { text } = await r.json()
  return json ? JSON.parse(text.replace(/```json|```/g, '').trim()) : text
}
