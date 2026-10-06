// Servidor mínimo que guarda a chave da API. Rode: ANTHROPIC_API_KEY=... npm run server
import express from 'express'
const app = express()
app.use(express.json({ limit: '25mb' }))

app.post('/api/ai', async (req, res) => {
  try {
    const { prompt, images = [] } = req.body
    const content = [
      ...images.map((i) => ({ type: 'image', source: { type: 'base64', media_type: i.media_type, data: i.data } })),
      { type: 'text', text: prompt },
    ]
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 2000, messages: [{ role: 'user', content }] }),
    })
    const d = await r.json()
    res.json({ text: (d.content || []).map((b) => b.text || '').join('') })
  } catch (e) {
    res.status(500).json({ error: 'falha' })
  }
})
app.listen(8787, () => console.log('API em http://localhost:8787'))
