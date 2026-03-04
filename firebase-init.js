// firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "ТВОЙ_API_KEY",
  authDomain: "komek-code-course.firebaseapp.com",
  projectId: "komek-code-course",
  storageBucket: "komek-code-course.appspot.com",
  messagingSenderId: "254136931241",
  appId: "1:254136931241:web:5cecafb7235e7cd5f7eab8"
};

const app = initializeApp(firebaseConfig);

// 🔹 вот что было нужно
export const auth = getAuth(app);
export const db = getFirestore(app);
