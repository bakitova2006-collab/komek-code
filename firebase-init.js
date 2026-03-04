// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFhrLF3OCYSOHRFSPROEP1qOvjopaK-8s",
  authDomain: "komek-code-course.firebaseapp.com",
  projectId: "komek-code-course",
  storageBucket: "komek-code-course.firebasestorage.app",
  messagingSenderId: "254136931241",
  appId: "1:254136931241:web:5cecafb7235e7cd5f7eab8",
  measurementId: "G-9BZPDQ66ZM"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
