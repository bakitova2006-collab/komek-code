import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const who = document.getElementById("who");

const toTrainerBtn = document.getElementById("toTrainerBtn");
const toPracticeBtn = document.getElementById("toPracticeBtn");
const openPracticeBtn = document.getElementById("openPracticeBtn");

const theoryBlock = document.getElementById("theoryBlock");
const trainerBlock = document.getElementById("trainerBlock");
const practiceBlock = document.getElementById("practiceBlock");
const reflectionBlock = document.getElementById("reflectionBlock");

const trainerInput = document.getElementById("trainerInput");
const checkTrainerBtn = document.getElementById("checkTrainerBtn");
const trainerCheckH1 = document.getElementById("trainerCheckH1");
const trainerCheckP = document.getElementById("trainerCheckP");
const trainerStatus = document.getElementById("trainerStatus");

const practiceEditor = document.getElementById("practiceEditor");
const practiceInput = document.getElementById("practiceInput");
const previewBtn = document.getElementById("previewBtn");
const submitPracticeBtn = document.getElementById("submitPracticeBtn");
const previewFrame = document.getElementById("previewFrame");
const practiceStatus = document.getElementById("practiceStatus");
const practiceScoreBadge = document.getElementById("practiceScoreBadge");

const practiceCheckHtml = document.getElementById("practiceCheckHtml");
const practiceCheckH1 = document.getElementById("practiceCheckH1");
const practiceCheckP = document.getElementById("practiceCheckP");
const practiceCheckTitle = document.getElementById("practiceCheckTitle");

const lessonProgressText = document.getElementById("lessonProgressText");
const lessonProgressFill = document.getElementById("lessonProgressFill");

const LESSON_ID = "module1_lesson1_html_intro_practice";

let currentUser = null;
let profile = null;

function setProgress(percent){
  lessonProgressText.textContent = percent + "%";
  lessonProgressFill.style.width = percent + "%";
}

function unlockStep(block){
  block.classList.remove("locked-step");
  block.classList.add("active-step");
}

function setStatus(el, text, type = ""){
  el.textContent = text;
  el.className = "status-box" + (type ? ` ${type}` : "");
}

function markItem(el, ok, text){
  el.textContent = `${ok ? "✔" : "✖"} ${text}`;
  el.className = "validation-item " + (ok ? "ok" : "bad");
}

function normalize(s){
  return (s || "").toLowerCase();
}

function calcTrainer(code){
  const t = normalize(code);
  return {
    hasH1: t.includes("<h1"),
    hasP: t.includes("<p")
  };
}

function calcPractice(code){
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
    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);

    if (target.classList.contains("locked-step")) return;

    document.querySelectorAll(".lesson-nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  setProgress(25);
});

toTrainerBtn.addEventListener("click", () => {
  unlockStep(trainerBlock);
  setProgress(50);
  trainerBlock.scrollIntoView({ behavior: "smooth", block: "start" });
});

checkTrainerBtn.addEventListener("click", () => {
  const result = calcTrainer(trainerInput.value);

  markItem(trainerCheckH1, result.hasH1, "есть тег <h1>");
  markItem(trainerCheckP, result.hasP, "есть тег <p>");

  if (result.hasH1 && result.hasP) {
    setStatus(trainerStatus, "✅ Тренажёр выполнен. Теперь можно перейти к практике.", "ok");
    toPracticeBtn.disabled = false;
  } else {
    setStatus(trainerStatus, "Нужно добавить оба тега: <h1> и <p>.", "");
  }
});

toPracticeBtn.addEventListener("click", () => {
  unlockStep(practiceBlock);
  setProgress(75);
  practiceBlock.scrollIntoView({ behavior: "smooth", block: "start" });
});

openPracticeBtn.addEventListener("click", () => {
  practiceEditor.classList.remove("hidden");
  practiceEditor.scrollIntoView({ behavior: "smooth", block: "start" });
});

previewBtn.addEventListener("click", () => {
  const code = practiceInput.value;
  previewFrame.srcdoc = code;

  const result = calcPractice(code);

  markItem(practiceCheckHtml, result.hasHtml, "есть тег <html>");
  markItem(practiceCheckH1, result.hasH1, "есть тег <h1>");
  markItem(practiceCheckP, result.hasP, "есть тег <p>");
  markItem(practiceCheckTitle, result.hasTitle, "есть тег <title>");

  practiceScoreBadge.textContent = `${result.score}/10`;
  setStatus(practiceStatus, `Предпросмотр обновлён. Текущий результат: ${result.score}/10`, "ok");
});

submitPracticeBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const code = practiceInput.value;
  const result = calcPractice(code);

  previewFrame.srcdoc = code;

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
    code,
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

  practiceScoreBadge.textContent = `${result.score}/10`;
  setStatus(practiceStatus, `✅ Практическая работа сдана учителю. Балл: ${result.score}/10`, "ok");

  unlockStep(reflectionBlock);
  setProgress(100);
});
