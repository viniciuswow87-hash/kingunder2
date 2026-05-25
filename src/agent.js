/* ══════════════════════════════
   KING UNDER · agent.js
   Fonte: API-Football v3
══════════════════════════════ */

/* ── ALERTA SONORO ── */
let audioCtx    = null;
let soundEnabled = true;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playAlertSound() {
  if (!soundEnabled) return;
  try {
    const ctx   = getAudioCtx();
    const notes = [
      { freq: 880,  start: 0,    dur: 0.12 },
      { freq: 1100, start: 0.16, dur: 0.12 },
      { freq: 1320, start: 0.32, dur: 0.22 },
    ];
    notes.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
  } catch (e) { console.warn('Erro no som:', e); }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('btnSound');
  if (btn) {
    btn.textContent      = soundEnabled ? '🔔 Som ON' : '🔕 Som OFF';
    btn.style.color      = soundEnabled ? 'var(--green)' : 'var(--muted)';
    btn.style.borderColor= soundEnabled ? 'rgba(0,230,118,0.4)' : 'var(--border)';
  }
}

/* ── STATE ── */
let running      = false;
let scanTimer    = null;
let countTimer   = null;
let scanCount    = 0;
let gamesCount   = 0;
let alertCount   = 0;
let nextScanAt   = 0;
const INTERVAL   = 60;
const alertedSet = new Set();

/* ── LIGAS DA BETFAIR ── */
const BETFAIR_LEAGUES = [
  // Inglaterra
  'premier league',
  'championship',
  'league one',
  'league two',
  'fa cup',
  'efl cup',
  // Espanha
  'la liga',
  'segunda division',
  'copa del rey',
  // Alemanha
  'bundesliga',
  '2. bundesliga',
  'dfb pokal',
  // Itália
  'serie a',
  'serie b',
  'coppa italia',
  // França
  'ligue 1',
  'ligue 2',
  'coupe de france',
  // Portugal
  'primeira liga',
  'liga portugal',
  // Holanda
  'eredivisie',
  'eerste divisie',
  // Bélgica
  'pro league',
  'first division a',
  // Europa
  'uefa champions league',
  'champions league',
  'uefa europa league',
  'europa league',
  'uefa europa conference league',
  'conference league',
  // Brasil
  'brasileiro serie a',
  'brasileiro serie b',
  'brasileirao',
  'campeonato brasileiro',
  'copa do brasil',
  // Argentina
  'liga profesional',
  'primera division',
  'copa de la liga',
  // EUA
  'mls',
  'major league soccer',
  // Turquia
  'super lig',
  // Arábia Saudita
  'saudi professional league',
  'saudi pro league',
  // Escócia
  'premiership',
  'scottish premiership',
  // Grécia
  'super league',
  // Rússia
  'premier league russia',
  // Copa do Mundo / Eurocopa
  'fifa world cup',
  'world cup',
  'uefa euro',
  'european championship',
  'copa america',
  'africa cup of nations',
];

function isBetfairLeague(leagueName) {
  if (!leagueName) return false;
  const name = leagueName.toLowerCase();
  return BETFAIR_LEAGUES.some(l => name.includes(l));
}

/* ── LOG ── */
function log(msg, type = 'info') {
  const area = document.getElementById('logBody');
  const now  = new Date().toLocaleTimeString('pt-BR');
  const div  = document.createElement('div');
  div.className = 'log-line';
  div.innerHTML = `<span class="log-time">${now}</span><span class="log-msg ${type}">${msg}</span>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  while (area.children.length > 300) area.removeChild(area.firstChild);
}

function clearLog() {
  document.getElementById('logBody').innerHTML =
    '<div class="log-line"><span class="log-time">--:--:--</span><span class="log-msg system">Log limpo.</span></div>';
}

/* ── CONTROLS ── */
function startAgent() {
  running = true;
  document.getElementById('btnStart').disabled = true;
  document.getElementById('btnStop').disabled  = false;
  document.getElementById('progressWrap').style.display = 'block';
  log('👑 King Under iniciado!', 'success');
  log(`🎯 Critério: ≥${cfg('minGoals')} gols até o ${cfg('maxMinute')}'`, 'info');
  runScan();
  scanTimer = setInterval(runScan, INTERVAL * 1000);
  startCountdown();
}

