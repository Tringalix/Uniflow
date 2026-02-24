// ============================================
// UniFlow – Super Calcolatore Media
// ============================================

console.log("SCRIPT CARICATO ✔️");

let mediaHistory = [];
let simulationMode = false;

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
// Countdown sessione
// -------------------------------
(function initCountdown() {
  const target = new Date();
  target.setMonth(5); // giugno (0-based)
  target.setDate(15);
  target.setHours(9, 0, 0, 0);

  function update() {
    const now = new Date();
    let diff = target - now;
    if (diff <= 0) {
      document.getElementById("session-countdown").textContent = "È tempo di spaccare in sessione 💥";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const text = `${days} giorni, ${hours} ore`;
    document.getElementById("session-countdown").textContent = text;
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
// XP label
// -------------------------------
function addXP(amount = 10) {
  const el = document.getElementById("xp-label");
  if (!el) return;
  const match = el.textContent.match(/\+(\d+)/);
  let current = match ? Number(match[1]) : 0;
  current += amount;
  el.textContent = `+${current} oggi · Continua così 👀`;
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
// 1. Aggiungi esame
// -------------------------------
function addExam(voto = "", crediti = "", simulated = false) {
  const container = document.getElementById("exam-list");

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
// 2. Rimuovi esame
// -------------------------------
function removeExam(button) {
  button.parentElement.remove();
  calculateMedia();
  saveData();
  addXP(2);
}

// -------------------------------
// 3. Calcolo media
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
    mediaValue.textContent = "—";
    media110.textContent = "—";
    updateMediaHistory(null);
    syncLaureaInput(null);
    return;
  }

  const media = sommaPonderata / totaleCFU;
  const mediaSu110 = (media * 110) / 30;

  mediaValue.textContent = media.toFixed(2);
  media110.textContent = mediaSu110.toFixed(2);

  animateMedia();
  updateMediaHistory(media);
  syncLaureaInput(mediaSu110);
}

// -------------------------------
// 4. Animazione media
// -------------------------------
function animateMedia() {
  const el = document.getElementById("media-value");
  el.style.transition = "0.25s";
  el.style.transform = "scale(1.12)";
  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 200);
}

// -------------------------------
// 5. Salvataggio automatico
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
}

// -------------------------------
// 6. Ripristino automatico
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
}

// -------------------------------
// 7. Reset totale
// -------------------------------
function resetAll() {
  document.getElementById("exam-list").innerHTML = "";
  localStorage.removeItem("uniflow_esami");
  localStorage.removeItem("uniflow_media_history");
  mediaHistory = [];
  renderMediaHistory();
  calculateMedia();
  showToast("Tutto resettato");
}

// -------------------------------
// 8. Ordinamento
// -------------------------------
function sortByVoto() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];

  rows.sort((a, b) => {
    const votoA = Number(a.querySelector(".voto").value);
    const votoB = Number(b.querySelector(".voto").value);
    return votoB - votoA;
  });

  const container = document.getElementById("exam-list");
  container.innerHTML = "";
  rows.forEach(r => container.appendChild(r));

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
  container.innerHTML = "";
  rows.forEach(r => container.appendChild(r));

  saveData();
  showToast("Ordinato per CFU");
}

// -------------------------------
// 9. Progressione media
// -------------------------------
function updateMediaHistory(media) {
  if (media === null) {
    return;
  }
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
// 10. Simulatore voto di laurea
// -------------------------------
function syncLaureaInput(media110) {
  const input = document.getElementById("laurea-media110");
  if (!input) return;
  if (media110 === null) {
    input.value = "";
  } else {
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
// 11. Planner: media necessaria
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
// 12. Import CSV
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

  document.getElementById("exam-list").innerHTML = "";

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
// 13. Export JSON
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
// 14. Esporta PDF (stampa)
// -------------------------------
function downloadPrint() {
  showToast("Apri la finestra di stampa per salvare in PDF");
  window.print();
}

// -------------------------------
// 15. Avvio
// -------------------------------
loadData();
