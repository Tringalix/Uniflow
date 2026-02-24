document.addEventListener("DOMContentLoaded", () => {

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

  // ===============================
  // LOGIN SYSTEM
  // ===============================
  function showLogin() {
    document.getElementById("uf-login-screen").classList.remove("hidden");
    document.getElementById("uf-register-screen").classList.add("hidden");
  }

  function showRegister() {
    document.getElementById("uf-login-screen").classList.add("hidden");
    document.getElementById("uf-register-screen").classList.remove("hidden");
  }

  window.showLogin = showLogin;
  window.showRegister = showRegister;

  function register() {
    const email = document.getElementById("register-email").value.trim();
    const pass = document.getElementById("register-password").value.trim();

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

  window.register = register;

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

  window.login = login;

  function logout() {
    localStorage.removeItem("uniflow_logged");
    showLogin();
    showToast("Logout effettuato");
  }

  window.logout = logout;

  function hideLoginScreens() {
    document.getElementById("uf-login-screen").classList.add("hidden");
    document.getElementById("uf-register-screen").classList.add("hidden");
  }

  function checkLogin() {
    const logged = localStorage.getItem("uniflow_logged");
    if (!logged) {
      showLogin();
    } else {
      hideLoginScreens();
    }
  }

  // ===============================
  // TOAST
  // ===============================
  function showToast(msg) {
    const toast = document.getElementById("uf-toast");
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2000);
  }

  window.showToast = showToast;

  // ===============================
  // TEMA
  // ===============================
  function toggleTheme() {
    document.body.classList.toggle("theme-dark");
  }

  window.toggleTheme = toggleTheme;

  // ===============================
  // FOCUS MODE
  // ===============================
  function toggleFocus() {
    document.body.classList.toggle("focus-mode");
  }

  window.toggleFocus = toggleFocus;

  // ===============================
  // SIDEBAR
  // ===============================
  function toggleSidebar() {
    document.getElementById("uf-sidebar").classList.toggle("open");
  }

  window.toggleSidebar = toggleSidebar;

  // ===============================
  // CALCOLATORE MEDIA
  // ===============================
  function addExam(voto = "", cfu = "", simulated = false) {
    const container = document.getElementById("exam-list");

    const row = document.createElement("div");
    row.classList.add("uf-exam-row");
    if (simulated) row.classList.add("uf-exam-simulated");

    row.innerHTML = `
      <input type="number" class="voto" placeholder="Voto" value="${voto}">
      <input type="number" class="cfu" placeholder="CFU" value="${cfu}">
      <button onclick="removeExam(this)">✕</button>
    `;

    container.appendChild(row);
    calculateMedia();
    saveData();
  }

  window.addExam = addExam;

  function removeExam(btn) {
    btn.parentElement.remove();
    calculateMedia();
    saveData();
  }

  window.removeExam = removeExam;

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

    syncLaureaInput(media110);
  }

  function syncLaureaInput(m) {
    if (m !== null) {
      document.getElementById("laurea-media110").value = m.toFixed(2);
    }
  }

  // ===============================
  // SALVATAGGIO
  // ===============================
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

  // ===============================
  // LAUREA
  // ===============================
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

  window.calculateLaurea = calculateLaurea;

  // ===============================
  // PLANNER
  // ===============================
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

  window.calculateTarget = calculateTarget;

  // ===============================
  // AVVIO
  // ===============================
  loadData();
  checkLogin();

});
