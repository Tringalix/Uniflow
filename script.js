/* ============================================
   UniFlow – Calcolatore Media Universitaria
   Script definitivo e compatibile
============================================ */

// Aggiunge una nuova riga di input
function addExam() {
  const container = document.getElementById("exam-list");

  const row = document.createElement("div");
  row.classList.add("uf-exam-row");

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

// Funzione principale
function calculateMedia() {
  const votiInputs = document.querySelectorAll(".voto");
  const cfuInputs = document.querySelectorAll(".cfu");

  let totaleCFU = 0;
  let sommaPonderata = 0;

  votiInputs.forEach((votoInput, index) => {
    const voto = Number(votoInput.value);
    const crediti = Number(cfuInputs[index].value);

    if (voto >= 18 && voto <= 30 && crediti > 0) {
      totaleCFU += crediti;
      sommaPonderata += voto * crediti;
    }
  });

  const mediaValue = document.getElementById("media-value");
  const media110Value = document.getElementById("media-110");

  if (totaleCFU === 0) {
    mediaValue.textContent = "—";
    media110Value.textContent = "—";
    return;
  }

  const media = sommaPonderata / totaleCFU;
  const media110 = (media * 110) / 30;

  mediaValue.textContent = media.toFixed(2);
  media110Value.textContent = media110.toFixed(2);
}
