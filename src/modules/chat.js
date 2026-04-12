// A.N.C.H.O.R. — Chat Module

function addAnchorMsg(html) {
  const box = document.getElementById('chat-msgs');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'msg msg-a';
  div.innerHTML = '<div class="msg-label">A.N.C.H.O.R.</div><div class="msg-body">' + html + '</div>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function addUserMsg(text) {
  const box = document.getElementById('chat-msgs');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'msg msg-u';
  div.innerHTML = '<div class="msg-label">DANNY</div><div class="msg-body">' + escHtml(text) + '</div>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function showTyping() {
  const box = document.getElementById('chat-msgs');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'msg msg-a';
  div.id = 'typing';
  div.innerHTML = '<div class="msg-label">A.N.C.H.O.R.</div><div class="msg-body"><div class="typing"><span></span><span></span><span></span></div></div>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  document.getElementById('typing')?.remove();
}

async function sendMsg() {
  const inp = document.getElementById('chat-inp');
  const text = inp?.value.trim();
  if (!text) return;

  inp.value = '';
  inp.style.height = 'auto';
  switchTab('chat');
  addUserMsg(text);
  showTyping();

  try {
    const reply = await callAnchor(text, true);
    removeTyping();
    addAnchorMsg(reply.replace(/\n/g, '<br>'));
    speakText(reply);
  } catch (e) {
    removeTyping();
    addAnchorMsg('Грешка при свързване с AI модула. Провери интернет връзката.');
  }
}

function sendQuick(cmd) {
  const inp = document.getElementById('chat-inp');
  if (inp) inp.value = cmd;
  switchTab('chat');
  sendMsg();
}
