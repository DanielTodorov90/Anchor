// A.N.C.H.O.R. — Portfolio API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const su = process.env.SUPABASE_URL;
  const sk = process.env.SUPABASE_SECRET_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': sk,
    'Authorization': `Bearer ${sk}`
  };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${su}/rest/v1/portfolio?select=*&order=platform.asc,name.asc`, { headers });
      const data = await r.json();

      // Calculate totals
      const t212 = data.filter(p => p.platform === 'T212');
      const revolut = data.filter(p => p.platform === 'Revolut');
      const totalT212 = t212.reduce((s, p) => s + Number(p.current_value || 0), 0);
      const totalRevolut = revolut.reduce((s, p) => s + Number(p.current_value || 0), 0);

      return res.status(200).json({
        positions: data,
        summary: {
          t212_total_eur: totalT212.toFixed(2),
          revolut_total_usd: totalRevolut.toFixed(2),
          total_positions: data.length
        }
      });
    }

    if (req.method === 'PATCH') {
      const { id, current_value } = req.body;
      const r = await fetch(`${su}/rest/v1/portfolio?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ current_value, updated_at: new Date().toISOString() })
      });
      return res.status(200).json(await r.json());
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
