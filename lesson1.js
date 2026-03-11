const runBtn = document.getElementById("runBtn")
const preview = document.getElementById("preview")

runBtn.onclick = () => {

const code = document.getElementById("code").value

preview.srcdoc = code

}

document.getElementById("finishBtn").onclick = () => {

localStorage.setItem("lesson1_done","true")

alert("Урок завершён!")

location.href = "student-home.html"

}
