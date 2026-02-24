// ============================================
// UniFlow – Calcolatore Media Avanzato
// ============================================

console.log("SCRIPT CARICATO ✔️");

// -------------------------------
// Tema chiaro/scuro
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
  } else {
    document.body.classList.add("theme-dark");
  }
})();

// -------------------------------
// 1. Aggiungi esame
// -------------------------------
function addExam(voto = "", crediti = "") {
  const container = document.getElementById("exam-list");

  const row = document.createElement("div");
  row.classList.add("uf-exam-row");

  row.innerHTML = `
    <input type="number" class="voto" placeholder="Voto (18-30)" min="18" max="30" value="${voto}">
    <input type="number" class="cfu" placeholder="CFU" min="1" value="${crediti}">
    <button onclick="removeExam(this)">✕</button>
  `;

  container.appendChild(row);
  calculateMedia();
  saveData();
}

// -------------------------------
// 2. Rimuovi esame
// -------------------------------
function removeExam(button) {
  button.parentElement.remove();
  calculateMedia();
  saveData();
}

// -------------------------------
// 3. Calcolo media
// -------------------------------
document.addEventListener("input", () => {
  calculateMedia();
  saveData();
});

let mediaHistory = [];

function calculateMedia() {
  const voti = [...document.querySelectorAll(".voto")].map(v => Number(v.value));
  const cfu = [...document.querySelectorAll(".cfu")].map(c => Number(c.value));

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
// 4. Animazione neon
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
  const voti = [...document.querySelectorAll(".voto")].map(v => v.value);
  const cfu = [...document.querySelectorAll(".cfu")].map(c => c.value);

  const data = voti.map((v, i) => ({
    voto: v,
    cfu: cfu[i]
  }));

  localStorage.setItem("uniflow_esami", JSON.stringify(data));
  localStorage.setItem("uniflow_media_history", JSON.stringify(mediaHistory));
}

// -------------------------------
// 6. Ripristino automatico
// -------------------------------
function loadData() {
  const data = JSON.parse(localStorage.getItem("uniflow_esami"));
  if (data && Array.isArray(data)) {
    data.forEach(esame => {
      addExam(esame.voto, esame.cfu);
    });
  } else {
    // almeno una riga vuota
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
}

// -------------------------------
// 8. Ordinamento automatico
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
}

// -------------------------------
// 9. Progressione media (mini grafico)
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
    const height = 30 + (value / 110) * 70; // 30–100px
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
}

// -------------------------------
// 11. Avvio
// -------------------------------
loadData();
