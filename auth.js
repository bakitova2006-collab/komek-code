// auth.js
import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Впиши сюда СВОЙ email (и при желании других учителей)
const TEACHER_EMAILS = [
  "yourteacher@gmail.com"
];

const qs = new URLSearchParams(location.search);
const role = qs.get("role") || "student"; // student | teacher

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const studentFields = document.getElementById("studentFields");

const emailEl = document.getElementById("email");
const passEl = document.getElementById("pass");
const fullNameEl = document.getElementById("fullName");
const gradeEl = document.getElementById("grade");
const letterEl = document.getElementById("letter");

const msg = document.getElementById("msg");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

function setMessage(t){ msg.textContent = t || ""; }

title.textContent = role === "teacher" ? "Вход учителя" : "Вход ученика";
subtitle.textContent = role === "teacher"
  ? "Доступ только для учителя (по email)."
  : "Войдите или зарегистрируйтесь, чтобы сохранять результаты.";
studentFields.hidden = role !== "student";

// Проверка: может ли этот email быть учителем
function isTeacherEmail(email){
  return TEACHER_EMAILS.map(e => e.toLowerCase()).includes((email || "").toLowerCase());
}

btnRegister.addEventListener("click", async () => {
  try {
    setMessage("");
    const email = emailEl.value.trim();
    const pass = passEl.value.trim();

    // ❗ Запрещаем регистрацию "учителя" всем, кроме белого списка
    if (role === "teacher" && !isTeacherEmail(email)) {
      return setMessage("Этот email не имеет доступа учителя. Используйте вход ученика.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pass);

    // Если ученик — создаём профиль
    if (role === "student") {
      const fullName = fullNameEl.value.trim();
      const grade = gradeEl.value;
      const letter = letterEl.value.trim().toUpperCase();

      await setDoc(doc(db, "profiles", cred.user.uid), {
        role: "student",
        fullName,
        grade,
        letter,
        createdAt: serverTimestamp()
      }, { merge: true });

      location.href = "student.html";
      return;
    }

    // Если учитель — просто переходим
    location.href = "teacher.html";
  } catch (e) {
    setMessage(e.message);
  }
});

btnLogin.addEventListener("click", async () => {
  try {
    setMessage("");
    const email = emailEl.value.trim();
    const pass = passEl.value.trim();

    // Учитель — только email из списка
    if (role === "teacher" && !isTeacherEmail(email)) {
      return setMessage("Нет доступа учителя для этого email.");
    }

    await signInWithEmailAndPassword(auth, email, pass);

    if (role === "teacher") location.href = "teacher.html";
    else location.href = "student.html";
  } catch (e) {
    setMessage(e.message);
  }
});
