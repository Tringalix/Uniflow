/* ------------------------------
   UNI FLOW – SCRIPT PRINCIPALE
   Compatibile con login popup (uf_)
--------------------------------*/

/* ------------------------------
   TEMA (CHIARO / SCURO)
--------------------------------*/
function toggleTheme() {
  document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light");

  const mode = document.body.classList.contains("theme-dark") ? "dark" : "light";
  localStorage.setItem("uf_theme", mode);
}

(function loadTheme() {
  const saved = localStorage.getItem("uf_theme");
  if (saved === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
  }
})();

/* ------------------------------
   SIDEBAR
--------------------------------*/
function toggleSidebar() {
  document.getElementById("uf-sidebar").classList.toggle("open");
}

/* ------------------------------
   FOCUS MODE
--------------------------------*/
function toggleFocus() {
  document.body.classList.toggle("uf-focus");
}

/* ------------------------------
   COUNTDOWN SESSIONE
--------------------------------*/
function updateCountdown() {
  const target = new Date("2026-06-10");
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById("session-countdown").textContent = "È arrivata!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById("session-countdown").textContent = days + " giorni";
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ------------------------------
   XP & LIVELLO
--------------------------------*/
let uf_xp = parseInt(localStorage.getItem("uf_xp") || "0");
let uf_level = parseInt(localStorage.getItem("uf_level") || "1");

function uf_addXP(amount) {
  uf_xp += amount;

  if (uf_xp >= uf_level * 100) {
    uf_xp = 0;
    uf_level++;
  }

  localStorage.setItem("uf_xp", uf_xp);
  localStorage.setItem("uf_level", uf_level);

  document.getElementById("uf-level").textContent = uf_level;
  document.getElementById("uf-xp-total").textContent = uf_xp;
  document.getElementById("uf-side-level").textContent = uf_level;
  document.getElementById("uf-side-xp").textContent = uf_xp;
}

(function loadXP() {
  document.getElementById("uf-level").textContent = uf_level;
  document.getElementById("uf-xp-total").textContent = uf_xp;
  document.getElementById("uf-side-level").textContent = uf_level;
  document.getElementById("uf-side-xp").textContent = uf_xp;
})();

/* ------------------------------
   MEDIA (placeholder)
--------------------------------*/
function calculateMedia() {
  // Qui puoi aggiungere la tua logica reale
  document.getElementById("media-value").textContent = "28.3";
  document.getElementById("media-110").textContent = "102.9";
  document.getElementById("uf-side-media").textContent = "28.3";
  document.getElementById("uf-side-media110").textContent = "102.9";
}

/* ------------------------------
   LAUREA (placeholder)
--------------------------------*/
function calculateLaurea() {
  const media = parseFloat(document.getElementById("laurea-media110").value || 0);
  const bonus = parseFloat(document.getElementById("laurea-bonus").value || 0);
  const tesi = parseFloat(document.getElementById("laurea-tesi").value || 0);

  let result = media + bonus + tesi;
  document.getElementById("laurea-result").textContent = result;
}

/* ------------------------------
   PLANNER (placeholder)
--------------------------------*/
function calculateTarget() {
  const current = parseFloat(document.getElementById("planner-current110").value || 0);
  const done = parseFloat(document.getElementById("planner-cfu-done").value || 0);
  const left = parseFloat(document.getElementById("planner-cfu-left").value || 0);
  const target = parseFloat(document.getElementById("planner-target110").value || 0);

  if (left === 0) {
    document.getElementById("planner-result").textContent = "—";
    return;
  }

  const needed = (target * (done + left) - current * done) / left;
  document.getElementById("planner-result").textContent = needed.toFixed(2);
}

/* ------------------------------
   RIASSUNTI AI (placeholder)
--------------------------------*/
function uf_generateSummary() {
  const text = document.getElementById("summary-input").value.trim();
  if (!text) return uf_toast("Incolla un testo da riassumere");

  const short = text.length > 200 ? text.slice(0, 200) + "..." : text;
  const long  = text.length > 600 ? text.slice(0, 600) + "..." : text;

  const sentences = text.split(".").filter(s => s.trim().length > 0);
  const points = sentences.slice(0, 5);
  const questions = sentences.slice(0, 5).map(s => "Cosa significa: " + s.trim() + "?");

  document.getElementById("summary-short").textContent = short;
  document.getElementById("summary-long").textContent = long;

  const ulPoints = document.getElementById("summary-points");
  ulPoints.innerHTML = "";
  points.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.trim();
    ulPoints.appendChild(li);
  });

  const ulQ = document.getElementById("summary-questions");
  ulQ.innerHTML = "";
  questions.forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    ulQ.appendChild(li);
  });

  document.getElementById("summary-output").classList.remove("uf-hidden");
}

/* ------------------------------
   TOOLTIP / TOAST
--------------------------------*/
function uf_toast(msg) {
  const t = document.getElementById("uf-toast");
  t.textContent = msg;
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), 2000);
}

/* ------------------------------
   AVVIO
--------------------------------*/
console.log("UniFlow script.js caricato correttamente.");

/* ------------------------------
   PREMIUM CHECK
--------------------------------*/
function uf_isPremium() {
  return localStorage.getItem("uf_premium") === "true";
}

function uf_applyPremium() {
  if (!uf_isPremium()) return;

  document.body.classList.add("uf-premium");

  // Badge Premium
  const header = document.querySelector(".uf-header-actions");
  if (header && !document.getElementById("uf-premium-badge")) {
    const badge = document.createElement("span");
    badge.id = "uf-premium-badge";
    badge.textContent = "⭐ Premium";
    badge.style.marginLeft = "10px";
    badge.style.color = "gold";
    header.appendChild(badge);
  }

  // XP Boost
  window.uf_xpBoost = 1.2;
}

(function(){
  uf_applyPremium();
})();
