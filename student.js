import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LESSON_ID = "module1_lesson1_html_intro_final";
const DRAFT_KEY = "komek_draft_module1_lesson1";

const who = document.getElementById("who");

const lessonProgressText = document.getElementById("lessonProgressText");
const lessonProgressFill = document.getElementById("lessonProgressFill");
const progressCaption = document.getElementById("progressCaption");

const stepTheory = document.getElementById("stepTheory");
const stepTrainer = document.getElementById("stepTrainer");
const stepPractice = document.getElementById("stepPractice");
const stepReflection = document.getElementById("stepReflection");

const stateTheory = document.getElementById("stateTheory");
const stateTrainer = document.getElementById("stateTrainer");
const statePractice = document.getElementById("statePractice");
const stateReflection = document.getElementById("stateReflection");

const completeTheoryBtn = document.getElementById("completeTheoryBtn");

const trainerInput = document.getElementById("trainerInput");
const checkTrainerBtn = document.getElementById("checkTrainerBtn");
const trainerCheckH1 = document.getElementById("trainerCheckH1");
const trainerCheckP = document.getElementById("trainerCheckP");
const trainerStatus = document.getElementById("trainerStatus");
const openPracticeStepBtn = document.getElementById("openPracticeStepBtn");

const practiceInput = document.getElementById("practiceInput");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const previewBtn = document.getElementById("previewBtn");
const submitPracticeBtn = document.getElementById("submitPracticeBtn");
const previewFrame = document.getElementById("previewFrame");
const practiceStatus = document.getElementById("practiceStatus");
const practiceScoreBadge = document.getElementById("practiceScoreBadge");

const practiceCheckHtml = document.getElementById("practiceCheckHtml");
const practiceCheckTitle = document.getElementById("practiceCheckTitle");
const practiceCheckH1 = document.getElementById("practiceCheckH1");
const practiceCheckP = document.getElementById("practiceCheckP");

let currentUser = null;
let profile = null;

const lessonState = {
  theoryDone: false,
  trainerDone: false,
  practiceDone: false
};

function normalize(text){
  return (text || "").toLowerCase();
}

function setProgress(percent, caption){
  lessonProgressText.textContent = percent + "%";
  lessonProgressFill.style.width = percent + "%";
  progressCaption.textContent = caption;
}

function unlockStep(stepEl){
  stepEl.classList.remove("locked-step");
  stepEl.classList.add("active-step");
}

function markItem(el, ok, text){
  el.textContent = `${ok ? "✔" : "✖"} ${text}`;
  el.className = "validation-item " + (ok ? "ok" : "bad");
}

function setStatus(el, text, type = ""){
  el.textContent = text;
  el.className = "status-box" + (type ? ` ${type}` : "");
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
  const hasTitle = t.includes("<title");
  const hasH1 = t.includes("<h1");
  const hasP = t.includes("<p");

  let score = 0;
  if (hasHtml) score += 2;
  if (hasTitle) score += 2;
  if (hasH1) score += 3;
  if (hasP) score += 3;

  return { score, hasHtml, hasTitle, hasH1, hasP };
}

function updateSidebarStates(){
  stateTheory.textContent = lessonState.theoryDone ? "завершено" : "активно";
  stateTrainer.textContent = lessonState.trainerDone ? "завершено" : (lessonState.theoryDone ? "доступно" : "закрыто");
  statePractice.textContent = lessonState.practiceDone ? "завершено" : (lessonState.trainerDone ? "доступно" : "закрыто");
  stateReflection.textContent = lessonState.practiceDone ? "доступно" : "закрыто";
}

function updateLessonProgress(){
  let percent = 0;
  let caption = "Начни с теории";

  if (lessonState.theoryDone) {
    percent = 25;
    caption = "Теория завершена";
  }
  if (lessonState.trainerDone) {
    percent = 60;
    caption = "Тренажёр завершён";
  }
  if (lessonState.practiceDone) {
    percent = 100;
    caption = "Урок завершён";
  }

  setProgress(percent, caption);
  updateSidebarStates();
}

function saveDraftLocal(){
  localStorage.setItem(DRAFT_KEY, practiceInput.value);
}

function loadDraftLocal(){
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    practiceInput.value = saved;
  }
}

function openOnlyIfAvailable(target){
  if (target.classList.contains("locked-step")) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll(".path-step").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);
    openOnlyIfAvailable(target);
  });
});

completeTheoryBtn.addEventListener("click", () => {
  lessonState.theoryDone = true;
  unlockStep(stepTrainer);
  updateLessonProgress();
  stepTrainer.scrollIntoView({ behavior: "smooth", block: "start" });
});

checkTrainerBtn.addEventListener("click", () => {
  const result = calcTrainer(trainerInput.value);

  markItem(trainerCheckH1, result.hasH1, "есть тег <h1>");
  markItem(trainerCheckP, result.hasP, "есть тег <p>");

  if (result.hasH1 && result.hasP) {
    lessonState.trainerDone = true;
    unlockStep(stepPractice);
    openPracticeStepBtn.disabled = false;
    setStatus(trainerStatus, "✅ Тренажёр выполнен. Теперь можно перейти к практике.", "ok");
    updateLessonProgress();
  } else {
    setStatus(trainerStatus, "Добавь оба тега: <h1> и <p>.", "");
  }
});

openPracticeStepBtn.addEventListener("click", () => {
  if (!lessonState.trainerDone) return;
  stepPractice.scrollIntoView({ behavior: "smooth", block: "start" });
});

saveDraftBtn.addEventListener("click", () => {
  saveDraftLocal();
  setStatus(practiceStatus, "Черновик сохранён на этом устройстве.", "ok");
});

previewBtn.addEventListener("click", () => {
  const code = practiceInput.value;
  previewFrame.srcdoc = code;
  saveDraftLocal();

  const result = calcPractice(code);

  markItem(practiceCheckHtml, result.hasHtml, "есть тег <html>");
  markItem(practiceCheckTitle, result.hasTitle, "есть тег <title>");
  markItem(practiceCheckH1, result.hasH1, "есть тег <h1>");
  markItem(practiceCheckP, result.hasP, "есть тег <p>");

  practiceScoreBadge.textContent = `${result.score}/10`;
  setStatus(practiceStatus, `Предпросмотр обновлён. Текущий результат: ${result.score}/10`, "ok");
});

submitPracticeBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const code = practiceInput.value;
  const result = calcPractice(code);

  previewFrame.srcdoc = code;
  saveDraftLocal();

  const payload = {
    lessonId: LESSON_ID,
    module: "HTML",
    title: "Первая web-страница",
    score: result.score,
    checks: {
      html: result.hasHtml,
      title: result.hasTitle,
      h1: result.hasH1,
      p: result.hasP
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

  lessonState.practiceDone = true;
  unlockStep(stepReflection);
  updateLessonProgress();
  stepReflection.scrollIntoView({ behavior: "smooth", block: "start" });
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

  loadDraftLocal();
  updateLessonProgress();
});
