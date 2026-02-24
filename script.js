// ============================================
// UniFlow – SCRIPT COMPLETO E STABILE
// ============================================

// Rendo tutte le funzioni globali
window.showLogin = showLogin;
window.showRegister = showRegister;
window.register = register;
window.login = login;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.toggleFocus = toggleFocus;
window.toggleSidebar = toggleSidebar;
window.addExam = addExam;
window.removeExam = removeExam;
window.calculateLaurea = calculateLaurea;
window.calculateTarget = calculateTarget;
window.sortByVoto = sortByVoto;
window.sortByCFU = sortByCFU;
window.resetAll = resetAll;
window.toggleSimulation = toggleSimulation;
window.importCSV = importCSV;
window.exportJSON = exportJSON;
window.downloadPrint = downloadPrint;

// ============================================
// LOGIN / REGISTER
// ============================================

function showLogin() {
  document.getElementById("uf-login-screen").classList.remove("hidden");
  document.getElementById("uf-register-screen").classList.add("hidden");
}

function showRegister() {
  document.getElementById("uf-login-screen").classList.add("hidden");
  document.getElementById("uf-register-screen").classList.remove("hidden");
}

function register() {
  const emailEl = document.getElementById("register-email");
  const passEl = document.getElementById("register-password");

  if (!emailEl || !passEl) {
    alert("ERRORE: gli input non esistono nell’HTML.");
    return;
  }

  const email = emailEl.value.trim();
  const pass = passEl.value.trim();

  if (!email || !pass) {
    showToast("Compila tutti i campi");
    return;
  }

  const users = JSON.parse(localStorage.getItem("uniflow_users") || "{}");

  if (users[email]) {
    showToast("Email già registrata");
    return;
  }

  users[email] = { password: pass };
  localStorage.setItem("uniflow_users", JSON.stringify(users));

  showToast("Registrazione completata");
  showLogin();
}

function login() {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value.trim();

  const users = JSON.parse(localStorage.getItem("uniflow_users") || "{}");

  if (!users[email] || users[email].password !== pass) {
    showToast("Credenziali errate");
    return;
  }

  localStorage.setItem("uniflow_logged", email);
  hideLoginScreens();
  showToast("Accesso effettuato");
}

function logout() {
  localStorage.removeItem("uniflow_logged");
  showLogin();
  showToast("Logout effettuato");
}

function hideLoginScreens() {
  document.getElementById("uf-login-screen").classList.add("hidden");
  document.getElementById("uf-register-screen").classList.add("hidden");
}

function checkLogin() {
  const logged = localStorage.getItem("uniflow_logged");
  if (!logged) showLogin();
  else hideLoginScreens();
}

// ============================================
// TOAST
// ============================================

function showToast(msg) {
  const t = document.getElementById("uf-toast");
  t.textContent = msg;
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), 2000);
}

// ============================================
// TEMA / FOCUS / SIDEBAR
// ============================================

function toggleTheme() {
  document.body.classList.toggle("theme-dark");
}

function toggleFocus() {
  document.body.classList.toggle("focus-mode");
}

function toggleSidebar() {
  document.getElementById("uf-sidebar").classList.toggle("open");
}

// ============================================
// CALCOLATORE MEDIA
// ============================================

function addExam(voto = "", cfu = "") {
  const list = document.getElementById("exam-list");

  const row = document.createElement("div");
  row.classList.add("uf-exam-row");

  row.innerHTML = `
    <input type="number" class="voto" placeholder="Voto" value="${voto}">
    <input type="number" class="cfu" placeholder="CFU" value="${cfu}">
    <button onclick="removeExam(this)">✕</button>
  `;

  list.appendChild(row);
  calculateMedia();
  saveData();
}

function removeExam(btn) {
  btn.parentElement.remove();
  calculateMedia();
  saveData();
}

document.addEventListener("input", () => {
  calculateMedia();
  saveData();
});

