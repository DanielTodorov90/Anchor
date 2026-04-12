// A.N.C.H.O.R. — Markets Module

async function loadMarkets() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,eur&include_24hr_change=true');
    const d = await res.json();

    if (d.bitcoin) {
      setMarket('m-btc', '$' + Math.round(d.bitcoin.usd).toLocaleString(), d.bitcoin.usd_24h_change);
    }
    if (d.ethereum) {
      setMarket('m-eth', '$' + Math.round(d.ethereum.usd).toLocaleString(), d.ethereum.usd_24h_change);
    }
    if (d.solana) {
      setMarket('m-sol', '$' + Math.round(d.solana.usd).toLocaleString(), d.solana.usd_24h_change);
    }

    // EUR/USD via exchangerate
    try {
      const fx = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const fxd = await fx.json();
      const rate = fxd.rates?.USD;
      if (rate) {
        document.getElementById('m-eur').textContent = rate.toFixed(4);
      }
    } catch {}

  } catch (e) {
    console.log('Markets load failed:', e);
  }
}

function setMarket(id, price, change) {
  const el = document.getElementById(id);
  const chgId = id + '-c';
  const chgEl = document.getElementById(chgId);
  if (el) el.textContent = price;
  if (chgEl && change !== undefined) {
    const c = parseFloat(change).toFixed(2);
    const cls = c > 0 ? 'pos' : c < 0 ? 'neg' : 'neu';
    chgEl.innerHTML = '<span class="' + cls + '">' + (c > 0 ? '+' : '') + c + '% 24h</span>';
  }
}

// Auto-refresh every 3 minutes
setInterval(loadMarkets, 180000);
