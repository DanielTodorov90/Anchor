// A.N.C.H.O.R. — News Module

async function searchNews() {
  const q = document.getElementById('news-q')?.value.trim();
  if (!q) { showNotif('Въведи тема за търсене.'); return; }
  switchTab('chat');
  sendQuick('Потърси актуални новини за: "' + q + '". Дай ми 3-4 резюмета на български с източници.');
}