function calculateMedia() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];
  let somma = 0;
  let totCFU = 0;

  rows.forEach(r => {
    const v = Number(r.querySelector(".voto").value);
    const c = Number(r.querySelector(".cfu").value);
    if (v >= 18 && v <= 30 && c > 0) {
      somma += v * c;
      totCFU += c;
    }
  });

  const media = totCFU ? somma / totCFU : null;
  const media110 = media ? (media * 110) / 30 : null;

  document.getElementById("media-value").textContent = media ? media.toFixed(2) : "—";
  document.getElementById("media-110").textContent = media110 ? media110.toFixed(2) : "—";

  if (media110 !== null) {
    document.getElementById("laurea-media110").value = media110.toFixed(2);
  }
}

// ============================================
// SALVATAGGIO
// ============================================

function saveData() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];
  const data = rows.map(r => ({
    voto: r.querySelector(".voto").value,
    cfu: r.querySelector(".cfu").value
  }));
  localStorage.setItem("uniflow_esami", JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("uniflow_esami") || "[]");
  data.forEach(e => addExam(e.voto, e.cfu));
}

// ============================================
// ORDINAMENTO
// ============================================

function sortByVoto() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];
  rows.sort((a, b) =>
    Number(b.querySelector(".voto").value) -
    Number(a.querySelector(".voto").value)
  );
  const list = document.getElementById("exam-list");
  list.innerHTML = "";
  rows.forEach(r => list.appendChild(r));
}

function sortByCFU() {
  const rows = [...document.querySelectorAll(".uf-exam-row")];
  rows.sort((a, b) =>
    Number(b.querySelector(".cfu").value) -
    Number(a.querySelector(".cfu").value)
  );
  const list = document.getElementById("exam-list");
  list.innerHTML = "";
  rows.forEach(r => list.appendChild(r));
}

// ============================================
// RESET
// ============================================

function resetAll() {
  document.getElementById("exam-list").innerHTML = "";
  localStorage.removeItem("uniflow_esami");
  calculateMedia();
}

// ============================================
// SIMULATORE LAUREA
// ============================================

function calculateLaurea() {
  const m = Number(document.getElementById("laurea-media110").value);
  const b = Number(document.getElementById("laurea-bonus").value);
  const t = Number(document.getElementById("laurea-tesi").value);
  const r = document.getElementById("laurea-round").value;

  if (!m) {
    showToast("Inserisci una media valida");
    return;
  }

  let voto = m + (b || 0) + (t || 0);

  if (r === "floor") voto = Math.floor(voto);
  if (r === "ceil") voto = Math.ceil(voto);
  if (r === "nearest") voto = Math.round(voto);

  if (voto > 110) voto = 110;

  document.getElementById("laurea-result").textContent = voto.toFixed(2);
}

// ============================================
// PLANNER
// ============================================

function calculateTarget() {
  const current = Number(document.getElementById("planner-current110").value);
  const done = Number(document.getElementById("planner-cfu-done").value);
  const left = Number(document.getElementById("planner-cfu-left").value);
  const target = Number(document.getElementById("planner-target110").value);

  if (!current || !done || !left || !target) {
    document.getElementById("planner-result").textContent = "Compila tutto";
    return;
  }

  const c30 = (current * 30) / 110;
  const t30 = (target * 30) / 110;

  const needed = (t30 * (done + left) - c30 * done) / left;

  document.getElementById("planner-result").textContent =
    needed > 30 ? "Impossibile" : needed.toFixed(2);
}

// ============================================
// IMPORT / EXPORT
// ============================================

function importCSV() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv";

  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.split("\n");
      document.getElementById("exam-list").innerHTML = "";
      lines.forEach(l => {
        const p = l.split(",");
        if (p.length >= 2) addExam(p[0], p[1]);
      });
      calculateMedia();
      saveData();
    };
    reader.readAsText(file);
  };

  input.click();
}

function exportJSON() {
  const data = localStorage.getItem("uniflow_esami") || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "uniflow_backup.json";
  a.click();
}

function downloadPrint() {
  window.print();
}

// ============================================
// AVVIO
// ============================================

loadData();
checkLogin();
calculateMedia();
