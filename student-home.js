import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const studentName = document.getElementById("studentName");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "auth.html?role=student";
    return;
  }

  const snap = await getDoc(doc(db, "profiles", user.uid));

  if (snap.exists()) {
    const data = snap.data();
    studentName.textContent = `Привет, ${data.fullName}! Выбери модуль и продолжай обучение.`;
  } else {
    studentName.textContent = `Привет! Продолжай обучение.`;
  }
});
