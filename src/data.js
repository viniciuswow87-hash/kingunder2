/* ══════════════════════════════
   KING UNDER · data.js
   Bandeiras, times e dados demo
══════════════════════════════ */

const FLAGS = {
  'Brazil':'🇧🇷','Argentina':'🇦🇷','France':'🇫🇷','Germany':'🇩🇪','Spain':'🇪🇸',
  'Portugal':'🇵🇹','Italy':'🇮🇹','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Netherlands':'🇳🇱','Belgium':'🇧🇪',
  'United States':'🇺🇸','Mexico':'🇲🇽','Japan':'🇯🇵','South Korea':'🇰🇷','Saudi Arabia':'🇸🇦',
  'Morocco':'🇲🇦','Senegal':'🇸🇳','Switzerland':'🇨🇭','Croatia':'🇭🇷','Poland':'🇵🇱',
  'Uruguay':'🇺🇾','Colombia':'🇨🇴','Chile':'🇨🇱','Ecuador':'🇪🇨','Peru':'🇵🇪',
  'Australia':'🇦🇺','South Africa':'🇿🇦','Tunisia':'🇹🇳','Cameroon':'🇨🇲','Ghana':'🇬🇭',
  'Denmark':'🇩🇰','Sweden':'🇸🇪','Norway':'🇳🇴','Serbia':'🇷🇸','Ukraine':'🇺🇦',
  'Turkey':'🇹🇷','Greece':'🇬🇷','Czech Republic':'🇨🇿','Austria':'🇦🇹','Hungary':'🇭🇺',
  'Qatar':'🇶🇦','Iran':'🇮🇷','Canada':'🇨🇦','Costa Rica':'🇨🇷','Panama':'🇵🇦',
  'Ivory Coast':'🇨🇮','Nigeria':'🇳🇬','Egypt':'🇪🇬','Algeria':'🇩🇿','Mali':'🇲🇱',
  'China':'🇨🇳','Indonesia':'🇮🇩','India':'🇮🇳','World':'🌍','Europe':'🌍',
  'International':'🌍','Romania':'🇷🇴','Slovakia':'🇸🇰','Slovenia':'🇸🇮',
  'Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Ireland':'🇮🇪','Finland':'🇫🇮',
  'Russia':'🇷🇺','Israel':'🇮🇱','Albania':'🇦🇱','Kosovo':'🇽🇰',
};

const WC_TEAMS = [
  { name:'Brasil',    flag:'🇧🇷' },
  { name:'Argentina', flag:'🇦🇷' },
  { name:'França',    flag:'🇫🇷' },
  { name:'Alemanha',  flag:'🇩🇪' },
  { name:'Espanha',   flag:'🇪🇸' },
  { name:'Portugal',  flag:'🇵🇹' },
  { name:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name:'Holanda',   flag:'🇳🇱' },
  { name:'Bélgica',   flag:'🇧🇪' },
  { name:'EUA',       flag:'🇺🇸' },
  { name:'México',    flag:'🇲🇽' },
  { name:'Japão',     flag:'🇯🇵' },
  { name:'Marrocos',  flag:'🇲🇦' },
  { name:'Senegal',   flag:'🇸🇳' },
  { name:'Croácia',   flag:'🇭🇷' },
  { name:'Suíça',     flag:'🇨🇭' },
  { name:'Colômbia',  flag:'🇨🇴' },
  { name:'Uruguai',   flag:'🇺🇾' },
  { name:'Coreia',    flag:'🇰🇷' },
  { name:'Austrália', flag:'🇦🇺' },
];

function getFlag(country) {
  if (!country) return '🏳️';
  for (const [key, val] of Object.entries(FLAGS)) {
    if (country.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return '🏳️';
}

function generateDemoGames() {
  const games = [];
  const used  = new Set();
  const count = 6 + Math.floor(Math.random() * 6);

  for (let i = 0; i < count; i++) {
    let hi, ai;
    do { hi = Math.floor(Math.random() * WC_TEAMS.length); } while (used.has(hi));
    used.add(hi);
    do { ai = Math.floor(Math.random() * WC_TEAMS.length); } while (used.has(ai));
    used.add(ai);

    const ht = WC_TEAMS[hi];
    const at = WC_TEAMS[ai];

    games.push({
      id:        `demo-${i}-${Date.now()}`,
      home:      ht.name, homeFull: ht.name, homeFlag: ht.flag,
      away:      at.name, awayFull: at.name, awayFlag: at.flag,
      league:    'Copa do Mundo 2026',
      country:   'World',
      minute:    5 + Math.floor(Math.random() * 40),
      homeGoals: Math.floor(Math.random() * 4),
      awayGoals: Math.floor(Math.random() * 4),
      isDemo:    true,
    });
  }

  // Garante pelo menos 1 alerta
  if (games.length > 0) {
    games[0].homeGoals = 1;
    games[0].awayGoals = 1;
    games[0].minute    = 18 + Math.floor(Math.random() * 14);
  }

  return games;
}