function stopAgent() {
  running = false;
  clearInterval(scanTimer);
  clearInterval(countTimer);
  document.getElementById('btnStart').disabled = false;
  document.getElementById('btnStop').disabled  = true;
  document.getElementById('progressWrap').style.display = 'none';
  document.getElementById('nextScanBadge').textContent  = '⏱ Parado';
  log('■ Agente parado.', 'warn');
}

function startCountdown() {
  clearInterval(countTimer);
  nextScanAt = Date.now() + INTERVAL * 1000;
  countTimer = setInterval(() => {
    const rem = Math.max(0, Math.ceil((nextScanAt - Date.now()) / 1000));
    document.getElementById('nextScanBadge').textContent = `⏱ Próxima em ${rem}s`;
    if (rem === 0) nextScanAt = Date.now() + INTERVAL * 1000;
  }, 500);
}

function cfg(id) {
  return parseInt(document.getElementById(id).value) || 0;
}

/* ── PROGRESS ── */
function animateProgress() {
  const fill  = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  const pct   = document.getElementById('progressPct');
  const steps = [
    [10, 'Conectando à API-Football...'],
    [30, 'Buscando jogos ao vivo...'],
    [55, 'Calculando probabilidades...'],
    [80, 'Aplicando filtros...'],
    [100,'Concluído ✓'],
  ];
  let i = 0;
  const t = setInterval(() => {
    if (i >= steps.length) { clearInterval(t); return; }
    fill.style.width  = steps[i][0] + '%';
    label.textContent = steps[i][1];
    pct.textContent   = steps[i][0] + '%';
    i++;
  }, 220);
}

/* ── FETCH API-FOOTBALL v3 ── */
async function fetchLiveGames() {
  const key = document.getElementById('apiKey').value.trim();
  if (!key) { log('⚠ Insira sua API Key', 'warn'); return generateDemoGames(); }

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': key }
    });

    if (res.status === 401 || res.status === 403) {
      log('❌ API Key inválida ou suspensa — usando demo', 'warn');
      return generateDemoGames();
    }
    if (res.status === 429) {
      log('⚠ Limite de requisições atingido — usando demo', 'warn');
      return generateDemoGames();
    }
    if (!res.ok) {
      log(`⚠ Erro ${res.status} — usando demo`, 'warn');
      return generateDemoGames();
    }

    const data = await res.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      log(`❌ Erro API: ${JSON.stringify(data.errors)} — usando demo`, 'warn');
      return generateDemoGames();
    }

    const matches = data.response || [];

    if (matches.length === 0) {
      log('📋 Nenhum jogo ao vivo agora — exibindo demo', 'system');
      return generateDemoGames();
    }

    log(`✅ API-Football: ${matches.length} jogos ao vivo encontrados`, 'success');

    const all = matches.map(f => ({
      id:        f.fixture.id.toString(),
      home:      f.teams.home.name,
      homeFull:  f.teams.home.name,
      homeFlag:  getFlag(f.league.country),
      away:      f.teams.away.name,
      awayFull:  f.teams.away.name,
      awayFlag:  getFlag(f.league.country),
      league:    f.league.name,
      country:   f.league.country,
      minute:    f.fixture.status.elapsed || 0,
      homeGoals: f.goals.home || 0,
      awayGoals: f.goals.away || 0,
      isDemo:    false,
    }));

    const filtered = all.filter(g => isBetfairLeague(g.league));
    log(`🎯 Betfair: ${filtered.length} jogos em ligas disponíveis (de ${all.length} totais)`, 'info');
    return filtered;

  } catch (err) {
    log(`❌ Erro de rede: ${err.message} — usando demo`, 'warn');
    return generateDemoGames();
  }
}

/* ── UNDER SCORE ── */
function calcUnderScore(game, total) {
  let score = 0;
  if (total === 2)      score += 35;
  else if (total === 3) score += 22;
  else                  score += 10;

  if (game.minute <= 15)      score += 22;
  else if (game.minute <= 25) score += 16;
  else if (game.minute <= 35) score += 10;
  else                        score += 5;

  const rate = game.minute > 0 ? total / game.minute : 0.1;
  if (rate <= 0.06)      score += 22;
  else if (rate <= 0.09) score += 14;
  else                   score += 5;

  const diff = Math.abs(game.homeGoals - game.awayGoals);
  if (diff === 0)      score += 10;
  else if (diff === 1) score += 6;

  return Math.min(99, Math.round(score));
}

