/* ============================================
   UniFlow – Calcolatore Media Universitaria
   Script definitivo e ottimizzato
============================================ */

// Aggiunge una nuova riga (esame)
function addExam() {
  const container = document.getElementById("exam-list");

  const row = document.createElement("div");
  row.className = "uf-exam-row";

  row.innerHTML = `
    <input type="number" class="voto" placeholder="Voto (18-30)" min="18" max="30">
    <input type="number" class="cfu" placeholder="CFU" min="1">
    <button class="remove-btn" onclick="removeExam(this)">✕</button>
  `;

  container.appendChild(row);
  calculateMedia();
}

// Rimuove una riga
function removeExam(button) {
  button.parentElement.remove();
  calculateMedia();
}

// Ricalcola ogni volta che l’utente scrive
document.addEventListener("input", calculateMedia);

// Calcolo della media
function calculateMedia() {
  const voti = [...document.querySelectorAll(".voto")].map(v => Number(v.value));
  const cfu = [...document.querySelectorAll(".cfu")].map(c => Number(c.value));

  let totaleCFU = 0;
  let sommaPonderata = 0;

  for (let i = 0; i < voti.length; i++) {
    const voto = voti[i];
    const crediti = cfu[i];

    // Validazione semplice
    if (voto >= 18 && voto <= 30 && crediti > 0) {
      totaleCFU += crediti;
      sommaPonderata += voto * crediti;
    }
  }

  // Nessun dato valido → reset
  if (totaleCFU === 0) {
    document.getElementById("media-value").textContent = "—";
    document.getElementById("media-110").textContent = "—";
    return;
  }

  // Calcoli
  const media = sommaPonderata / totaleCFU;
  const media110 = (media * 110) / 30;

  // Output
  document.getElementById("media-value").textContent = media.toFixed(2);
  document.getElementById("media-110").textContent = media110.toFixed(2);
}
