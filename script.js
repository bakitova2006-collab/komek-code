const trainerSection = document.getElementById("trainerSection");
const openTrainer = document.getElementById("openTrainer");
const backBtn = document.getElementById("backBtn");
const checkBtn = document.getElementById("checkBtn");

const cssInput = document.getElementById("cssInput");
const bayanCard = document.getElementById("bayanCard");

const vBg = document.getElementById("vBg");
const vRadius = document.getElementById("vRadius");
const vColor = document.getElementById("vColor");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resetProgress = document.getElementById("resetProgress");

function setProgress(value) {
  const v = Math.max(0, Math.min(100, value));
  progressBar.style.width = v + "%";
  progressText.textContent = v + "%";
  localStorage.setItem("progress", String(v));
}

function loadProgress() {
  const saved = Number(localStorage.getItem("progress"));
  if (!Number.isNaN(saved)) setProgress(saved);
}
loadProgress();

openTrainer.addEventListener("click", () => {
  trainerSection.hidden = false;
  trainerSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

backBtn.addEventListener("click", () => {
  trainerSection.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

resetProgress.addEventListener("click", (e) => {
  e.preventDefault();
  setProgress(0);
});

function normalize(s) {
  return s.toLowerCase().replace(/\s+/g, "");
}

checkBtn.addEventListener("click", () => {
  const css = cssInput.value;

  // Применяем CSS к карточке (простая безопасная вставка через <style>)
  let styleTag = document.getElementById("userStyle");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "userStyle";
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = css;

  // Проверки (простые, но рабочие)
  const n = normalize(css);

  const hasBg =
    n.includes("background-image:") ||
    n.includes("background:") && (n.includes("linear-gradient") || n.includes("url("));

  const hasRadius = n.includes("border-radius:15px") || n.includes("border-radius:15");
  const hasColor = n.includes("color:#005a8a");

  vBg.checked = !!hasBg;
  vRadius.checked = !!hasRadius;
  vColor.checked = !!hasColor;

  // Если все три — увеличим прогресс :)
  if (hasBg && hasRadius && hasColor) {
    const current = Number(localStorage.getItem("progress")) || 0;
    setProgress(Math.min(100, current + 5));
  }
});
