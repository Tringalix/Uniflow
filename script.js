// ============================================
// UniFlow – Suite completa
// ============================================

console.log("SCRIPT CARICATO ✔️");

let mediaHistory = [];
let simulationMode = false;
let totalXP = 0;

const dailyGoals = [
  { id: 1, label: "Aggiungi 1 esame", done: false, xp: 10 },
  { id: 2, label: "Aggiorna la media 3 volte", done: false, xp: 15 },
  { id: 3, label: "Ordina gli esami almeno una volta", done: false, xp: 5 }
];

let goalUpdateCount = 0;
let goalSortUsed = false;

// -------------------------------
// Tema chiaro/scuro + dinamico
// -------------------------------
function toggleTheme() {
  document.body.classList.toggle("theme-dark");
  const isDark = document.body.classList.contains("theme-dark");
  localStorage.setItem("uniflow_theme", isDark ? "dark" : "light");
}

(function initTheme() {
  const saved = localStorage.getItem("uniflow_theme");
  if (saved === "light") {
    document.body.classList.remove("theme-dark");
  } else if (saved === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 19) {
      document.body.classList.remove("theme-dark");
    } else {
      document.body.classList.add("theme-dark");
    }
  }
})();

// -------------------------------
// Focus mode
// -------------------------------
function toggleFocus() {
  document.body.classList.toggle("focus-mode");
  showToast(document.body.classList.contains("focus-mode") ? "Modalità focus attiva" : "Modalità focus disattivata");
}

// -------------------------------
// Sidebar
// -------------------------------
function toggleSidebar() {
  const side = document.getElementById("uf-sidebar");
  if (!side) return;
  side.classList.toggle("open");
}

// -------------------------------
// Countdown sessione
// -------------------------------
(function initCountdown() {
  const target = new Date();
  target.setMonth(5); // giugno
  target.setDate(15);
  target.setHours(9, 0, 0, 0);

  function update() {
    const now = new Date();
    let diff = target - now;
    const el = document.getElementById("session-countdown");
    if (!el) return;

    if (diff <= 0) {
      el.textContent = "È tempo di spaccare in sessione 💥";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    el.textContent = `${days} giorni, ${hours} ore`;
  }

  update();
  setInterval(update, 60_000);
})();

// -------------------------------
// Toast / notifiche
// -------------------------------
function showToast(msg) {
  const toast = document.getElementById("uf-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2200);
}

// -------------------------------
// XP / Livelli
// -------------------------------
function addXP(amount = 10) {
  totalXP += amount;

  const el = document.getElementById("xp-label");
  if (el) {
    el.textContent = `+${totalXP} oggi · Continua così 👀`;
  }

  const level = Math.floor(totalXP / 50) + 1;
  const levelEl = document.getElementById("uf-level");
  const xpEl = document.getElementById("uf-xp-total");
  const sideLevel = document.getElementById("uf-side-level");
  const sideXP = document.getElementById("uf-side-xp");

  if (levelEl) levelEl.textContent = level;
  if (xpEl) xpEl.textContent = totalXP;
  if (sideLevel) sideLevel.textContent = level;
  if (sideXP) sideXP.textContent = totalXP;

  showToast(`+${amount} XP · Livello ${level}`);
}

// -------------------------------
// Modalità simulazione
// -------------------------------
function toggleSimulation() {
  simulationMode = !simulationMode;
  document.body.classList.toggle("simulation-mode", simulationMode);
  showToast(simulationMode ? "Modalità simulazione attiva" : "Modalità simulazione disattivata");
}

// -------------------------------
// Aggiungi esame
// -------------------------------
function addExam(voto = "", crediti = "", simulated = false) {
  const container = document.getElementById("exam-list");
  if (!container) return;

  const row = document.createElement("div");
  row.classList.add("uf-exam-row");
  if (simulationMode || simulated) {
    row.classList.add("uf-exam-simulated");
  }

  row.innerHTML = `
    <input type="number" class="voto" placeholder="Voto (18-30)" min="18" max="30" value="${voto}">
    <input type="number" class="cfu" placeholder="CFU" min="1" value="${crediti}">
    <button onclick="removeExam(this)">✕</button>
  `;

  container.appendChild(row);
  calculateMedia();
  saveData();
  addXP(5);
}

// -------------------------------
// Rimuovi esame
// -------------------------------
function removeExam(button) {
  button.parentElement.remove();
  calculateMedia();
  saveData();
  addXP(2);
}

// -------------------------------
// Calcolo media
// -------------------------------
document.addEventListener("input", () => {
  calculateMedia();
  saveData();
});

function calculateMedia() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];
  const voti = rows.map(r => Number(r.querySelector(".voto").value));
  const cfu = rows.map(r => Number(r.querySelector(".cfu").value));

  let totaleCFU = 0;
  let sommaPonderata = 0;

  for (let i = 0; i < voti.length; i++) {
    if (voti[i] >= 18 && voti[i] <= 30 && cfu[i] > 0) {
      totaleCFU += cfu[i];
      sommaPonderata += voti[i] * cfu[i];
    }
  }

  const mediaValue = document.getElementById("media-value");
  const media110 = document.getElementById("media-110");

  if (totaleCFU === 0) {
    if (mediaValue) mediaValue.textContent = "—";
    if (media110) media110.textContent = "—";
    updateMediaHistory(null);
    syncLaureaInput(null);
    updateSidebarStats(null, null, 0);
    updateStressTheme(null);
    return;
  }

  const media = sommaPonderata / totaleCFU;
  const mediaSu110 = (media * 110) / 30;

  if (mediaValue) mediaValue.textContent = media.toFixed(2);
  if (media110) media110.textContent = mediaSu110.toFixed(2);

  animateMedia();
  updateMediaHistory(media);
  syncLaureaInput(mediaSu110);
  updateSidebarStats(media, mediaSu110, rows.length);
  updateStressTheme(media);

  goalUpdateCount++;
  checkGoals();
}

