// A.N.C.H.O.R. — WordPress Module

async function wpGenerate() {
  const topic = document.getElementById('wp-topic')?.value.trim();
  if (!topic) { showNotif('Въведи тема за генерация.'); return; }

  const titleEl = document.getElementById('wp-title');
  const contentEl = document.getElementById('wp-content');
  if (titleEl) titleEl.value = 'Генерирам...';
  if (contentEl) contentEl.value = 'A.N.C.H.O.R. пише статията...';

  try {
    const result = await generateArticle(topic);
    if (titleEl) titleEl.value = result.title || topic;
    if (contentEl) contentEl.value = result.content || 'Грешка при генерация.';
  } catch (e) {
    if (titleEl) titleEl.value = topic;
    if (contentEl) contentEl.value = 'Грешка. Опитай пак.';
  }
}

function wpPublishConfirm() {
  const title = document.getElementById('wp-title')?.value.trim();
  if (!title) { showNotif('Добави заглавие преди публикуване.'); return; }

  const area = document.getElementById('wp-confirm');
  if (!area) return;
  area.innerHTML = `
    <div class="confirm">
      <div class="confirm-q">⚠ ПОТВЪРДИ: Публикувай "${escHtml(title)}" в WordPress?</div>
      <div class="confirm-btns">
        <button class="btn btn-success" onclick="wpDoPublish()">ДА, ПУБЛИКУВАЙ</button>
        <button class="btn btn-danger" onclick="wpCancelConfirm()">ОТМЕНИ</button>
      </div>
    </div>`;
}

function wpCancelConfirm() {
  const area = document.getElementById('wp-confirm');
  if (area) area.innerHTML = '';
}

async function wpDoPublish() {
  wpCancelConfirm();
  const title = document.getElementById('wp-title')?.value.trim();
  const content = document.getElementById('wp-content')?.value.trim();
  showNotif('Публикуване на "' + title + '"... (изисква WordPress MCP интеграция)');
  // TODO: Phase 3 — WordPress MCP API call
  // await callWordPressAPI({ title, content, status: 'publish' });
}

function wpDraft() {
  const title = document.getElementById('wp-title')?.value.trim();
  if (!title) { showNotif('Добави заглавие.'); return; }
  const content = document.getElementById('wp-content')?.value || '';
  const drafts = Storage.get('wp_drafts', []);
  drafts.unshift({ title, content, date: new Date().toLocaleDateString('bg-BG') });
  Storage.set('wp_drafts', drafts.slice(0, 10));
  showNotif('Draft запазен: "' + title + '"');
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
