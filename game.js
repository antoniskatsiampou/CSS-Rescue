
/* ---------- STATE ---------- */
const STATE = {
  currentLevel: 0,
  hackerProgress: 0,        // 0–100, game over στο 100
  score: 0,
  combo: 0,
  startTime: null,
  totalHintsUsed: 0,
  totalMistakes: 0,
  totalSolutionsViewed: 0,          // πόσες φορές πατήθηκε «Δες λύση» (για τα αστέρια)
  inventory: {
    hint: 3,
    antivirus: 1,
  },
  attemptsThisLevel: 0,
  mistakesThisLevel: 0,             // λάθος προσπάθειες σε αυτό το επίπεδο (για πόντους)
  hintsUsedThisLevel: 0,
  solutionViewedThisLevel: false,   // σημαία για τη λύση
  startedLevelAt: null,
  sound: true,
  finished: false,
};

const STORAGE_KEY = "css-rescue-v2";

/* ---------- SECURITY HELPERS ---------- */

const safeNum = (v) => Number.isFinite(Number(v)) ? Math.floor(Number(v)) : 0;

/* ---------- DOM REFS ---------- */
const $ = (sel) => document.querySelector(sel);
const $id = (id) => document.getElementById(id);

const ui = {
  // screens
  introScreen: $id("intro-screen"),
  gameScreen:  $id("game-screen"),
  startBtn:    $id("start-btn"),

  // topbar stats
  hackerFill:    $id("hacker-fill"),
  hackerBar:     $id("hacker-bar"),
  hackerLabel:   $id("hacker-label"),
  scoreLabel:    $id("score-label"),
  comboLabel:    $id("combo-label"),
  levelProgress: $id("level-progress"),

  // inventory
  hintCount:     $id("inv-hint-count"),
  antivirusCount:$id("inv-antivirus-count"),
  antivirusBtn:  $id("inv-antivirus"),
  hintBtn:       $id("hint-btn"),

  // game area
  levelTitle:    $id("level-title"),
  levelSubtitle: $id("level-subtitle"),
  storyText:     $id("story-text"),
  instructionsList: $id("instructions-list"),
  editorReadonly: $id("editor-readonly"),
  editor:        $id("css-editor"),
  preview:       $id("preview-frame"),
  feedback:      $id("feedback"),

  // action buttons
  submitBtn:   $id("submit-btn"),
  resetBtn:    $id("reset-btn"),
  solutionBtn: $id("solution-btn"),

  // dialogs 
  hintDialog:          $id("hint-dialog"),
  hintBody:            $id("hint-body"),
  levelCompleteDialog: $id("level-complete-dialog"),
  levelCompleteTitle:  $id("level-complete-title"),
  levelCompleteBody:   $id("level-complete-body"),
  nextLevelBtn:        $id("next-level-btn"),
  gameOverDialog:      $id("game-over-dialog"),
  gameOverTitle:       $id("game-over-title"),
  gameOverBody:        $id("game-over-body"),
  restartBtn:          $id("restart-btn"),
  victoryDialog:       $id("victory-dialog"),
  victoryBody:         $id("victory-body"),
  playAgainBtn:        $id("play-again-btn"),

  // misc
  soundToggle: $id("sound-toggle"),
};

/* ---------------------- ΗΧΟΣ Web Audio API ----------------- */
const Sound = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };
  const tone = (freq, dur = 0.15, type = "sine", vol = 0.15) => {
    if (!STATE.sound) return;
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.stop(c.currentTime + dur);
    } catch (e) { /* ignore */ }
  };
  const seq = (notes) => {
    if (!STATE.sound) return;
    notes.forEach((n, i) => setTimeout(() => tone(n.f, n.d || 0.12, n.t || "sine", n.v || 0.15), i * 110));
  };
  return {
    error:     () => seq([{ f: 200, t: "sawtooth", d: 0.18, v: 0.2 }, { f: 150, t: "sawtooth", d: 0.22, v: 0.2 }]),
    click:     () => tone(800, 0.04, "square", 0.08),
    hint:      () => tone(880, 0.18, "triangle", 0.12),
    levelUp:   () => seq([{ f: 523 }, { f: 659 }, { f: 784 }, { f: 1047, d: 0.3 }]),
    victory:   () => seq([{ f: 523 }, { f: 659 }, { f: 784 }, { f: 1047 }, { f: 784 }, { f: 1047 }, { f: 1319, d: 0.4 }]),
    gameOver:  () => seq([{ f: 400, t: "sawtooth", d: 0.2 }, { f: 300, t: "sawtooth", d: 0.2 }, { f: 200, t: "sawtooth", d: 0.4 }]),
    antivirus: () => seq([{ f: 1200, d: 0.08 }, { f: 800, d: 0.08 }, { f: 1200, d: 0.08 }]),
  };
})();

