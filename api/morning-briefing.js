// A.N.C.H.O.R. — Morning Briefing API
// Vercel Cron Job: runs daily at 06:00 UTC = 08:00 Sofia (EET/EEST)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Security: only allow cron calls or manual trigger with secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get market data
    const [btcRes, newsRes] = await Promise.allSettled([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,eur&include_24hr_change=true'),
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: 'Ти си A.N.C.H.O.R. Пиши на БЪЛГАРСКИ. Бъди кратък и конкретен.',
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{
            role: 'user',
            content: `Сутрешен бюлетин за Danny (Дивидентният Моряк). 
            Намери актуални новини за: крипто пазари, S&P 500, и дивидентни акции.
            Формат: 3-4 кратки точки, всяка с емоджи. Максимум 200 думи. БЕЗ излишно встъпление.`
          }]
        })
      })
    ]);

    // Parse market data
    let marketSummary = '';
    if (btcRes.status === 'fulfilled' && btcRes.value.ok) {
      const mkt = await btcRes.value.json();
      const btc = mkt.bitcoin;
      const eth = mkt.ethereum;
      if (btc) {
        const btcChg = btc.usd_24h_change?.toFixed(1);
        const ethChg = eth?.usd_24h_change?.toFixed(1);
        marketSummary = `BTC: $${Math.round(btc.usd).toLocaleString()} (${btcChg > 0 ? '+' : ''}${btcChg}%) | ETH: $${Math.round(eth?.usd).toLocaleString()} (${ethChg > 0 ? '+' : ''}${ethChg}%)`;
      }
    }

    // Parse AI news
    let newsSummary = 'Добро утро, Капитан! Провери пазарите.';
    if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
      const aiData = await newsRes.value.json();
      for (const block of (aiData.content || [])) {
        if (block.type === 'text') { newsSummary = block.text; break; }
      }
    }

    const briefingText = marketSummary
      ? `${marketSummary}\n\n${newsSummary}`
      : newsSummary;

    // 2. Save to Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/briefing_log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ content: briefingText })
      });

      // 3. Send push notifications to all subscribers
      const subsRes = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (subsRes.ok) {
        const subs = await subsRes.json();
        // Push notifications via Web Push (requires VAPID keys in Phase 3)
        console.log(`Would send to ${subs.length} subscribers`);
      }
    }

    res.status(200).json({
      success: true,
      briefing: briefingText,
      timestamp: new Date().toISOString()
    });

  } catch (e) {
    console.error('Morning briefing error:', e);
    res.status(500).json({ error: e.message });
  }
}
