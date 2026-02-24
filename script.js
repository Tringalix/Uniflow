// ============================================
// UniFlow – Calcolatore Media Avanzato
// ============================================

console.log("SCRIPT CARICATO ✔️");

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
    return;
  }

  const media = sommaPonderata / totaleCFU;
  const mediaSu110 = (media * 110) / 30;

  mediaValue.textContent = media.toFixed(2);
  media110.textContent = mediaSu110.toFixed(2);

  animateMedia();
}

// -------------------------------
// 4. Animazione neon
// -------------------------------
function animateMedia() {
  const el = document.getElementById("media-value");
  el.style.transition = "0.3s";
  el.style.transform = "scale(1.15)";
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
}

// -------------------------------
// 6. Ripristino automatico
// -------------------------------
function loadData() {
  const data = JSON.parse(localStorage.getItem("uniflow_esami"));
  if (!data) return;

  data.forEach(esame => {
    addExam(esame.voto, esame.cfu);
  });
}

// -------------------------------
// 7. Reset totale
// -------------------------------
function resetAll() {
  document.getElementById("exam-list").innerHTML = "";
  localStorage.removeItem("uniflow_esami");
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
// 9. Avvio
// -------------------------------
loadData();