/* ------------------------------------- PREVIEW — Live CSS στο iframe ------------------------- */
function renderPreview(css) {
  const level = LEVELS[STATE.currentLevel];
  if (!level) return;
  const doc = ui.preview.contentDocument;
  
  // 1. Γράφουμε το HTML χωρίς το input του χρήστη (Safe)
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>${level.baseStyles || ""}</style>
<style id="user-css"></style>
</head><body>${level.targetHTML}</body></html>`);
  doc.close();

  // 2. Περνάμε το CSS ως textContent 
  const userStyleTag = doc.getElementById("user-css");
  if (userStyleTag) {
    userStyleTag.textContent = css;
  }
}

function getComputed(selector, prop) {
  try {
    const el = ui.preview.contentDocument.querySelector(selector);
    if (!el) return null;
    return window.getComputedStyle(el).getPropertyValue(prop).trim();
  } catch { return null; }
}

/* ------------------------------------- VALIDATION ------------------------------------- */
function validateLevel() {
  const level = LEVELS[STATE.currentLevel];
  const failures = [];
  for (const check of level.checks) {
    const val = getComputed(check.selector, check.property);
    if (val === null) {
      failures.push("Δεν βρέθηκε: " + check.selector);
    } else if (!check.test(val)) {
      failures.push(check.msg);
    }
  }
  return failures;
}

/* ------------------------------------- UI UPDATES ------------------------------------- */
function updateStats() {
  const hp = STATE.hackerProgress;

  // Hacker bar
  ui.hackerFill.style.width = hp + "%";
  ui.hackerLabel.textContent = Math.round(hp) + "%";
  ui.hackerBar.setAttribute("aria-valuenow", Math.round(hp));

  // Bar color classes
  let cls = "stat-fill hacker ";
  if (hp < 40) cls += "ok";
  else if (hp < 70) cls += "warn";
  else cls += "danger";
  ui.hackerFill.className = cls;

  // Mini avatar pulse when hacker is winning
  const avatar = $(".hacker-stat .mini-avatar");
  if (avatar) {
    avatar.classList.toggle("winning", hp > 60);
  }

  // Score / combo
  ui.scoreLabel.textContent = STATE.score.toString().padStart(5, "0");
  ui.comboLabel.textContent = "x" + (STATE.combo + 1);

  // Inventory
  ui.hintCount.textContent = STATE.inventory.hint;
  ui.antivirusCount.textContent = STATE.inventory.antivirus;
  ui.antivirusBtn.disabled = STATE.inventory.antivirus <= 0 || STATE.hackerProgress <= 0;
  ui.hintBtn.disabled = STATE.inventory.hint <= 0;

  // Level progress
  ui.levelProgress.textContent = `Επίπεδο ${STATE.currentLevel + 1} / ${LEVELS.length}`;

  // Level dots
  updateLevelDots();
}

function updateLevelDots() {
  const dots = document.querySelectorAll(".level-dot");
  dots.forEach((dot) => {
    const lvl = parseInt(dot.dataset.level, 10);
    dot.classList.remove("completed", "current");
    if (lvl < STATE.currentLevel) {
      dot.classList.add("completed");
    } else if (lvl === STATE.currentLevel) {
      dot.classList.add("current");
    }
  });
}

function showFeedback(msg, type = "info") {
  ui.feedback.innerHTML = msg;
  ui.feedback.className = "feedback " + type;
  ui.feedback.classList.remove("hidden");
}

function clearFeedback() {
  ui.feedback.classList.add("hidden");
  ui.feedback.innerHTML = "";
}

/* ------------------------------------- LEVEL FLOW ------------------------------------- */
function loadLevel(index) {
  STATE.currentLevel = index;
  STATE.attemptsThisLevel = 0;
  STATE.mistakesThisLevel = 0;
  STATE.hintsUsedThisLevel = 0;
  STATE.solutionViewedThisLevel = false;
  STATE.startedLevelAt = Date.now();

  const level = LEVELS[index];
  ui.levelTitle.textContent = level.title;
  ui.levelSubtitle.textContent = level.subtitle;
  ui.storyText.textContent = level.story;

  // Instructions
  ui.instructionsList.innerHTML = level.instructions
    .map((ins, i) => `<li><span class="instr-num">${i + 1}</span><span class="instr-text">${ins}</span></li>`)
    .join("");

  // Editor — readonly hints + editable skeleton
  ui.editorReadonly.textContent = level.readonlyHint || "";
  ui.editor.value = level.starterCSS;
  renderPreview(level.starterCSS);

  clearFeedback();
  updateStats();
  save();
}

function nextLevel() {
  if (STATE.currentLevel + 1 >= LEVELS.length) {
    victory();
    return;
  }
  loadLevel(STATE.currentLevel + 1);
}

/* --------------------------- ACTIONS -------------------------------------- */
function onSubmit() {
  Sound.click();
  renderPreview(ui.editor.value);

  setTimeout(() => {
    const failures = validateLevel();
    STATE.attemptsThisLevel++;

    if (failures.length === 0) {
      /* ---- ΕΠΙΤΥΧΙΑ ---- */
      Sound.levelUp();
      const level = LEVELS[STATE.currentLevel];

      /* --- ΠΟΝΤΟΙ: Βάση 100 − ποινές + combo --- */
      const BASE = 100, MISTAKE_COST = 15, HINT_COST = 20, FLOOR = 10;
      let earned = 0;
      const breakdown = [];

      if (STATE.solutionViewedThisLevel) {
        earned = 0;
        STATE.combo = 0;
        breakdown.push("Είδες τη λύση → <b>0 πόντοι</b>");
      } else {
        earned = BASE;
        breakdown.push(`Βάση: <b>+${BASE}</b>`);

        if (STATE.mistakesThisLevel > 0) {
          const d = STATE.mistakesThisLevel * MISTAKE_COST;
          earned -= d;
          breakdown.push(`${STATE.mistakesThisLevel} λάθη: <b>−${d}</b>`);
        }
        if (STATE.hintsUsedThisLevel > 0) {
          const d = STATE.hintsUsedThisLevel * HINT_COST;
          earned -= d;
          breakdown.push(`${STATE.hintsUsedThisLevel} βοήθειες: <b>−${d}</b>`);
        }
        if (earned < FLOOR) earned = FLOOR;

        // Combo ΜΟΝΟ σε καθαρή λύση (χωρίς λάθη & χωρίς βοήθειες)
        if (STATE.mistakesThisLevel === 0 && STATE.hintsUsedThisLevel === 0) {
          STATE.combo++;
          const comboBonus = STATE.combo * 20;
          earned += comboBonus;
          breakdown.push(`Καθαρή λύση! Combo 🔥 x${STATE.combo}: <b>+${comboBonus}</b>`);
        } else {
          STATE.combo = 0;
        }
      }

      STATE.score += earned;

      // Rewards
      const rewards = level.reward || {};
      Object.entries(rewards).forEach(([k, v]) => {
        STATE.inventory[k] = (STATE.inventory[k] || 0) + v;
      });
      const rewardText = Object.entries(rewards)
        .map(([k, v]) => {
          const icons = { hint: "💡", antivirus: "🛡️" };
          const labels = { hint: v === 1 ? "βοήθεια" : "βοήθειες", antivirus: "antivirus" };
          return `${icons[k] || ""} +${v} ${labels[k] || k}`;
        }).join(", ");

      // Level complete dialog
      ui.levelCompleteTitle.innerHTML = `
        <span class="material-symbols-outlined inline-icon">celebration</span>
        ${level.title.split(":")[0]} — Επιτυχία!`;

      ui.levelCompleteBody.innerHTML = `
        <p><b>Έσωσες αυτό το κομμάτι του eShop!</b></p>
        <div class="reward-box">
          <div class="reward-total">+${earned} πόντοι</div>
          <ul class="reward-breakdown">${breakdown.map(b => `<li>${b}</li>`).join("")}</ul>
          ${rewardText ? `<div class="reward-gain">Ανταμοιβή: ${rewardText}</div>` : ""}
        </div>
        ${STATE.currentLevel + 1 < LEVELS.length
          ? `<p class="next-tease">Επόμενο: <i>${LEVELS[STATE.currentLevel + 1].title}</i></p>`
          : `<p class="next-tease">Ετοιμάσου για τα αποτελέσματα!</p>`}`;

      ui.nextLevelBtn.innerHTML = STATE.currentLevel + 1 < LEVELS.length
        ? `<span class="material-symbols-outlined inline-icon">arrow_forward</span> Επόμενο Επίπεδο`
        : `<span class="material-symbols-outlined inline-icon">emoji_events</span> Δες τα αποτελέσματα`;

      ui.levelCompleteDialog.showModal();
      updateStats();
      save();

    } else {
      /* ---- ΑΠΟΤΥΧΙΑ ---- */
      Sound.error();

      const penalty = LEVELS[STATE.currentLevel].penalty || 8;
      STATE.hackerProgress = Math.min(100, STATE.hackerProgress + penalty);
      STATE.totalMistakes++;
      STATE.mistakesThisLevel++;
      STATE.combo = 0;

      // Glitch
      document.body.classList.add("glitch");
      setTimeout(() => document.body.classList.remove("glitch"), 350);

      showFeedback(`
        <b>❌ Ακόμη δεν είναι σωστό!</b>
        <ul>${failures.map(f => `<li>${f}</li>`).join("")}</ul>
        <small>Δοκίμασε ξανά. Χρησιμοποίησε 💡 βοήθεια αν κολλήσεις.</small>
      `, "error");

      updateStats();
      save();

      if (STATE.hackerProgress >= 100) {
        gameOver();
      }
    }
  }, 100);
}

function onHint() {
  if (STATE.inventory.hint <= 0) return;
  Sound.hint();
  const level = LEVELS[STATE.currentLevel];
  const hint = level.hints[STATE.hintsUsedThisLevel] || level.hints[level.hints.length - 1];

  STATE.inventory.hint--;
  STATE.hintsUsedThisLevel++;
  STATE.totalHintsUsed++;

  // Η βοήθεια δίνει έδαφος στον hacker 
  const hackerCost = Math.round((level.penalty || 8) / 2);
  STATE.hackerProgress = Math.min(100, STATE.hackerProgress + hackerCost);

  ui.hintBody.innerHTML = `
    <h3>Βοήθεια #${STATE.hintsUsedThisLevel}</h3>
    <p>${hint}</p>
    <small>Κόστος: −20 πόντοι στη λύση και +${hackerCost}% στον hacker.</small>`;
  ui.hintDialog.showModal();
  updateStats();
  save();

  if (STATE.hackerProgress >= 100) {
    ui.hintDialog.close();
    gameOver();
  }
}

/* ---------- CUSTOM CONFIRM ---------- */
function gameConfirm(message, heading = "Επιβεβαίωση", icon = "help_outline", theme = "theme-cyan") {
  return new Promise((resolve) => {
    const dialog = $id("confirm-dialog");
    const body = dialog.querySelector(".dialog-body");
    const msgEl = $id("confirm-dialog-message");
    const headingEl = $id("confirm-dialog-heading");
    const iconEl = $id("confirm-dialog-icon");
    const yesBtn = $id("confirm-yes-btn");
    const noBtn = $id("confirm-no-btn");

    body.classList.remove("theme-cyan", "theme-danger", "theme-neutral");
    body.classList.add(theme);
    iconEl.textContent = icon;
    headingEl.textContent = heading;
    msgEl.textContent = message;
    dialog.showModal();

    function cleanup() {
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("click", onNo);
      dialog.close();
    }
    function onYes() { cleanup(); resolve(true); }
    function onNo()  { cleanup(); resolve(false); }

    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}

async function onReset() {
  const ok = await gameConfirm("Θα χάσεις τις αλλαγές σου σε αυτό το επίπεδο.", "Reset", "restart_alt", "theme-neutral");
  if (!ok) return;
  Sound.click();
  const level = LEVELS[STATE.currentLevel];
  ui.editor.value = level.starterCSS;
  renderPreview(level.starterCSS);
  clearFeedback();
}

async function onSolution() {
  const ok = await gameConfirm("Θα δεις τη λύση. Δεν θα πάρεις πόντους για αυτό το επίπεδο και χάνεις ένα αστέρι στο τέλος.", "Δες Λύση", "visibility", "theme-danger");
  if (!ok) return;
  Sound.click();
  const level = LEVELS[STATE.currentLevel];
  ui.editor.value = level.solution;
  renderPreview(level.solution);

  if (!STATE.solutionViewedThisLevel) STATE.totalSolutionsViewed++;
  STATE.solutionViewedThisLevel = true;
  STATE.combo = 0;

  updateStats();
  showFeedback("👁️ Είδες τη λύση. Κατανόησέ την και πάτησε «Έλεγχος» για να συνεχίσεις. (0 πόντοι, −1 αστέρι)", "info");
  save();
}

function useAntivirus() {
  if (STATE.inventory.antivirus <= 0 || STATE.hackerProgress <= 0) return;
  Sound.antivirus();
  STATE.inventory.antivirus--;
  STATE.hackerProgress = Math.max(0, STATE.hackerProgress - 25);
  updateStats();
  save();
  showFeedback("🛡️ Antivirus! −25% στον hacker", "info");
  setTimeout(clearFeedback, 2500);
}

function toggleSound() {
  STATE.sound = !STATE.sound;
  const icon = ui.soundToggle.querySelector(".material-symbols-outlined");
  icon.textContent = STATE.sound ? "volume_up" : "volume_off";
  ui.soundToggle.setAttribute("aria-pressed", STATE.sound);
  save();
}

/* -------------------------------- GAME OVER / VICTORY ---------------------------------- */
function gameOver() {
  Sound.gameOver();
  STATE.finished = true;

  ui.gameOverTitle.innerHTML = `
    <span class="material-symbols-outlined inline-icon">dangerous</span>
    Ο Hacker νίκησε`;

  ui.gameOverBody.innerHTML = `
    <p>Ο Hacker κατέστρεψε τόσο κώδικα που το PixelMart κατέρρευσε.</p>
    <ul>
      <li>Σκορ: <b>${safeNum(STATE.score)}</b></li>
      <li>Έφτασες: <b>Επίπεδο ${safeNum(STATE.currentLevel) + 1} / ${LEVELS.length}</b></li>
      <li>Λάθη: <b>${safeNum(STATE.totalMistakes)}</b></li>
    </ul>
    <p><i>Tip: Χρησιμοποίησε 🛡️ antivirus όταν ο hacker κερδίζει έδαφος!</i></p>`;

  ui.gameOverDialog.showModal();
}

/* Αστέρια: λάθη + βοήθειες ορίζουν την επίδοση, οι λύσεις βάζουν ταβάνι.
   3 αστέρια = καμία λύση & ≤3 (λάθη+βοήθειες). Κάθε "Δες λύση" κόβει αστέρι. */
function computeStars() {
  const sols = STATE.totalSolutionsViewed || 0;
  const combined = (STATE.totalMistakes || 0) + (STATE.totalHintsUsed || 0);

  const maxBySolutions = sols === 0 ? 3 : (sols === 1 ? 2 : 1);
  let perf;
  if (combined <= 3) perf = 3;
  else if (combined <= 8) perf = 2;
  else perf = 1;

  return Math.max(1, Math.min(maxBySolutions, perf));
}

function victory() {
  Sound.victory();
  STATE.finished = true;
  const totalTime = Math.round((Date.now() - STATE.startTime) / 1000);
  const min = Math.floor(totalTime / 60);
  const sec = totalTime % 60;

  const stars = computeStars();
  const rating = `${"★".repeat(stars)}<span class="rating-empty">${"☆".repeat(3 - stars)}</span>`;

  ui.victoryBody.innerHTML = `
    <p>Ο Hacker νικήθηκε.</p>
    <div class="final-stats">
      <div class="rating">${rating}</div>
      <ul>
        <li>Τελικό σκορ: <b>${safeNum(STATE.score)}</b></li>
        <li>Χρόνος: <b>${safeNum(min)}:${safeNum(sec).toString().padStart(2, "0")}</b></li>
        <li>Λάθη: <b>${safeNum(STATE.totalMistakes)}</b></li>
        <li>Βοήθειες: <b>${safeNum(STATE.totalHintsUsed)}</b></li>
        <li>Λύσεις που είδες: <b>${safeNum(STATE.totalSolutionsViewed)}</b></li>
        <li>Hacker progress: <b>${safeNum(Math.round(STATE.hackerProgress))}%</b></li>
      </ul>
    </div>
    <p class="grad-msg">Έμαθες τις βασικές εντολές CSS: <b>χρώματα, padding, borders, flexbox, navigation, grid, positioning</b> </p>`;

  ui.victoryDialog.showModal();
  localStorage.removeItem(STORAGE_KEY);
}

/* ------------------------------------- SAVE / LOAD ------------------------------------- */
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...STATE,
      editorContent: ui.editor ? ui.editor.value : "",
    }));
  } catch { /* ignore */ }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;

    // Validation 
    const lvl = data.currentLevel;
    if (!Number.isInteger(lvl) || lvl < 0 || lvl >= LEVELS.length) return null;

    return data;
  } catch { return null; }
}

/* ------------------------------------- INIT -------------------------------------- */
function start(fromSave = null) {
  ui.introScreen.classList.add("hidden");
  ui.gameScreen.classList.remove("hidden");

  if (fromSave) {
    
    STATE.currentLevel         = safeNum(fromSave.currentLevel);
    STATE.hackerProgress       = Math.min(100, Math.max(0, safeNum(fromSave.hackerProgress)));
    STATE.score                = Math.max(0, safeNum(fromSave.score));
    STATE.combo                = Math.max(0, safeNum(fromSave.combo));
    STATE.totalHintsUsed       = Math.max(0, safeNum(fromSave.totalHintsUsed));
    STATE.totalMistakes        = Math.max(0, safeNum(fromSave.totalMistakes));
    STATE.totalSolutionsViewed = Math.max(0, safeNum(fromSave.totalSolutionsViewed));
    STATE.mistakesThisLevel    = Math.max(0, safeNum(fromSave.mistakesThisLevel));
    STATE.hintsUsedThisLevel   = Math.max(0, safeNum(fromSave.hintsUsedThisLevel));
    STATE.attemptsThisLevel    = Math.max(0, safeNum(fromSave.attemptsThisLevel));
    STATE.solutionViewedThisLevel = !!fromSave.solutionViewedThisLevel;
    STATE.finished             = !!fromSave.finished;
    STATE.sound                = fromSave.sound !== false; // default true
    STATE.startTime            = Number.isFinite(Number(fromSave.startTime)) ? Number(fromSave.startTime) : Date.now();
    STATE.startedLevelAt       = Number.isFinite(Number(fromSave.startedLevelAt)) ? Number(fromSave.startedLevelAt) : Date.now();
    // Inventory: only recognized keys, clamped to [0, 99]
    const inv = fromSave.inventory && typeof fromSave.inventory === "object" ? fromSave.inventory : {};
    STATE.inventory = {
      hint:      Math.min(99, Math.max(0, safeNum(inv.hint))),
      antivirus: Math.min(99, Math.max(0, safeNum(inv.antivirus))),
    };

    loadLevel(STATE.currentLevel);
    if (fromSave.editorContent && typeof fromSave.editorContent === "string") {
      
      ui.editor.value = fromSave.editorContent;
      renderPreview(fromSave.editorContent);
    }
  } else {
    Object.assign(STATE, {
      currentLevel: 0,
      hackerProgress: 0,
      score: 0,
      combo: 0,
      totalHintsUsed: 0,
      totalMistakes: 0,
      totalSolutionsViewed: 0,
      inventory: { hint: 3, antivirus: 1 },
      mistakesThisLevel: 0,
      solutionViewedThisLevel: false,
      finished: false,
      startTime: Date.now(),
    });
    loadLevel(0);
  }
}

function init() {
  // Start button — αν υπάρχει αποθηκευμένη πρόοδος, ζήτα επιβεβαίωση πριν τη σβήσεις
  ui.startBtn.addEventListener("click", async () => {
    const existing = loadSave();
    if (existing && !existing.finished) {
      const ok = await gameConfirm(
        "Υπάρχει αποθηκευμένη πρόοδος. Θα ξεκινήσεις από την αρχή και θα τη χάσεις.",
        "Επανεκκίνηση", "restart_alt", "theme-danger");
      if (!ok) return;
    }
    localStorage.removeItem(STORAGE_KEY);
    start();
  });

  // Game actions
  ui.submitBtn.addEventListener("click", onSubmit);
  ui.hintBtn.addEventListener("click", onHint);
  ui.resetBtn.addEventListener("click", onReset);
  ui.solutionBtn.addEventListener("click", onSolution);
  ui.antivirusBtn.addEventListener("click", useAntivirus);
  ui.soundToggle.addEventListener("click", toggleSound);

  // Brand logo — back to intro
  $id("brand-btn").addEventListener("click", () => {
    save();
    location.reload();
  });

  // Dialog buttons
  ui.nextLevelBtn.addEventListener("click", () => {
    ui.levelCompleteDialog.close();
    nextLevel();
  });

  ui.restartBtn.addEventListener("click", () => {
    ui.gameOverDialog.close();
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  ui.playAgainBtn.addEventListener("click", () => {
    ui.victoryDialog.close();
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  // Live preview on typing
  ui.editor.addEventListener("input", () => renderPreview(ui.editor.value));

  // Enter → κράτα το ίδιο indentation με την τρέχουσα γραμμή (όχι παραπάνω)
  ui.editor.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const indent = (value.slice(lineStart, start).match(/^[ \t]*/) || [""])[0];
    const insert = "\n" + indent;
    el.value = value.slice(0, start) + insert + value.slice(end);
    el.selectionStart = el.selectionEnd = start + insert.length;
    renderPreview(el.value);
  });

  // Ctrl+Enter shortcut
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  });

  // Check for saved game - show continue button if save exists
  const saved = loadSave();
  const continueBtn = $id("continue-btn");
  if (saved && !saved.finished) {
    continueBtn.classList.remove("hidden");
    // Υπάρχει πρόοδος: το πράσινο κουμπί ξεκινά απ' την αρχή → «ΕΠΑΝΕΚΚΙΝΗΣΗ»
    const startLabel = ui.startBtn.querySelector(".start-btn-label");
    if (startLabel) startLabel.textContent = "ΕΠΑΝΕΚΚΙΝΗΣΗ";
    continueBtn.addEventListener("click", () => {
      start(saved);
    });
  }
}

window.addEventListener("DOMContentLoaded", init);

/* ---------------------------------------- CUSTOM CURSOR — Dot + Trail --------------------------------*/
(() => {
  const dot = document.createElement("div");
  dot.classList.add("cursor-dot");
  document.body.appendChild(dot);

  let lastTrail = 0;
  const TRAIL_INTERVAL = 30;

  // Track which dialog is currently open (top layer)
  let activeDialog = null;

  function getTrailParent() {
    return activeDialog || document.body;
  }

  document.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";

    const now = Date.now();
    if (now - lastTrail > TRAIL_INTERVAL) {
      lastTrail = now;
      const trail = document.createElement("div");
      trail.classList.add("cursor-trail");
      trail.style.left = e.clientX + "px";
      trail.style.top = e.clientY + "px";
      getTrailParent().appendChild(trail);
      trail.addEventListener("animationend", () => trail.remove());
    }
  });

  // Click effect
  document.addEventListener("mousedown", () => dot.classList.add("clicking"));
  document.addEventListener("mouseup", () => dot.classList.remove("clicking"));

  // Hide dot when mouse leaves window
  document.addEventListener("mouseleave", () => dot.style.opacity = "0");
  document.addEventListener("mouseenter", () => dot.style.opacity = "1");

  // Hide dot over the CSS editor (show only native text cursor there)
  const editor = $id("css-editor");
  editor.addEventListener("mouseenter", () => dot.style.opacity = "0");
  editor.addEventListener("mouseleave", () => dot.style.opacity = "1");

  // Move cursor dot into/out of dialogs so it stays visible above the backdrop
  const dialogs = document.querySelectorAll("dialog");
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName !== "open") continue;
      const dialog = m.target;
      if (dialog.hasAttribute("open")) {
        activeDialog = dialog;
        dialog.appendChild(dot);
      } else {
        activeDialog = null;
        document.body.appendChild(dot);
      }
    }
  });

  dialogs.forEach((d) => observer.observe(d, { attributes: true }));
})();
