// === Google Sheet CSV link ===
// 🔹 Replace this with YOUR OWN published CSV link from Google Sheets
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSNvyBybgY5aWJ6xMvMFunzdRZg14aupn6eLOhsmNMdm1vehWPkCJWwtwVYLSmjVEKowEPKiVFMijUk/pub?output=csv";
let students = [];
let chartInstance = null;

// === Load data from Google Sheet ===
async function loadStudentData() {
  try {
    const response = await fetch(sheetURL);
    const csv = await response.text();
    const rows = csv.split("\n").map(r => r.trim().split(","));
    const headers = rows[0];
    students = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      obj.marks = {
        English: Number(obj.English),
        Math: Number(obj.Math),
        Science: Number(obj.Science),
        Hindi: Number(obj.Hindi),
        Computer: Number(obj.Computer)
      };
      return obj;
    });
    console.log("✅ Loaded student data from Google Sheet:", students);
  } catch (err) {
    console.error("Error loading data:", err);
  }
}
loadStudentData();

// === Calculate result ===
function calculateResult(marks) {
  const total = Object.values(marks).reduce((a, b) => a + b, 0);
  const percentage = (total / (Object.keys(marks).length * 100)) * 100;
  let grade = "";
  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B";
  else if (percentage >= 60) grade = "C";
  else grade = "D";
  return { percentage: percentage.toFixed(2), grade };
}

// === Display result ===
function getResult() {
  const roll = document.getElementById("rollInput").value.trim();
  const card = document.getElementById("result-card");
  const notfound = document.getElementById("notfound");

  const student = students.find(s => s.Roll === roll);

  if (!student) {
    card.classList.add("hidden");
    notfound.classList.remove("hidden");
    return;
  }

  notfound.classList.add("hidden");
  card.classList.remove("hidden");

  document.getElementById("student-name").textContent = student.Name;
  document.getElementById("student-roll").textContent = student.Roll;
  document.getElementById("student-class").textContent = student.Class;

  const marksDiv = document.getElementById("marks");
  marksDiv.innerHTML = "";
  for (const [subject, mark] of Object.entries(student.marks)) {
    marksDiv.innerHTML += `<p><strong>${subject}:</strong> ${mark}</p>`;
  }

  const { percentage, grade } = calculateResult(student.marks);
  document.getElementById("percentage").textContent = percentage;
  document.getElementById("grade").textContent = grade;

  drawChart(student.marks);

  if (percentage >= 90) {
    startConfetti();
    setTimeout(stopConfetti, 4000);
  }
}

// === Draw chart ===
function drawChart(marks) {
  const ctx = document.getElementById("marksChart").getContext("2d");
  const subjects = Object.keys(marks);
  const scores = Object.values(marks);
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: subjects,
      datasets: [{
        label: 'Marks',
        data: scores,
        borderWidth: 1,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

// === Confetti animation ===
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let confetti = [];
let animationFrame;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startConfetti() {
  confetti = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 2,
    d: Math.random() * 0.5 + 0.5,
    color: `hsl(${Math.random() * 360}, 100%, 60%)`
  }));
  animateConfetti();
}
function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
  });
  confetti.forEach(c => {
    c.y += c.d * 7;
    if (c.y > canvas.height) c.y = -10;
  });
  animationFrame = requestAnimationFrame(animateConfetti);
}
function stopConfetti() {
  cancelAnimationFrame(animationFrame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
