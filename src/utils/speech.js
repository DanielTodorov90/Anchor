// A.N.C.H.O.R. — Speech Utility

let isListening = false;
let recognition = null;
const synth = window.speechSynthesis;

function speakText(text) {
  if (!synth) return;
  synth.cancel();
  const plain = text.replace(/<[^>]+>/g, '').substring(0, 250);
  const utt = new SpeechSynthesisUtterance(plain);
  utt.lang = 'bg-BG';
  utt.rate = 1.0;
  utt.pitch = 0.9;
  synth.speak(utt);
}

function toggleVoice() {
  if (isListening) stopListening();
  else startListening();
}

function startListening() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { showNotif('Гласовото разпознаване не се поддържа.'); return; }

  recognition = new SR();
  recognition.lang = 'bg-BG';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    setVoiceUI(true);
  };

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    const inp = document.getElementById('chat-inp');
    if (inp) { inp.value = text; autoResize(inp); }
    sendMsg();
  };

  recognition.onerror = (e) => {
    console.error('Speech error:', e.error);
    stopListening();
  };

  recognition.onend = () => stopListening();
  recognition.start();
}

function stopListening() {
  isListening = false;
  if (recognition) { try { recognition.stop(); } catch {} recognition = null; }
  setVoiceUI(false);
}

function setVoiceUI(on) {
  const micBtn = document.getElementById('mic-btn');
  const sbDot = document.getElementById('sb-voice-dot');
  const sbLabel = document.getElementById('sb-voice-label');
  if (micBtn) micBtn.classList.toggle('on', on);
  if (sbDot) sbDot.style.background = on ? 'var(--danger)' : 'var(--border)';
  if (sbLabel) sbLabel.textContent = on ? 'Слушам...' : 'Гласов режим';
}

function toggleMic() { toggleVoice(); }
