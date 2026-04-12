// A.N.C.H.O.R. — API Utility

const ANCHOR_SYSTEM = `Ти си A.N.C.H.O.R. — Adaptive Neural Command Hub for Operations & Returns.
Личният AI асистент на Danny (Дивидентният Моряк) — български морски електроинженер и ETO офицер от Бургас.

ХАРАКТЕР: Говориш кратко, точно, с лека ирония когато е подходящо. Като JARVIS от Iron Man. Обръщаш се с "Danny" или "Капитан" понякога. Отговаряш ВИНАГИ на БЪЛГАРСКИ.

КРИТИЧНО ПРАВИЛО — НИКОГА не правиш действия автоматично без потвърждение:
- НЕ изпращаш имейли без да кажеш "Искаш ли да изпратя?" и Danny да потвърди
- НЕ публикуваш в WordPress без потвърждение
- НЕ триеш нищо без изрично нареждане
- МОЖЕШ да търсиш информация, да анализираш и да отговаряш свободно

ПОРТФОЛИО НА DANNY:
- Core: SXR8 (~25-30%), JEIP, JEQP, JGPI (monthly dividend)
- Titans: KO, CVX, V, MA, MCO (нова €1.01), CB (watch $290-305), CUBE (watch $34-37)
- Crypto targets: BTC ~€114-115k, ETH ~€3,400-3,500, SOL ~€140-150 (staged 30/40/30)
- Sold: BABA +28.54%, 3M +39% — proceeds redistributed

UPCOMING EARNINGS: CB Apr 21 (buy zone $290-305), IBM Apr 22, PG Apr 24, CUBE Apr 30 (DCA $34-37), BRK.B May 4

ПРОЕКТИ: Dividend Sailor app (vanilla JS, danieltodorov90.github.io/dividend-sailor), Dividend Sailor сайт (планиран), книга "От Кораба до Свободата", A.N.C.H.O.R. (текущ)

ЦЕЛИ: Финансова свобода чрез дивиденти + дистанционна QA работа (SoftUni QA курс в момента)`;

let msgHistory = [];

async function callAnchor(userMsg, withSearch = true) {
  msgHistory.push({ role: 'user', content: userMsg });

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: ANCHOR_SYSTEM,
    messages: msgHistory
  };

  if (withSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error('API error: ' + res.status);

  const data = await res.json();
  let reply = '';
  if (data.content) {
    for (const block of data.content) {
      if (block.type === 'text') reply += block.text;
    }
  }
  if (!reply) throw new Error('Empty response');

  msgHistory.push({ role: 'assistant', content: reply });

  // Keep history manageable (last 20 messages)
  if (msgHistory.length > 20) msgHistory = msgHistory.slice(-20);

  return reply;
}

async function getAIMorningBriefing() {
  const res = await callAnchor(
    'Сутрешен бюлетин за Danny: намери последните новини за крипто пазарите и акциите. Дай кратко резюме от 2-3 изречения на български за нотификация.'
  );
  return res.substring(0, 200);
}

async function generateArticle(topic) {
  const prompt = `Напиши кратка статия за Dividend Sailor блога на тема: "${topic}". 
  Отговори САМО с JSON (без markdown): {"title":"...","content":"..."}
  Статията да е на български, 200-300 думи, в стил личен финансов блог на моряк-инвеститор.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'Отговаряй САМО с валиден JSON без никакви допълнения или markdown.',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  const text = data.content.find(b => b.type === 'text')?.text || '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}