// -------------------------------
// Animazione media
// -------------------------------
function animateMedia() {
  const el = document.getElementById("media-value");
  if (!el) return;
  el.style.transition = "0.25s";
  el.style.transform = "scale(1.12)";
  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 200);
}

// -------------------------------
// Salvataggio automatico
// -------------------------------
function saveData() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];
  const data = rows.map(r => ({
    voto: r.querySelector(".voto").value,
    cfu: r.querySelector(".cfu").value,
    simulated: r.classList.contains("uf-exam-simulated")
  }));

  localStorage.setItem("uniflow_esami", JSON.stringify(data));
  localStorage.setItem("uniflow_media_history", JSON.stringify(mediaHistory));
  localStorage.setItem("uniflow_xp", String(totalXP));
  localStorage.setItem("uniflow_goals", JSON.stringify(dailyGoals));
  localStorage.setItem("uniflow_goalUpdateCount", String(goalUpdateCount));
  localStorage.setItem("uniflow_goalSortUsed", String(goalSortUsed));
}

// -------------------------------
// Ripristino automatico
// -------------------------------
function loadData() {
  const data = JSON.parse(localStorage.getItem("uniflow_esami"));
  if (data && Array.isArray(data) && data.length > 0) {
    data.forEach(esame => {
      addExam(esame.voto, esame.cfu, esame.simulated);
    });
  } else {
    addExam();
  }

  const history = JSON.parse(localStorage.getItem("uniflow_media_history"));
  if (history && Array.isArray(history)) {
    mediaHistory = history;
    renderMediaHistory();
  }

  const xpSaved = Number(localStorage.getItem("uniflow_xp"));
  if (!isNaN(xpSaved) && xpSaved > 0) {
    totalXP = xpSaved;
    addXP(0); // aggiorna UI senza aggiungere XP
  }

  const goalsSaved = JSON.parse(localStorage.getItem("uniflow_goals"));
  if (goalsSaved && Array.isArray(goalsSaved)) {
    goalsSaved.forEach(g => {
      const goal = dailyGoals.find(d => d.id === g.id);
      if (goal) {
        goal.done = g.done;
      }
    });
  }

  const guc = Number(localStorage.getItem("uniflow_goalUpdateCount"));
  if (!isNaN(guc)) goalUpdateCount = guc;

  const gsu = localStorage.getItem("uniflow_goalSortUsed");
  if (gsu === "true") goalSortUsed = true;

  renderGoals();
  calculateMedia();
}