/* ── RENDER CARD ── */
function renderCard(game, underScore, isAlert) {
  const total    = game.homeGoals + game.awayGoals;
  const tier     = underScore >= 75 ? 'high' : underScore >= 55 ? 'mid' : 'low';
  const market   = total === 2 ? 'Under 3.5 / Under 4.5' : total === 3 ? 'Under 4.5' : 'Under 5.5';
  const demoTag  = game.isDemo ? '<span class="demo-tag">[DEMO]</span>' : '';
  const levelTxt = underScore >= 75 ? '🔥 ALTA' : underScore >= 55 ? '⚡ MÉDIA' : '📊 BAIXA';

  return `
  <div class="game-card ${isAlert ? 'alert-card' : ''}">
    <div class="card-league">
      <span class="league-name">🏆 ${game.league} ${demoTag}</span>
      <span class="minute-badge">⏱ ${game.minute}'</span>
    </div>
    <div class="card-body">
      <div class="teams-row">
        <div class="team">
          <span class="team-flag">${game.homeFlag || '🏳️'}</span>
          <div class="team-name">${game.home}</div>
        </div>
        <div class="score-center">
          <div class="score-box">
            <span class="score-num">${game.homeGoals}</span>
            <span class="score-sep">×</span>
            <span class="score-num">${game.awayGoals}</span>
          </div>
          <div class="halftime-label">AO VIVO</div>
        </div>
        <div class="team">
          <span class="team-flag">${game.awayFlag || '🏳️'}</span>
          <div class="team-name">${game.away}</div>
        </div>
      </div>
      <div class="under-section">
        <div class="under-header">
          <span class="under-label">Prob. Under</span>
          <span class="under-pct ${tier}">${underScore}%</span>
        </div>
        <div class="meter-bar">
          <div class="meter-fill ${tier}" style="width:${underScore}%"></div>
        </div>
        <div class="under-details">
          <span>Gols: ${total} | Diff: ${Math.abs(game.homeGoals - game.awayGoals)}</span>
          <span>${levelTxt}</span>
        </div>
        ${isAlert ? `<div class="market-tag">💡 ${market}</div>` : ''}
      </div>
    </div>
  </div>`;
}

/* ── MAIN SCAN ── */
async function runScan() {
  if (!running) return;
  scanCount++;
  document.getElementById('statScans').textContent = scanCount;
  log(`🔍 Varredura #${scanCount}...`, 'info');
  animateProgress();

  const games = await fetchLiveGames();
  gamesCount += games.length;
  document.getElementById('statGames').textContent  = gamesCount;
  document.getElementById('liveCount').textContent  = games.length;
  document.getElementById('lastUpdate').textContent =
    `Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`;

  const minGoals  = cfg('minGoals');
  const maxMinute = cfg('maxMinute');
  const minScore  = cfg('minScore');

  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = '';

  const alertGames   = [];
  const regularGames = [];
  const scoreList    = [];

  for (const game of games) {
    const total      = game.homeGoals + game.awayGoals;
    const underScore = calcUnderScore(game, total);
    scoreList.push(underScore);

    const isAlert = (
      game.minute >= 10 &&
      game.minute <= maxMinute &&
      total >= minGoals &&
      Math.abs(game.homeGoals - game.awayGoals) <= 1 &&
      underScore >= minScore
    );

    if (isAlert) alertGames.push({ game, underScore });
    else         regularGames.push({ game, underScore });
  }

  for (const { game, underScore } of alertGames) {
    grid.innerHTML += renderCard(game, underScore, true);
    const key = `${game.id}-${game.homeGoals + game.awayGoals}`;
    if (!alertedSet.has(key)) {
      alertedSet.add(key);
      alertCount++;
      document.getElementById('statAlerts').textContent = alertCount;
      log(`🚨 ALERTA: ${game.home} ${game.homeGoals}×${game.awayGoals} ${game.away} — ${game.minute}' — Score: ${underScore}%`, 'alert');
      playAlertSound();
    }
  }

  for (const { game, underScore } of regularGames) {
    grid.innerHTML += renderCard(game, underScore, false);
  }

  if (games.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏆</div>
        <div class="empty-title">Nenhum jogo ao vivo agora</div>
        <div class="empty-sub">Aguarde o início das partidas...</div>
      </div>`;
  }

  if (scoreList.length) {
    const avg = Math.round(scoreList.reduce((a, b) => a + b, 0) / scoreList.length);
    document.getElementById('statAvgScore').textContent = avg + '%';
  }

  log(`✅ Varredura #${scanCount} concluída | ${alertGames.length} alertas`, 'success');
}
