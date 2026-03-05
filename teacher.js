// teacher.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const teacherInfo = document.getElementById("teacherInfo");
const tableWrap = document.getElementById("tableWrap");
const filterGrade = document.getElementById("filterGrade");
const reloadBtn = document.getElementById("reloadBtn");
const count = document.getElementById("count");

// Доступ только для этого email
const TEACHER_EMAIL = "bakitova2006@gmail.com";
const isTeacherEmail = (email) => (email || "").toLowerCase() === TEACHER_EMAIL;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "auth.html?role=teacher";
    return;
  }
  if (!isTeacherEmail(user.email)) {
    alert("Нет доступа учителя.");
    location.href = "index.html";
    return;
  }

  teacherInfo.textContent = "Учитель: " + user.email;
  await loadTable();
});

reloadBtn.addEventListener("click", loadTable);
filterGrade.addEventListener("change", loadTable);

async function loadTable() {
  tableWrap.innerHTML = "Загрузка...";
  const gradeFilter = filterGrade.value;

  const snap = await getDocs(collection(db, "submissions"));
  const rows = [];
  snap.forEach(d => rows.push(d.data()));

  const filtered = rows.filter(r => {
    if (gradeFilter === "all") return true;
    return String(r.student?.grade || "") === String(gradeFilter);
  });

  filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

  tableWrap.innerHTML = makeTable(filtered);
  count.textContent = `Записей: ${filtered.length}`;
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function makeTable(rows) {
  if (!rows.length) return "<div class='muted'>Пока нет сданных работ.</div>";

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Ученик</th>
          <th>Класс</th>
          <th>Урок</th>
          <th>Балл</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${esc(r.student?.fullName || "")}</td>
            <td>${esc(r.student?.grade || "")}${esc(r.student?.letter || "")}</td>
            <td>${esc(r.lessonId || "")}</td>
            <td><strong>${esc(r.score || 0)}/10</strong></td>
            <td>${esc(r.student?.email || "")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
