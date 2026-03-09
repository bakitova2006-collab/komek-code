import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const who = document.getElementById("who");
const htmlInput = document.getElementById("htmlInput");
const checkBtn = document.getElementById("checkBtn");
const submitBtn = document.getElementById("submitBtn");
const status = document.getElementById("status");
const scoreBadge = document.getElementById("scoreBadge");

const checkHtml = document.getElementById("checkHtml");
const checkH1 = document.getElementById("checkH1");
const checkP = document.getElementById("checkP");
const checkTitle = document.getElementById("checkTitle");

const lessonProgressText = document.getElementById("lessonProgressText");
const lessonProgressFill = document.getElementById("lessonProgressFill");

const LESSON_ID = "module1_lesson1_html_intro";

let currentUser = null;
let profile = null;

function setStatus(text, type = "") {
  status.textContent = text;
  status.className = "status-box" + (type ? ` ${type}` : "");
}

function markItem(el, ok, text) {
  el.textContent = `${ok ? "✔" : "✖"} ${text}`;
  el.className = "validation-item " + (ok ? "ok" : "bad");
}

function normalize(s) {
  return (s || "").toLowerCase();
}

function calculateProgress(score) {
  const percent = Math.min(100, Math.max(0, score * 10));
  lessonProgressText.textContent = percent + "%";
  lessonProgressFill.style.width = percent + "%";
}

function calcScore(code) {
  const t = normalize(code);

  const hasHtml = t.includes("<html");
  const hasH1 = t.includes("<h1");
  const hasP = t.includes("<p");
  const hasTitle = t.includes("<title");

  let score = 0;
  if (hasHtml) score += 2;
  if (hasTitle) score += 2;
  if (hasH1) score += 3;
  if (hasP) score += 3;

  return { score, hasHtml, hasH1, hasP, hasTitle };
}

document.querySelectorAll(".lesson-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lesson-nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "auth.html?role=student";
    return;
  }

  currentUser = user;

  const snap = await getDoc(doc(db, "profiles", user.uid));
  profile = snap.exists() ? snap.data() : null;

  who.textContent = profile
    ? `Вы вошли: ${profile.fullName} • ${profile.grade}${profile.letter}`
    : `Вы вошли: ${user.email}`;
});

checkBtn.addEventListener("click", () => {
  const result = calcScore(htmlInput.value);

  markItem(checkHtml, result.hasHtml, "есть тег <html>");
  markItem(checkH1, result.hasH1, "есть тег <h1>");
  markItem(checkP, result.hasP, "есть тег <p>");
  markItem(checkTitle, result.hasTitle, "есть тег <title>");

  scoreBadge.textContent = `${result.score}/10`;
  calculateProgress(result.score);

  setStatus(`Проверка завершена: ${result.score}/10`, "ok");
});

submitBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const result = calcScore(htmlInput.value);

  scoreBadge.textContent = `${result.score}/10`;
  calculateProgress(result.score);

  const payload = {
    lessonId: LESSON_ID,
    module: "HTML",
    title: "Первая web-страница",
    score: result.score,
    checks: {
      html: result.hasHtml,
      h1: result.hasH1,
      p: result.hasP,
      title: result.hasTitle
    },
    code: htmlInput.value,
    student: {
      uid: currentUser.uid,
      email: currentUser.email,
      fullName: profile?.fullName || "",
      grade: profile?.grade || "",
      letter: profile?.letter || ""
    },
    submittedAt: serverTimestamp()
  };

  await setDoc(doc(db, "submissions", `${LESSON_ID}_${currentUser.uid}`), payload, { merge: true });

  setStatus(`✅ Работа сохранена. Балл: ${result.score}/10`, "ok");
});