// -------------------------------
// Reset totale
// -------------------------------
function resetAll() {
  const list = document.getElementById("exam-list");
  if (list) list.innerHTML = "";
  localStorage.removeItem("uniflow_esami");
  localStorage.removeItem("uniflow_media_history");
  localStorage.removeItem("uniflow_xp");
  localStorage.removeItem("uniflow_goals");
  localStorage.removeItem("uniflow_goalUpdateCount");
  localStorage.removeItem("uniflow_goalSortUsed");

  mediaHistory = [];
  totalXP = 0;
  goalUpdateCount = 0;
  goalSortUsed = false;
  dailyGoals.forEach(g => (g.done = false));

  renderMediaHistory();
  renderGoals();
  addXP(0);
  calculateMedia();
  showToast("Tutto resettato");
}

// -------------------------------
// Ordinamento
// -------------------------------
function sortByVoto() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];

  rows.sort((a, b) => {
    const votoA = Number(a.querySelector(".voto").value);
    const votoB = Number(b.querySelector(".voto").value);
    return votoB - votoA;
  });

  const container = document.getElementById("exam-list");
  if (!container) return;
  container.innerHTML = "";
  rows.forEach(r => container.appendChild(r));

  goalSortUsed = true;
  checkGoals();
  saveData();
  showToast("Ordinato per voto");
}

function sortByCFU() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];

  rows.sort((a, b) => {
    const cfuA = Number(a.querySelector(".cfu").value);
    const cfuB = Number(b.querySelector(".cfu").value);
    return cfuB - cfuA;
  });

  const container = document.getElementById("exam-list");
  if (!container) return;
  container.innerHTML = "";
  rows.forEach(r => container.appendChild(r));

  goalSortUsed = true;
  checkGoals();
  saveData();
  showToast("Ordinato per CFU");
}

// -------------------------------
// Progressione media
// -------------------------------
function updateMediaHistory(media) {
  if (media === null) return;
  mediaHistory.push(Number(media.toFixed(2)));
  if (mediaHistory.length > 20) {
    mediaHistory.shift();
  }
  renderMediaHistory();
}

function renderMediaHistory() {
  const container = document.getElementById("media-history");
  if (!container) return;

  container.innerHTML = "";

  mediaHistory.forEach(value => {
    const bar = document.createElement("div");
    bar.classList.add("uf-media-bar");
    const height = 30 + (value / 110) * 70;
    bar.style.height = `${height}px`;
    bar.title = value.toFixed(2);
    container.appendChild(bar);
  });
}

// -------------------------------
// Simulatore voto di laurea
// -------------------------------
function syncLaureaInput(media110) {
  const input = document.getElementById("laurea-media110");
  if (!input) return;

  if (media110 !== null) {
    input.value = media110.toFixed(2);
  }
}

function calculateLaurea() {
  const media110El = document.getElementById("laurea-media110");
  const bonusEl = document.getElementById("laurea-bonus");
  const tesiEl = document.getElementById("laurea-tesi");
  const roundEl = document.getElementById("laurea-round");
  const resultEl = document.getElementById("laurea-result");

  let base = Number(media110El.value);
  const bonus = Number(bonusEl.value) || 0;
  const tesi = Number(tesiEl.value) || 0;

  if (!base || base <= 0) {
    resultEl.textContent = "Inserisci una media valida";
    return;
  }

  let voto = base + bonus + tesi;

  switch (roundEl.value) {
    case "floor":
      voto = Math.floor(voto);
      break;
    case "ceil":
      voto = Math.ceil(voto);
      break;
    case "nearest":
      voto = Math.round(voto);
      break;
    default:
      break;
  }

  if (voto > 110) voto = 110;

  resultEl.textContent = voto.toFixed(2);
  showToast("Voto di laurea simulato");
}

