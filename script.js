// ======================
// 🔥 Firebase Initialization
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD05XaBvC5fMUVLMZHhewJDzWJhlDTRmbg",
  authDomain: "miniproject-2db9d.firebaseapp.com",
  projectId: "miniproject-2db9d",
  storageBucket: "miniproject-2db9d.appspot.com",
  messagingSenderId: "1069068203873",
  appId: "1:1069068203873:web:7996ff9c1b1c2ab03f7720",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase initialized successfully!");

// ======================
// 📧 Auto-fill Logged-in Email
// ======================
onAuthStateChanged(auth, (user) => {
  if (user) {
    const emailField = document.getElementById("email");
    if (emailField) {
      emailField.value = user.email || "";
      emailField.readOnly = true;
      emailField.style.background = "#f8f8f8";
      emailField.style.cursor = "not-allowed";
    }
  }
});

// ======================
// 🚪 Logout Function
// ======================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

// ======================
// 🧾 Save Student Form + Match Scholarships
// ======================
const studentForm = document.getElementById("studentForm");
let lastStudent = null;

if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // ⛔️ stop refresh before saving

    const student = {
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      dob: dob.value,
      gender: gender.value,
      email: email.value,
      father: father.value,
      mother: mother.value,
      mobile: mobile.value,
      community: community.value.toLowerCase().trim(),
      caste: caste.value.toLowerCase().trim(),
      income: Number(income.value || 0),
      qualification12: Number(mark12.value || 0),
      qualificationBoard: board.value.trim(),
      disabled:
        document.querySelector('input[name="disabled"]:checked')?.value || "No",
      firstGraduate:
        document.querySelector('input[name="firstGrad"]:checked')?.value || "No",
      govtSchool:
        document.querySelector('input[name="govtSchool"]:checked')?.value || "No",
      tamilMedium:
        document.querySelector('input[name="tamilMedium"]:checked')?.value || "No",
    };

    try {
      console.log("🧾 Saving student to Firestore...", student);
      await addDoc(collection(db, "student-form"), student);
      console.log("✅ Saved successfully!");

      lastStudent = student;
      const msg = document.getElementById("studentSuccess");
      msg.textContent = "✅ Student details saved successfully!";
      msg.style.color = "green";
      msg.style.fontWeight = "600";
      matchScholarships(student);
    } catch (err) {
      console.error("❌ Firestore Save Error:", err);
      const msg = document.getElementById("studentSuccess");
      msg.textContent = "❌ Failed to save student. Check console for details.";
      msg.style.color = "red";
    }
  });
}


// ======================
// 🎯 Scholarship Matching Logic
// ======================
async function matchScholarships(student) {
  const snap = await getDocs(collection(db, "scholarships"));
  const eng = [],
    arts = [],
    med = [];

  snap.forEach((doc) => {
    const s = doc.data();
    if (isEligible(student, s)) {
      const cat = (s.category || "").toLowerCase();
      if (cat.includes("engineering")) eng.push(s);
      if (cat.includes("arts")) arts.push(s);
      if (cat.includes("medical")) med.push(s);
    }
  });

  displayScholarships("engineering-list", eng);
  displayScholarships("arts-list", arts);
  displayScholarships("medical-list", med);
  showTab("matched-scholarships");
}

// ======================
// ✅ Eligibility Checking
// ======================
function isEligible(st, s) {
  const studentCommunity = (st.community || "").trim().toLowerCase();
  const studentCaste = (st.caste || "").trim().toLowerCase();
  const requiredCommunity = (s.requiredCommunity || "").trim().toLowerCase();
  const requiredCaste = (s.requiredCaste || "").trim().toLowerCase();
  const scholarshipName = (s.name || "").trim().toLowerCase();

  const communityList = requiredCommunity.split(/[\/,\s]+/).filter(Boolean);
  const casteList = requiredCaste.split(/[\/,\s]+/).filter(Boolean);

  const communityOK =
    requiredCommunity === "all" || communityList.includes(studentCommunity);

  const casteOK =
    requiredCaste === "all" || casteList.includes(studentCaste) || communityOK;

  const genderOK =
    s.gender === "All" || s.gender.toLowerCase() === st.gender.toLowerCase();

  const incomeOK =
    st.income >= (s.minIncome || 0) &&
    st.income <= (s.maxIncome || Infinity);
  const markOK = st.qualification12 >= (s.minQualification12 || 0);
  const boardOK =
    s.qualificationBoard === "Any" ||
    (s.qualificationBoard || "")
      .toLowerCase()
      .includes((st.qualificationBoard || "").toLowerCase());

  // 7.5% Quota rule
  if (scholarshipName.includes("7.5% quota")) {
    const isStateBoard = (st.qualificationBoard || "")
      .toLowerCase()
      .includes("state");
    const isTamilMedium = (st.tamilMedium || "").toLowerCase() === "yes";
    if (!isStateBoard || !isTamilMedium) return false;
  }

  if (
    scholarshipName.includes("tamil medium") &&
    (st.tamilMedium || "").toLowerCase() !== "yes"
  )
    return false;

  if (
    scholarshipName.includes("first graduate") &&
    (st.firstGraduate || "").toLowerCase() !== "yes"
  )
    return false;

  return communityOK && casteOK && genderOK && incomeOK && markOK && boardOK;
}

