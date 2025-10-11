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
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ======================
// Firebase Config
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyD05XaBvC5fMUVLMZHhewJDzWJhlDTRmbg",
  authDomain: "miniproject-2db9d.firebaseapp.com",
  projectId: "miniproject-2db9d",
  storageBucket: "miniproject-2db9d.appspot.com",
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
      window.location.href = "dashboard.html";
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
// Student Form Save
// ======================
const studentForm = document.getElementById("studentForm");
const successMsg = document.getElementById("studentSuccess");

if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    successMsg.textContent = "⏳ Saving data... Please wait.";

    const formData = new FormData(studentForm);
    const data = Object.fromEntries(formData.entries());

    try {
      // Normalize input
      const finalData = {
        ...data,
        caste: (data.caste || "").trim(),
        community: (data.community || "").trim(),
        gender: (data.gender || "").trim(),
        income: Number(data.income),
        qualification12: Number(data.qualification12),
        timestamp: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, "student-form"), finalData);

      successMsg.textContent = "✅ Student details saved successfully!";
      studentForm.reset();

      // Show matched scholarships immediately
      showMatchedScholarships(finalData);

    } catch (error) {
      console.error("Error saving form:", error);
      successMsg.textContent = "❌ Failed to save data. Check console for details.";
    }
  });
}

// ======================
// Eligibility Check
// ======================
function isEligible(studentData, s) {
  const studentCaste = (studentData.caste || "").trim().toLowerCase();
  const studentCommunity = (studentData.community || "").trim().toLowerCase();
  const studentGender = (studentData.gender || "").trim().toLowerCase();

  const requiredCaste = (s.requiredCaste || "").trim().toLowerCase();
  const requiredCommunity = (s.requiredCommunity || "").trim().toLowerCase();
  const requiredGender = (s.gender || "").trim().toLowerCase();

  const casteEligible =
    requiredCaste === "all" ||
    requiredCaste.split("/").map(c => c.trim().toLowerCase()).includes(studentCaste);

  const communityEligible =
    !requiredCommunity ||
    requiredCommunity === "all" ||
    requiredCommunity.split("/").map(c => c.trim().toLowerCase()).includes(studentCommunity);

  const genderEligible =
    !requiredGender || requiredGender === "all" || requiredGender === studentGender;

  const incomeEligible =
    Number(studentData.income) >= Number(s.minIncome) &&
    Number(studentData.income) <= Number(s.maxIncome);

  const qualEligible = Number(studentData.qualification12) >= Number(s.minQualification12);

  return casteEligible && communityEligible && genderEligible && incomeEligible && qualEligible;
}

// ======================
// Map Firestore categories to HTML container IDs
// ======================
const categoryIdMap = {
  "Arts & Science": "arts-category",
  "Engineering": "engineering-category",
  "Medicals": "medical-category"
};

// ======================
// Show Matched Scholarships
// ======================
async function showMatchedScholarships(studentData) {
  const normalizedData = {
    ...studentData,
    caste: (studentData.caste || "").trim().toLowerCase(),
    community: (studentData.community || "").trim().toLowerCase(),
    gender: (studentData.gender || "").trim().toLowerCase(),
    income: Number(studentData.income),
    qualification12: Number(studentData.qualification12)
  };

  document.querySelectorAll(".scholarship-category").forEach(cat => (cat.innerHTML = ""));
  document.querySelectorAll(".subtab-btn").forEach(btn => btn.classList.remove("has-results"));

  const scholarshipsCol = collection(db, "scholarships");
  const snapshot = await getDocs(scholarshipsCol);
  const matched = [];
  const categoriesWithResults = new Set();

  snapshot.forEach(doc => {
    const s = doc.data();
    if (isEligible(normalizedData, s)) {
      matched.push(s);

      const containerId = categoryIdMap[s.category];
      if (!containerId) return;
      categoriesWithResults.add(containerId);

      const container = document.getElementById(containerId);
      if (!container) return;

      const div = document.createElement("div");
      div.classList.add("scholarship-item");
      div.innerHTML = `
        <strong>${s.name}</strong><br>
        ${s.eligibilityNote || ""}<br>
        <em>Caste: ${s.requiredCaste || "All"}</em> | 
        <em>Community: ${s.requiredCommunity || "All"}</em> | 
        <em>Min 12th %: ${s.minQualification12}</em> | 
        <em>Income Range: ${s.minIncome} - ${s.maxIncome}</em>
      `;
      container.appendChild(div);
    }
  });

  if (matched.length === 0) {
    document.querySelectorAll(".scholarship-category").forEach(
      cat => (cat.innerHTML = "<em>No scholarships matched your profile.</em>")
    );
    return;
  }

  categoriesWithResults.forEach(catId => {
    const btn = document.querySelector(`.subtab-btn[onclick="showScholarshipCategory('${catId}')"]`);
    if (btn) btn.classList.add("has-results");
  });

  const firstCategory = [...categoriesWithResults][0];
  if (firstCategory) showScholarshipCategory(firstCategory);
}

// ======================
// Grievance Form
// ======================
const grievanceForm = document.getElementById("grievanceForm");
if (grievanceForm) {
  grievanceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Your grievance has been submitted!");
    grievanceForm.reset();
  });
}

// ======================
// Tab Functions
// ======================
window.showSection = function(sectionId) {
  document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");

  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.tab-btn[onclick="showSection('${sectionId}')"]`).classList.add("active");
};

window.showScholarshipCategory = function(catId) {
  document.querySelectorAll(".scholarship-category").forEach(c => c.classList.remove("active"));
  document.getElementById(catId).classList.add("active");

  document.querySelectorAll(".subtab-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.subtab-btn[onclick="showScholarshipCategory('${catId}')"]`).classList.add("active");
};

console.log("🚀 All scripts loaded and ready!");

// ======================
// Add All Scholarships to Firestore
// ======================
async function addAllScholarships() {
  const scholarships = [
    // (Add the same 15 scholarship objects you already have)
  ];

  for (const s of scholarships) {
    await addDoc(collection(db, "scholarships"), s);
    console.log("Added scholarship:", s.name);
  }

  alert("✅ All scholarships added to Firestore!");
}

// Uncomment **once** to add scholarships
// addAllScholarships();
