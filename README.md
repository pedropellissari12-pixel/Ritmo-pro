# Ritmo Pro (React + Tailwind)

## Rodar
```bash
npm install
# terminal 1 – API (guarda a chave, nunca no front-end)
ANTHROPIC_API_KEY=sua_chave npm run server
# terminal 2 – app
npm run dev
```

## Estrutura
- `src/App.jsx` – telas: cadastro, Início, Personal, Scan, Dieta, Perfil (com exames)
- `src/BodyMap.jsx` – corpo para escolher os músculos (frente e costas)
- `src/lib.js` – cálculo de calorias/macros, regras de segurança, chamada à IA
- `server/index.js` – servidor que fala com a API do Claude (fotos e texto)
- `tailwind.config.js` – cores e fonte do Ritmo

## Antes de publicar
- Adicione termos de uso e política de privacidade (dados de saúde e fotos).
- O Ritmo Pro é só para maiores de 18 anos; menores usam o Ritmo Teen.
- Coloque limite de uso e autenticação no servidor antes de abrir ao público.
