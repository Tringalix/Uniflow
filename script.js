/* ============================================
   UniFlow – Calcolatore Media Universitaria
   Script riscritto da zero
============================================ */

function addExam() {
  const container = document.getElementById("exam-list");

  const row = document.createElement("div");
  row.className = "uf-exam-row";

  row.innerHTML = `
    <input type="number" placeholder="Voto (18-30)" class="voto" min="18" max="30">
    <input type="number" placeholder="CFU" class="cfu" min="1">
    <button onclick="removeExam(this)">✕</button>
  `;

  container.appendChild(row);
  calculateMedia();
}

function removeExam(btn) {
  btn.parentElement.remove();
  calculateMedia();
}

document.addEventListener("input", calculateMedia);

function calculateMedia() {
  const voti = [...document.querySelectorAll(".voto")].map(v => Number(v.value));
  const cfu = [...document.querySelectorAll(".cfu")].map(c => Number(c.value));

  let totaleCFU = 0;
  let sommaPonderata = 0;

  for (let i = 0; i < voti.length; i++) {
    const voto = voti[i];
    const crediti = cfu[i];

    if (voto >= 18 && voto <= 30 && crediti > 0) {
      totaleCFU += crediti;
      sommaPonderata += voto * crediti;
    }
  }

  if (totaleCFU === 0) {
    document.getElementById("media-value").textContent = "—";
    document.getElementById("media-110").textContent = "—";
    return;
  }

  const media = sommaPonderata / totaleCFU;
  const media110 = (media * 110) / 30;

  document.getElementById("media-value").textContent = media.toFixed(2);
  document.getElementById("media-110").textContent = media110.toFixed(2);
}
