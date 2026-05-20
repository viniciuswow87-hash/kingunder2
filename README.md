# 👑 King Under · Copa do Mundo 2026

Dashboard de probabilidades **under** para jogos ao vivo da Copa do Mundo 2026.

## 📁 Estrutura

```
king-under-copa/
├── index.html        ← Página principal
├── src/
│   ├── style.css     ← Estilos visuais
│   ├── agent.js      ← Lógica do agente (scan + alertas)
│   └── data.js       ← Bandeiras, times e dados demo
└── README.md
```

## 🚀 Como usar

### Opção 1 — Abrir localmente
Baixe o repositório e abra o `index.html` diretamente no Chrome/Edge.

### Opção 2 — Hospedar no GitHub Pages (grátis, online 24h)
1. Faça upload dos arquivos no GitHub
2. Vá em **Settings → Pages**
3. Em **Source** selecione `main` e pasta `/root`
4. Clique **Save** — o site fica disponível em:
   `https://SEU_USUARIO.github.io/king-under-copa`

## 🔑 API Key

Crie sua chave gratuita em **football-data.org** e cole no campo API KEY do dashboard.

## ⚙️ Configurações

| Campo | Padrão | Descrição |
|-------|--------|-----------|
| Gols mín | 2 | Mínimo de gols no 1º tempo |
| Até min | 35 | Minuto máximo do 1º tempo |
| Score mín | 60 | Under Score mínimo para destacar |

## 📊 Under Score

O Under Score é calculado com base em:
- Total de gols marcados
- Minuto atual do jogo
- Taxa de gols por minuto
- Diferença no placar

**Alta (verde):** ≥ 75% · **Média (dourado):** 55–74% · **Baixa (cinza):** < 55%
