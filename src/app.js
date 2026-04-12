// A.N.C.H.O.R. — Main App Controller

const ANCHOR_VERSION = '1.0.0';

// ── CLOCK ──
function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('bg-BG', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ── TAB NAVIGATION ──
function switchTab(tabName) {
  // Desktop tabs
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  // Mobile tabs
  document.querySelectorAll('.mob-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  // Panels
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + tabName);
  if (panel) panel.classList.add('active');
  // Sidebar items
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));

  // Scroll content to top
  const content = document.querySelector('.content');
  if (content) content.scrollTop = 0;
}

// Attach tab click handlers
document.querySelectorAll('.tab, .mob-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Sidebar quick commands
document.querySelectorAll('.sb-item[data-cmd]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    switchTab('chat');
    sendQuick(item.dataset.cmd);
  });
});

// ── NOTIFICATIONS ──
function showNotif(text, duration = 6000) {
  const bar = document.getElementById('notif-bar');
  const textEl = document.getElementById('notif-text');
  if (!bar || !textEl) return;
  textEl.textContent = text;
  bar.classList.add('show');
  if (duration > 0) setTimeout(closeNotif, duration);
}

function closeNotif() {
  document.getElementById('notif-bar')?.classList.remove('show');
}

async function requestNotifPermission() {
  if (!('Notification' in window)) {
    showNotif('Нотификациите не се поддържат в този браузър.');
    return;
  }
  const perm = await Notification.requestPermission();
  const dot = document.getElementById('notif-dot');
  if (perm === 'granted') {
    if (dot) dot.classList.add('on');
    showNotif('⚓ Нотификациите са активни! Ще получаваш сутрешен бюлетин в 08:00.');
    scheduleМorningBriefing();
  } else {
    showNotif('Нотификациите са отказани. Можеш да ги активираш от настройките на браузъра.');
  }
}

function scheduleМorningBriefing() {
  // Register background sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(sw => {
      sw.sync.register('morning-briefing');
    });
  }
  // Fallback: check time every minute
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 8 && now.getMinutes() === 0) {
      triggerMorningBriefing();
    }
  }, 60000);
}

async function triggerMorningBriefing() {
  if (Notification.permission !== 'granted') return;
  try {
    // Use the chat module to get briefing
    const briefing = await getAIMorningBriefing();
    new Notification('⚓ A.N.C.H.O.R. — Сутрешен бюлетин', {
      body: briefing,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: 'morning-briefing'
    });
  } catch(e) {
    new Notification('⚓ A.N.C.H.O.R.', {
      body: 'Добро утро, Danny! Пазарите са отворили. Виж Markets таба.',
      icon: '/icons/icon-192.png'
    });
  }
}

// ── PWA INSTALL ──
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  setTimeout(showInstallPrompt, 3000);
});

function showInstallPrompt() {
  const prompt = document.getElementById('install-prompt');
  if (prompt && deferredInstallPrompt) prompt.classList.add('show');
  else if (prompt && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // iOS: show manual instructions
    prompt.querySelector('p').textContent = 'На iPhone: натисни Share → "Add to Home Screen" за да инсталираш A.N.C.H.O.R.';
    prompt.classList.add('show');
  }
}

document.getElementById('install-btn')?.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') showNotif('⚓ A.N.C.H.O.R. инсталиран успешно!');
  deferredInstallPrompt = null;
  document.getElementById('install-prompt').classList.remove('show');
});

window.addEventListener('appinstalled', () => {
  showNotif('⚓ A.N.C.H.O.R. е инсталиран на устройството!');
  document.getElementById('install-prompt').classList.remove('show');
});

// ── SERVICE WORKER REGISTRATION ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/public/sw.js');
      console.log('SW registered:', reg.scope);
    } catch(e) {
      console.log('SW registration failed:', e);
    }
  });
}

// ── HELPER: AUTO RESIZE TEXTAREA ──
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 90) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
}

// ── CHECK URL PARAMS (shortcuts) ──
const urlTab = new URLSearchParams(window.location.search).get('tab');
if (urlTab) switchTab(urlTab);

// ── INITIAL GREETING ──
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const now = new Date();
    const h = now.getHours();
    const greeting = h < 12 ? 'Добро утро' : h < 18 ? 'Добър ден' : 'Добър вечер';
    addAnchorMsg(`${greeting}, Danny. A.N.C.H.O.R. v${ANCHOR_VERSION} е онлайн. Всички системи номинални. Имаш <strong style="color:var(--accent)">2 earnings тази седмица</strong> — CB (Apr 21) и IBM (Apr 22). Как мога да помогна?`);
    loadMarkets();
    loadTasks();
  }, 300);
});
