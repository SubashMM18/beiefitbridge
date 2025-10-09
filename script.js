// ======================
// Firebase Initialization
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD05XaBvC5fMUVLMZHhewJDzWJhlDTRmbg",
  authDomain: "miniproject-2db9d.firebaseapp.com",
  projectId: "miniproject-2db9d",
  storageBucket: "miniproject-2db9d.firebasestorage.app",
  messagingSenderId: "1069068203873",
  appId: "1:1069068203873:web:7996ff9c1b1c2ab03f7720",
  measurementId: "G-WQ18V8TX11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

console.log("Firebase Initialized!");

// ======================
// Login Function
// ======================
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    loginError.textContent = "Please enter both email and password.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Logged in user:", user);
    window.location.href = "dashboard.html"; // redirect to dashboard
  } catch (error) {
    console.error(error);
    loginError.textContent = error.message;
  }
});

// ======================
// Logout Function
// ======================
export function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// ======================
// Tab Switching (Main Sections)
// ======================
export function showSection(sectionId){
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// ======================
// Scholarship Category Switching
// ======================
export function showScholarshipCategory(cat){
  document.querySelectorAll('.scholarship-category').forEach(c => c.classList.remove('active'));
  document.getElementById(cat).classList.add('active');

  document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.subtab-btn[onclick="showScholarshipCategory('${cat}')"]`).classList.add('active');
}

// ======================
// Scholarship Apply Demo
// ======================
export function applyScholarship(name){
  alert(`Generate application guide for ${name} with links and eligibility`);
}

// ======================
// Form Submit Handlers
// ======================
const studentForm = document.getElementById('studentForm');
if(studentForm){
    alert("succes");
//  studentForm.addEventListener('submit', function(e){
//    e.preventDefault();
//    alert("Student info saved successfully! Check Matched Scholarships section.");
//  });
}

const grievanceForm = document.getElementById('grievanceForm');
if(grievanceForm){
  grievanceForm.addEventListener('submit', function(e){
    e.preventDefault();
    alert("Your grievance has been submitted!");
  });
}

console.log("All scripts loaded and ready!");
