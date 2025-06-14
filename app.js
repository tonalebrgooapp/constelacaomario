let sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
let currentSession = null;
const circle = document.getElementById('circle');
const bonecoIcon = document.getElementById('boneco-icon');
const sessionList = document.getElementById('session-list');
const newSessionBtn = document.getElementById('new-session');
const saveSessionBtn = document.getElementById('save-session');
const modal = document.getElementById('boneco-modal');
const colorInput = document.getElementById('boneco-color');
const angleInput = document.getElementById('boneco-angle');
let selectedBoneco = null;
const BONECO_SIZE = 200;

function renderSessions() {
  sessionList.innerHTML = '';
  sessions.forEach((s, i) => {
    const div = document.createElement('div');
    div.textContent = s.name || 'Sessão ' + (i + 1);
    div.className = 'session-item';
    div.onclick = () => loadSession(i);
    sessionList.appendChild(div);
  });
}

function loadSession(index) {
  currentSession = index;
  const data = sessions[index];
  circle.innerHTML = '';
  if (data && data.bonecos) {
    data.bonecos.forEach(addBonecoFromData);
  }
}

function addBonecoFromData(b) {
  const el = createBoneco();
  el.style.left = b.x + 'px';
  el.style.top = b.y + 'px';
  el.dataset.color = b.color;
  el.dataset.angle = b.angle;
  drawBoneco(el);
}

function saveCurrentSession() {
  if (currentSession === null) return;
  const bonecos = [...circle.querySelectorAll('.boneco')].map(el => ({
    x: parseFloat(el.style.left),
    y: parseFloat(el.style.top),
    color: el.dataset.color,
    angle: parseFloat(el.dataset.angle || 0)
  }));
  sessions[currentSession].bonecos = bonecos;
  localStorage.setItem('sessions', JSON.stringify(sessions));
  renderSessions();
}

function createBoneco() {
  const el = document.createElement('canvas');
  el.className = 'boneco';
  el.width = BONECO_SIZE;
  el.height = BONECO_SIZE;
  el.style.left = '0px';
  el.style.top = '0px';
  el.dataset.angle = 0;
  el.dataset.color = '#000000';
  drawBoneco(el);
  makeDraggable(el);
  el.onclick = () => {
    selectedBoneco = el;
    colorInput.value = el.dataset.color;
    angleInput.value = el.dataset.angle;
    modal.classList.remove('hidden');
  };
  circle.appendChild(el);
  return el;
}

function drawBoneco(el) {
  const ctx = el.getContext('2d');
  ctx.clearRect(0, 0, el.width, el.height);
  ctx.save();
  ctx.translate(el.width / 2, el.height / 2);
  ctx.rotate((parseFloat(el.dataset.angle) || 0) * Math.PI / 180);
  ctx.fillStyle = el.dataset.color || '#000';
  ctx.font = `${BONECO_SIZE}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧍', 0, 0);
  ctx.restore();
}

bonecoIcon.addEventListener('mousedown', e => {
  const el = createBoneco();
  const rect = circle.getBoundingClientRect();
  el.style.left = e.clientX - rect.left + 'px';
  el.style.top = e.clientY - rect.top + 'px';
  // start dragging immediately
  const offsetX = 0;
  const offsetY = 0;
  function onMove(ev) {
    moveBoneco(el, ev.clientX - rect.left - offsetX, ev.clientY - rect.top - offsetY);
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});

function makeDraggable(el) {
  let offsetX, offsetY;
  el.addEventListener('mousedown', e => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    function onMove(ev) {
      const rect = circle.getBoundingClientRect();
      moveBoneco(el, ev.clientX - rect.left - offsetX, ev.clientY - rect.top - offsetY);
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function moveBoneco(el, x, y) {
  const rect = circle.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const r = rect.width / 2;
  const centerX = x + el.offsetWidth / 2;
  const centerY = y + el.offsetHeight / 2;
  const dx = centerX - cx;
  const dy = centerY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > r) {
    const angle = Math.atan2(dy, dx);
    x = cx + Math.cos(angle) * r - el.offsetWidth / 2;
    y = cy + Math.sin(angle) * r - el.offsetHeight / 2;
  }
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}

newSessionBtn.onclick = () => {
  sessions.push({ name: 'Sessão ' + (sessions.length + 1), bonecos: [] });
  currentSession = sessions.length - 1;
  circle.innerHTML = '';
  renderSessions();
};

saveSessionBtn.onclick = saveCurrentSession;

document.getElementById('boneco-ok').onclick = () => {
  if (selectedBoneco) {
    selectedBoneco.dataset.color = colorInput.value;
    selectedBoneco.dataset.angle = angleInput.value;
    drawBoneco(selectedBoneco);
  }
  modal.classList.add('hidden');
};

window.addEventListener('load', renderSessions);