// ======================
// 🎓 Display Matched Scholarships
// ======================
function displayScholarships(id, arr) {
  const ul = document.getElementById(id);
  if (!ul) return;
  ul.innerHTML = "";

  if (!arr.length) {
    ul.innerHTML = "<li>No eligible scholarships found.</li>";
    return;
  }

  arr.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s.name;
    li.style.transition = "0.3s";
    li.addEventListener("mouseenter", () => (li.style.transform = "scale(1.03)"));
    li.addEventListener("mouseleave", () => (li.style.transform = "scale(1)"));
    li.addEventListener("click", () => openBottomPanel(s));
    ul.appendChild(li);
  });
}

// ======================
// 🎬 Slide-Up Bottom Consolidation Panel
// ======================
const bottomPanel = document.getElementById("bottomPanel");
const bottomDetail = document.getElementById("bottomDetail");
const closeBottomPanel = document.getElementById("closeBottomPanel");

function openBottomPanel(s) {
  // Base scholarship detail card
  bottomDetail.innerHTML = `
    <div class="scholarship-detail" style="
        background:#fff; 
        border-radius:20px; 
        padding:25px; 
        box-shadow:0 5px 25px rgba(0,0,0,0.15);
        border-left:6px solid #b01b1b;
        transition: all 0.4s ease;">
      <h3 style="color:#b01b1b;margin-bottom:10px;">${s.name}</h3>
      <p><strong>📖 Category:</strong> ${s.category}</p>
      <p><strong>💰 Benefits:</strong> ${s.benefits}</p>
      <p><strong>📜 Certificates:</strong> ${s.requiredCertificates}</p>
      <p><strong>🧾 Eligibility:</strong> ${s.eligibilityNote}</p>
      <p><strong>🧩 Application Type:</strong> 
        <span style="
          display:inline-block;
          padding:4px 10px;
          border-radius:8px;
          font-weight:600;
          color:white;
          animation: glow 1.2s ease-in-out infinite alternate;
          background:${s.applyType === 'Auto Applied by College' ? '#118b28' : 
                      s.applyType === 'Apply through College' ? '#f0a500' : '#b01b1b'};">
          ${s.applyType || 'Not Specified'}
        </span>
      </p>
      <p><a href="${s.applyLink}" target="_blank">🌐 Apply Here</a></p>
    </div>
  `;

  // ✅ Append extra instructions only if applyType = "Apply through College"
  if (s.applyType === "Apply through College") {
    bottomDetail.innerHTML += `
      <div class="manual-apply-guide" style="
        background: linear-gradient(135deg, #fff8e1, #fff3d6);
        border: 1.5px dashed #b87400;
        border-radius: 12px;
        padding: 18px;
        margin-top: 18px;
        color: #5a1a1a;
        box-shadow: 0 3px 8px rgba(0,0,0,0.1);
      ">
        <h4 style="margin-top: 0; color:#b01b1b;">📝 How to Apply Through College</h4>
        <ol style="margin: 10px 0 0 18px; line-height: 1.6;">
          <li>Visit your <b>College Scholarship Cell / Office</b>.</li>
          <li>Submit required documents — Community, Income, Mark Sheets, Bank Passbook copy, etc.</li>
          <li>Your <b>Nodal Officer</b> will verify and forward your application to the respective department.</li>
          <li>You can track your application status through the college office after submission.</li>
        </ol>
        <p style="margin-top: 10px; color:#7a2a2a;">
          <b>⚠️ Note:</b> These scholarships cannot be applied online directly by students.
        </p>
      </div>
    `;
  }

  bottomPanel.classList.add("active");
}

// Close panel
if (closeBottomPanel) {
  closeBottomPanel.addEventListener("click", () =>
    bottomPanel.classList.remove("active")
  );
}


// ======================
// 📘 Scholarship Info Tab (Names Only)
// ======================
async function loadAllScholarships() {
  const snap = await getDocs(collection(db, "scholarships"));
  const infoList = document.getElementById("info-list");
  infoList.innerHTML = "";
  snap.forEach((doc) => {
    const s = doc.data();
    const li = document.createElement("li");
    li.textContent = s.name;
    li.style.transition = "0.3s";
    li.addEventListener("mouseenter", () => (li.style.transform = "scale(1.03)"));
    li.addEventListener("mouseleave", () => (li.style.transform = "scale(1)"));
    infoList.appendChild(li);
  });
}
loadAllScholarships();

// ======================
// 🔄 Tab Switching
// ======================
const tabs = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".tab-content");

tabs.forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

function showTab(id) {
  tabs.forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
  sections.forEach((s) => s.classList.toggle("active", s.id === id));
}

// ======================
// 👤 STUDENT PROFILE PANEL (Stylish)
// ======================
const profileBtn = document.getElementById("profileBtn");
const profilePanel = document.getElementById("profilePanel");
const closeProfile = document.getElementById("closeProfile");

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    if (lastStudent) {
      document.getElementById("pName").textContent =
        `${lastStudent.firstname} ${lastStudent.lastname}`;
      document.getElementById("pEmail").textContent = lastStudent.email;
      document.getElementById("pGender").textContent = lastStudent.gender;
      document.getElementById("pCommunity").textContent = lastStudent.community;
      document.getElementById("pIncome").textContent = lastStudent.income;
      document.getElementById("pBoard").textContent = lastStudent.qualificationBoard;
      document.getElementById("pFG").textContent = lastStudent.firstGraduate;
      document.getElementById("pTM").textContent = lastStudent.tamilMedium;
    }
    profilePanel.classList.add("active");
  });
}

if (closeProfile) {
  closeProfile.addEventListener("click", () => {
    profilePanel.classList.remove("active");
  });
}

console.log("🚀 Script fully loaded with applyType tags + glow + all features ready!");
