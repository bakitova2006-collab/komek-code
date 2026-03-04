// student.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const who = document.getElementById("who");
const cssInput = document.getElementById("cssInput");
const checkBtn = document.getElementById("checkBtn");
const submitBtn = document.getElementById("submitBtn");
const status = document.getElementById("status");

const LESSON_ID = "lesson_14_3";
let currentUser = null;
let profile = null;

function setStatus(t){ status.textContent = t || ""; }

function normalize(s){ return (s||"").toLowerCase().replace(/\s+/g,""); }

function calcScore(css){
  const n = normalize(css);
  const hasBg = n.includes("background-image:") || (n.includes("background:") && (n.includes("linear-gradient") || n.includes("url(")));
  const hasRadius = n.includes("border-radius:15px") || n.includes("border-radius:15");
  const hasColor = n.includes("color:#005a8a");
  let score = 0;
  if (hasBg) score += 4;
  if (hasRadius) score += 3;
  if (hasColor) score += 3;
  return { score, hasBg, hasRadius, hasColor };
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "auth.html?role=student";
    return;
  }
  currentUser = user;

  const pRef = doc(db, "profiles", user.uid);
  const snap = await getDoc(pRef);
  profile = snap.exists() ? snap.data() : null;

  const label = profile
    ? `${profile.fullName || user.email} • ${profile.grade || "?"}${profile.letter || ""}`
    : user.email;

  who.textContent = "Вы вошли: " + label;
});

checkBtn.addEventListener("click", () => {
  const r = calcScore(cssInput.value);
  setStatus(`Проверка: ${r.score}/10 | bg:${r.hasBg} radius:${r.hasRadius} color:${r.hasColor}`);
});

submitBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const r = calcScore(cssInput.value);
  const payload = {
    lessonId: LESSON_ID,
    score: r.score,
    checks: { bg: r.hasBg, radius: r.hasRadius, color: r.hasColor },
    css: cssInput.value, // можно убрать, если не хочешь хранить код
    student: {
      uid: currentUser.uid,
      email: currentUser.email,
      fullName: profile?.fullName || "",
      grade: profile?.grade || "",
      letter: profile?.letter || ""
    },
    submittedAt: serverTimestamp()
  };

  // submissions/{lessonId}_{uid}
  await setDoc(doc(db, "submissions", `${LESSON_ID}_${currentUser.uid}`), payload, { merge: true });
  setStatus(`✅ Сдано! Балл: ${r.score}/10`);
});
