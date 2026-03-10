import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const TEACHER_EMAILS = [
  "bakitova2006@gmail.com"
];

const qs = new URLSearchParams(location.search);
const role = qs.get("role") || "student";

const studentFields = document.getElementById("studentFields");

const emailEl = document.getElementById("email");
const passEl  = document.getElementById("pass");
const fullNameEl = document.getElementById("fullName");
const gradeEl = document.getElementById("grade");
const letterEl = document.getElementById("letter");

const emailHint = document.getElementById("emailHint");
const passHint  = document.getElementById("passHint");
const nameHint  = document.getElementById("nameHint");
const letterHint= document.getElementById("letterHint");
const msg       = document.getElementById("msg");

const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnReset = document.getElementById("btnReset");

if (studentFields) {
  studentFields.hidden = role !== "student";
}

function setHint(el, text, type){
  if(!el) return;
  el.textContent = text || "";
  el.className = "hint" + (type ? ` ${type}` : "");
}

function clearHints(){
  setHint(emailHint, "");
  setHint(passHint, "");
  setHint(nameHint, "");
  setHint(letterHint, "");
  setHint(msg, "");
}

function normalizeEmail(email){
  return (email || "").trim().toLowerCase();
}

function isTeacherEmail(email){
  return TEACHER_EMAILS.includes(normalizeEmail(email));
}

function looksLikeEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(isRegister){
  clearHints();
  let ok = true;

  const email = emailEl.value.trim();
  const pass  = passEl.value;

  if(!email){
    setHint(emailHint, "Введите email.", "error");
    ok = false;
  } else if(!looksLikeEmail(email)){
    setHint(emailHint, "Похоже, email написан неверно (пример: name@mail.com).", "error");
    ok = false;
  } else {
    setHint(emailHint, "Ок", "ok");
  }

  if(!pass){
    setHint(passHint, "Введите пароль.", "error");
    ok = false;
  } else if(pass.length < 6){
    setHint(passHint, "Пароль должен быть минимум 6 символов.", "error");
    ok = false;
  } else {
    setHint(passHint, "Ок", "ok");
  }

  if(role === "student" && isRegister){
    const name = (fullNameEl?.value || "").trim();
    const letter = (letterEl?.value || "").trim();

    if(!name){
      setHint(nameHint, "Введите ФИО (как в журнале).", "error");
      ok = false;
    } else {
      setHint(nameHint, "Ок", "ok");
    }

    if(!letter){
      setHint(letterHint, "Введите букву класса (например: А).", "error");
      ok = false;
    } else {
      setHint(letterHint, "Ок", "ok");
    }
  }

  if(role === "teacher" && !isTeacherEmail(email)){
    setHint(msg, "Этот email не имеет доступа учителя. Войдите с bakitova2006@gmail.com", "error");
    ok = false;
  }

  return ok;
}

function firebaseErrorToText(code){
  switch(code){
    case "auth/invalid-email":
      return "Неверный формат email.";
    case "auth/missing-password":
      return "Введите пароль.";
    case "auth/weak-password":
      return "Слишком простой пароль. Минимум 6 символов.";
    case "auth/email-already-in-use":
      return "Этот email уже зарегистрирован. Нажмите «Войти».";
    case "auth/user-not-found":
      return "Пользователь не найден. Сначала нажмите «Регистрация».";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Неверный пароль или email. Проверьте данные.";
    case "auth/too-many-requests":
      return "Слишком много попыток. Подождите немного и попробуйте снова.";
    case "auth/network-request-failed":
      return "Проблема с интернетом. Попробуйте ещё раз.";
    default:
      return `Ошибка: ${code}`;
  }
}

btnRegister.addEventListener("click", async () => {
  const ok = validateForm(true);
  if(!ok) return;

  try{
    setHint(msg, "Регистрируем...", "");
    const email = normalizeEmail(emailEl.value);
    const pass = passEl.value;

    const cred = await createUserWithEmailAndPassword(auth, email, pass);

    if(role === "student"){
      await setDoc(doc(db, "profiles", cred.user.uid), {
        role: "student",
        fullName: fullNameEl.value.trim(),
        grade: gradeEl.value,
        letter: letterEl.value.trim().toUpperCase(),
        createdAt: serverTimestamp()
      }, { merge: true });

      setHint(msg, "✅ Регистрация успешна! Переходим в кабинет ученика...", "ok");
      location.href = "student-home.html";
    } else {
      setHint(msg, "✅ Учитель зарегистрирован. Переходим в кабинет учителя...", "ok");
      location.href = "teacher.html";
    }
  } catch(e){
    setHint(msg, firebaseErrorToText(e.code), "error");
  }
});

btnLogin.addEventListener("click", async () => {
  const ok = validateForm(false);
  if(!ok) return;

  try{
    setHint(msg, "Входим...", "");
    const email = normalizeEmail(emailEl.value);
    const pass = passEl.value;

    await signInWithEmailAndPassword(auth, email, pass);

    setHint(msg, "✅ Вход успешен! Открываем кабинет...", "ok");
    location.href = (role === "teacher") ? "teacher.html" : "student-home.html";
  } catch(e){
    setHint(msg, firebaseErrorToText(e.code), "error");
  }
});

btnReset.addEventListener("click", async () => {
  const email = normalizeEmail(emailEl.value);

  if(!email){
    setHint(msg, "Введите email для восстановления пароля.", "error");
    return;
  }

  try{
    await sendPasswordResetEmail(auth, email);
    setHint(msg, "Письмо для восстановления отправлено на почту.", "ok");
  } catch(e){
    setHint(msg, firebaseErrorToText(e.code), "error");
  }
});
