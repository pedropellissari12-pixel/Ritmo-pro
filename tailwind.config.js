export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { bg: '#14122b', card: '#1f1c42', ink: '#f2f0ff', mut: '#a9a4d6', pri: '#8b7bff', acc: '#ff7a59', sun: '#ffd166', line: '#322e63' },
    fontFamily: { sans: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'] },
    borderRadius: { card: '24px' }
  } },
  plugins: []
}
