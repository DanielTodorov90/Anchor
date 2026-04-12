// A.N.C.H.O.R. — Tasks Module

const DEFAULT_TASKS = [
  { id: 1, text: 'Реши за CB след earnings (Apr 21)', date: 'Apr 21', prio: 'high', done: false },
  { id: 2, text: 'Провери CUBE преди Apr 30', date: 'Apr 28', prio: 'high', done: false },
  { id: 3, text: 'Финализирай Dividend Sailor app', date: 'ongoing', prio: 'med', done: false },
  { id: 4, text: 'Upgrade Alpha Vantage → FMP Starter', date: 'when app done', prio: 'med', done: false },
  { id: 5, text: 'A.N.C.H.O.R. — Фаза 2 Backend', date: 'next', prio: 'med', done: false },
  { id: 6, text: 'Започни Dividend Sailor сайт', date: 'after app', prio: 'low', done: false },
  { id: 7, text: 'SoftUni QA — следваща лекция', date: 'ongoing', prio: 'med', done: false },
  { id: 8, text: 'Нов ритуал — Новолуние Apr 17', date: 'Apr 17', prio: 'low', done: false }
];

let tasks = [];

function loadTasks() {
  tasks = Storage.get('tasks', DEFAULT_TASKS);
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  if (!list) return;

  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  const all = [...active, ...done];

  list.innerHTML = '<div class="tbl-hdr">ЗАДАЧИ (' + active.length + ' активни)</div>' +
    all.map(t => `
      <div class="task-row">
        <div class="chk${t.done ? ' done' : ''}" onclick="toggleTask(${t.id})">${t.done ? '✓' : ''}</div>
        <span class="task-txt${t.done ? ' done' : ''}">${escHtml(t.text)}</span>
        <span class="task-date">${t.date}</span>
        <span class="badge badge-${prioBadge(t.prio)}">${t.prio.toUpperCase()}</span>
      </div>
    `).join('');
}

function prioBadge(p) {
  return p === 'high' ? 'watch' : p === 'med' ? 'hold' : 'buy';
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  Storage.set('tasks', tasks);
  renderTasks();
}

function addTask() {
  const inp = document.getElementById('task-inp');
  const prio = document.getElementById('task-prio')?.value || 'med';
  const text = inp?.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    date: '—',
    prio,
    done: false
  };
  tasks.unshift(newTask);
  Storage.set('tasks', tasks);
  renderTasks();
  if (inp) inp.value = '';
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
