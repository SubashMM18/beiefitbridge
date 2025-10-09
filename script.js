// ======================
// Firebase Initialization
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ======================
// Firebase Config
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyD05XaBvC5fMUVLMZHhewJDzWJhlDTRmbg",
  authDomain: "miniproject-2db9d.firebaseapp.com",
  projectId: "miniproject-2db9d",
  storageBucket: "miniproject-2db9d.firebasestorage.app",
  messagingSenderId: "1069068203873",
  appId: "1:1069068203873:web:7996ff9c1b1c2ab03f7720",
  measurementId: "G-WQ18V8TX11"
};

// ======================
// Firebase Init
// ======================
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase Initialized!");


// ======================
// Login Function
// ======================
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      loginError.textContent = "Please enter both email and password.";
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCredential.user.email);
      window.location.href = "dashboard.html"; // redirect to dashboard
    } catch (error) {
      console.error(error);
      loginError.textContent = error.message;
    }
  });
}


// ======================
// Logout Function
// ======================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}


// ======================
// Tab Switching (Main Sections)
// ======================
window.showSection = function(sectionId){
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick="showSection('${sectionId}')"]`).classList.add('active');
}


// ======================
// Scholarship Category Switching
// ======================
window.showScholarshipCategory = function(cat){
  document.querySelectorAll('.scholarship-category').forEach(c => c.classList.remove('active'));
  document.getElementById(cat).classList.add('active');

  document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.subtab-btn[onclick="showScholarshipCategory('${cat}')"]`).classList.add('active');
}


// ======================
// Scholarship Apply Demo
// ======================
window.applyScholarship = function(name){
  alert(`Generate application guide for ${name} with links and eligibility`);
}


// ======================
// Save Student Form to Firestore
// ======================
const studentForm = document.getElementById("studentForm");
const successMsg = document.getElementById("studentSuccess");

if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(studentForm);
    const data = Object.fromEntries(formData.entries());

    try {
      await addDoc(collection(db, "student-form"), data);
      successMsg.textContent = "✅ Student details saved successfully!";
      studentForm.reset();
    } catch (error) {
      console.error("Error saving form:", error);
      successMsg.textContent = "❌ Failed to save data.";
    }
  });
}


// ======================
// Grievance Form
// ======================
const grievanceForm = document.getElementById("grievanceForm");
if (grievanceForm) {
  grievanceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Your grievance has been submitted!");
  });
}

console.log("🚀 All scripts loaded and ready!");