// -------------------------------
// Planner: media necessaria
// -------------------------------
function calculateTarget() {
  const current110 = Number(document.getElementById("planner-current110").value);
  const cfuDone = Number(document.getElementById("planner-cfu-done").value);
  const cfuLeft = Number(document.getElementById("planner-cfu-left").value);
  const target110 = Number(document.getElementById("planner-target110").value);
  const resultEl = document.getElementById("planner-result");

  if (!current110 || !cfuDone || !cfuLeft || !target110) {
    resultEl.textContent = "Compila tutti i campi";
    return;
  }

  const current30 = (current110 * 30) / 110;
  const target30 = (target110 * 30) / 110;

  const numeratore = target30 * (cfuDone + cfuLeft) - current30 * cfuDone;
  const mediaNecessaria = numeratore / cfuLeft;

  if (mediaNecessaria > 30) {
    resultEl.textContent = "Obiettivo irrealistico (servirebbe >30)";
    return;
  }

  resultEl.textContent = mediaNecessaria.toFixed(2);
  showToast("Media necessaria calcolata");
}

// -------------------------------
// Import CSV
// -------------------------------
function importCSV() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv,text/csv";

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);
  });

  input.click();
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  if (!lines.length) return;

  const list = document.getElementById("exam-list");
  if (!list) return;
  list.innerHTML = "";

  lines.forEach(line => {
    const parts = line.split(",");
    if (parts.length < 3) return;
    const voto = parts[1].trim();
    const cfu = parts[2].trim();
    addExam(voto, cfu);
  });

  showToast("CSV importato");
}

// -------------------------------
// Export JSON
// -------------------------------
function exportJSON() {
  const data = localStorage.getItem("uniflow_esami") || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "uniflow_backup.json";
  a.click();

  URL.revokeObjectURL(url);
  showToast("Backup JSON scaricato");
}

// -------------------------------
// Esporta PDF (stampa)
// -------------------------------
function downloadPrint() {
  showToast("Apri la finestra di stampa per salvare in PDF");
  window.print();
}

// -------------------------------
// Sidebar stats + tema stress
// -------------------------------
function updateSidebarStats(media, media110, examsCount) {
  const m = document.getElementById("uf-side-media");
  const m110 = document.getElementById("uf-side-media110");
  const ex = document.getElementById("uf-side-exams");

  if (!m || !m110 || !ex) return;

  m.textContent = media === null ? "—" : media.toFixed(2);
  m110.textContent = media110 === null ? "—" : media110.toFixed(2);
  ex.textContent = examsCount || 0;
}

function updateStressTheme(media) {
  document.body.classList.remove("stress-low", "stress-mid", "stress-high");

  if (media === null) return;

  if (media >= 28) {
    document.body.classList.add("stress-low");
  } else if (media >= 24) {
    document.body.classList.add("stress-mid");
  } else {
    document.body.classList.add("stress-high");
  }
}

// -------------------------------
// Obiettivi giornalieri
// -------------------------------
function renderGoals() {
  const ul = document.getElementById("uf-goals");
  if (!ul) return;
  ul.innerHTML = "";

  dailyGoals.forEach(goal => {
    const li = document.createElement("li");
    li.classList.add("uf-goal-item");
    if (goal.done) li.classList.add("done");

    li.innerHTML = `
      <label>
        <input type="checkbox" ${goal.done ? "checked" : ""} onchange="toggleGoal(${goal.id})">
        ${goal.label} <span class="uf-goal-xp">+${goal.xp} XP</span>
      </label>
    `;
    ul.appendChild(li);
  });
}

function toggleGoal(id) {
  const goal = dailyGoals.find(g => g.id === id);
  if (!goal) return;
  if (goal.done) return;

  goal.done = true;
  addXP(goal.xp);
  renderGoals();
  saveData();
}

function checkGoals() {
  const g1 = dailyGoals.find(g => g.id === 1);
  const g2 = dailyGoals.find(g => g.id === 2);
  const g3 = dailyGoals.find(g => g.id === 3);

  const examsCount = document.querySelectorAll(".uf-exam-row").length;
  if (g1 && !g1.done && examsCount >= 1) {
    toggleGoal(1);
  }

  if (g2 && !g2.done && goalUpdateCount >= 3) {
    toggleGoal(2);
  }

  if (g3 && !g3.done && goalSortUsed) {
    toggleGoal(3);
  }
}

// -------------------------------
// Avvio
// -------------------------------
loadData();
