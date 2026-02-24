// ===============================
// UniFlow – Calcolatore Media
// Script definitivo e sicuro
// ===============================

// Test per verificare che il file sia caricato
console.log("SCRIPT CARICATO ✔️");

// Aggiunge una riga di esame
function addExam() {
  console.log("Aggiungo una riga…");

  const container = document.getElementById("exam-list");
  if (!container) {
    console.error("❌ ERRORE: #exam-list NON TROVATO");
    return;
  }

  const row = document.createElement("div");
  row.classList.add("uf-exam-row");

  row.innerHTML = `
    <input type="number" class="voto" placeholder="Voto (18-30)" min="18" max="30">
    <input type="number" class="cfu" placeholder="CFU" min="1">
    <button onclick="removeExam(this)">✕</button>
  `;

  container.appendChild(row);
  calculateMedia();
}

// Rimuove una riga
function removeExam(button) {
  console.log("Rimuovo una riga…");
  button.parentElement.remove();
  calculateMedia();
}

// Ricalcola ogni volta che l’utente scrive
document.addEventListener("input", calculateMedia);

// Calcolo della media
function calculateMedia() {
  console.log("Calcolo media…");

  const voti = document.querySelectorAll(".voto");
  const cfu = document.querySelectorAll(".cfu");

  if (voti.length === 0) {
    console.warn("Nessun esame inserito");
    return;
  }

  let totaleCFU = 0;
  let sommaPonderata = 0;

  voti.forEach((v, i) => {
    const voto = Number(v.value);
    const crediti = Number(cfu[i].value);

    if (voto >= 18 && voto <= 30 && crediti > 0) {
      totaleCFU += crediti;
      sommaPonderata += voto * crediti;
    }
  });

  const mediaValue = document.getElementById("media-value");
  const media110 = document.getElementById("media-110");

  if (!mediaValue || !media110) {
    console.error("❌ ERRORE: ID media-value o media-110 mancanti");
    return;
  }

  if (totaleCFU === 0) {
    mediaValue.textContent = "—";
    media110.textContent = "—";
    return;
  }

  const media = sommaPonderata / totaleCFU;
  const mediaSu110 = (media * 110) / 30;

  mediaValue.textContent = media.toFixed(2);
  media110.textContent = mediaSu110.toFixed(2);
}
