// A.N.C.H.O.R. — Morning Briefing API (Enhanced)
// Vercel Cron: 06:00 UTC = 08:00 Sofia

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. CRYPTO
    const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,chainlink,cardano&vs_currencies=usd,eur&include_24hr_change=true').catch(() => null);
    let C = {};
    if (cryptoRes?.ok) C = await cryptoRes.json();
    const f = (n) => n ? (n > 999 ? '$' + Math.round(n).toLocaleString() : '$' + Number(n).toFixed(3)) : '—';
    const c = (n) => n ? (n > 0 ? `🟢+${n.toFixed(2)}%` : `🔴${n.toFixed(2)}%`) : '—';
    const cryptoSection = `₿ КРИПТО ПАЗАРИ
• BTC:  ${f(C.bitcoin?.usd)} (${c(C.bitcoin?.usd_24h_change)}) — цел: €114-115k
• ETH:  ${f(C.ethereum?.usd)} (${c(C.ethereum?.usd_24h_change)}) — цел: €3,400-3,500
• SOL:  ${f(C.solana?.usd)} (${c(C.solana?.usd_24h_change)}) — цел: €140-150
• LINK: ${f(C.chainlink?.usd)} (${c(C.chainlink?.usd_24h_change)})
• ADA:  ${f(C.cardano?.usd)} (${c(C.cardano?.usd_24h_change)})`;

    // 2. FOREX
    let forexLine = 'EUR/USD: —';
    try {
      const fx = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (fx.ok) { const d = await fx.json(); forexLine = `EUR/USD: ${(1/d.rates.EUR).toFixed(4)}`; }
    } catch {}

    // 3. PORTFOLIO SNAPSHOT
    const portfolioSection = `📊 ПОРТФОЛИО — DANNY
🔵 Trading 212:
• SXR8 (S&P 500 Core ~25-30%) | JEIP | JEQP | JGPI
• KO | V | MA | CVX | MCO (нова позиция)
🟣 Revolut Watchlist:
• CB  → earnings ДНЕС → зона: $290-305
• CUBE → earnings Apr 30 → DCA: $34-37
• 4GLD (Xetra Gold) | SXR8 DCA ongoing`;

    // 4. EARNINGS
    const earningsSection = `📅 EARNINGS КАЛЕНДАР
• CB    — Chubb Ltd         → 21 Апр → КУПИ $290-305 ⚠️
• IBM   — IBM Corp          → 22 Апр → СЛЕДИ
• PG    — Procter & Gamble  → 24 Апр → СЛЕДИ
• CUBE  — CubeSmart REIT    → 30 Апр → DCA $34-37
• BRK.B — Berkshire H.      → 4 Май  → СЛЕДИ`;

    // 5. AI NEWS
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'web-search-2025-03-05' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: 'Ти си A.N.C.H.O.R. финансов асистент. Пиши САМО на БЪЛГАРСКИ. Конкретно и информативно.',
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: `Сутрешен финансов бюлетин ДНЕС. Намери актуални новини и ги обобщи по категории:

📈 СВЕТОВНИ ПАЗАРИ — S&P 500, Nasdaq, VIX (1-2 изр.)
🥇 ЗЛАТО & СРЕБРО — актуална цена XAU/USD, XAG/USD и тренд (1-2 изр.)
💰 КРИПТО ТРЕНД — биткойн настроение, регулации, важни новини (1-2 изр.)
🏠 ИМОТЕН ПАЗАР — България и Европа, цени, тенденции (1-2 изр.)
💼 АКЦИИ & ДИВИДЕНТИ — новини за KO, Visa, Mastercard, Moody's, Chevron, Chubb (1-2 изр.)
⚠️ РИСКОВЕ — геополитика, инфлация, лихвени решения (1-2 изр.)

Формат: емоджи категория + кратко резюме. Максимум 350 думи.` }]
      })
    });

    let newsText = '📰 НОВИНИ — Грешка при зареждане';
    if (aiRes.ok) {
      const d = await aiRes.json();
      for (const b of (d.content || [])) { if (b.type === 'text') { newsText = `📰 АКТУАЛНИ НОВИНИ\n${b.text}`; break; } }
    }

    // 6. ASSEMBLE
    const date = new Date().toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const fullBriefing = [
      `⚓ СУТРЕШЕН БЮЛЕТИН — ${date.toUpperCase()}`,
      '─'.repeat(45),
      cryptoSection,
      `💱 ФОРЕКС\n• ${forexLine}`,
      portfolioSection,
      earningsSection,
      newsText,
      '─'.repeat(45),
      '🚢 A.N.C.H.O.R. — Дивидентният Моряк | anchor-nine-gamma.vercel.app'
    ].join('\n\n');

    // 7. SAVE TO SUPABASE
    const su = process.env.SUPABASE_URL, sk = process.env.SUPABASE_SECRET_KEY;
    if (su && sk) {
      await fetch(`${su}/rest/v1/briefing_log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': sk, 'Authorization': `Bearer ${sk}` },
        body: JSON.stringify({ content: fullBriefing })
      }).catch(() => {});
    }

    res.status(200).json({ success: true, briefing: fullBriefing, timestamp: new Date().toISOString() });

  } catch (e) {
    console.error('Briefing error:', e);
    res.status(500).json({ error: e.message });
  }
}
