let studentData = [];

document.getElementById("loadCsvBtn").addEventListener("click", async () => {
  const link = document.getElementById("csvLink").value.trim();
  if (!link) {
    alert("⚠️ Please paste a CSV link.");
    return;
  }

  try {
    const response = await fetch(link);
    const text = await response.text();
    studentData = csvToArray(text);
    alert("✅ CSV loaded successfully!");
  } catch (error) {
    alert("❌ Error loading CSV. Make sure your link is a public CSV export link.");
  }
});

function csvToArray(str, delimiter = ",") {
  const headers = str.trim().split("\n")[0].split(delimiter);
  const rows = str.trim().split("\n").slice(1);
  return rows.map((row) => {
    const values = row.split(delimiter);
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i]?.trim() || "";
      return obj;
    }, {});
  });
}

document.getElementById("searchBtn").addEventListener("click", () => {
  const name = document.getElementById("nameInput").value.trim().toLowerCase();
  const cls = document.getElementById("classInput").value.trim().toUpperCase();
  const testType = document.getElementById("testType").value.trim();

  if (!name || !cls || !testType) {
    alert("⚠️ Please fill all fields.");
    return;
  }

  const student = studentData.find(
    (s) =>
      s.Name?.toLowerCase() === name &&
      s.Class?.toUpperCase() === cls &&
      s.TestType?.toLowerCase() === testType.toLowerCase()
  );

  displayResult(student, testType);
});

function displayResult(student, testType) {
  const resultSection = document.getElementById("resultSection");
  const tableHead = document.querySelector("#resultTable thead");
  const tableBody = document.querySelector("#resultTable tbody");
  const info = document.getElementById("studentInfo");
  const downloadBtn = document.getElementById("downloadBtn");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (!student) {
    resultSection.classList.remove("hidden");
    downloadBtn.classList.add("hidden");
    info.innerHTML = "❌ Student not found.";
    return;
  }

  resultSection.classList.remove("hidden");
  info.innerHTML = `Name: <b>${student.Name}</b> | Class: <b>${student.Class}</b> | Test: <b>${testType}</b>`;

  const subjects = Object.keys(student).filter(
    (h) => !["Name", "Class", "TestType"].includes(h)
  );

  tableHead.innerHTML = "<tr><th>Subject</th><th>Marks</th></tr>";
  let total = 0;
  subjects.forEach((sub) => {
    const mark = parseFloat(student[sub]) || 0;
    total += mark;
    tableBody.innerHTML += `<tr><td>${sub}</td><td>${mark}</td></tr>`;
  });

  const percentage = (total / (subjects.length * 100)) * 100;
  const grade = getGrade(percentage);

  tableBody.innerHTML += `
    <tr><td><b>Total</b></td><td><b>${total}</b></td></tr>
    <tr><td><b>Percentage</b></td><td><b>${percentage.toFixed(2)}%</b></td></tr>
    <tr><td><b>Grade</b></td><td><b>${grade}</b></td></tr>
  `;

  downloadBtn.classList.remove("hidden");
  downloadBtn.onclick = () =>
    downloadMarksheet(student, subjects, total, percentage, grade, testType);
}

function getGrade(p) {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
}

function downloadMarksheet(student, subjects, total, percentage, grade, testType) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Border + Logo + Header
  doc.setDrawColor(0, 0, 0);
  doc.rect(10, 10, 190, 270);
  doc.addImage("https://i.imgur.com/I6QeE8r.png", "PNG", 85, 15, 40, 40); // school logo example
  doc.setFontSize(18);
  doc.text("Official School Marksheet", 60, 65);

  // Student info
  doc.setFontSize(12);
  doc.text(`Name: ${student.Name}`, 20, 85);
  doc.text(`Class: ${student.Class}`, 20, 95);
  doc.text(`Test Type: ${testType}`, 20, 105);

  // Table
  let y = 120;
  doc.text("Subject", 20, y);
  doc.text("Marks", 160, y);
  y += 10;

  subjects.forEach((s) => {
    doc.text(s, 20, y);
    doc.text(String(student[s]), 160, y);
    y += 8;
  });

  y += 10;
  doc.text(`Total: ${total}`, 20, y);
  y += 8;
  doc.text(`Percentage: ${percentage.toFixed(2)}%`, 20, y);
  y += 8;
  doc.text(`Grade: ${grade}`, 20, y);
  y += 20;

  doc.text("__________________", 20, y + 10);
  doc.text("Teacher Signature", 20, y + 20);

  doc.text("__________________", 140, y + 10);
  doc.text("Principal Signature", 140, y + 20);

  doc.save(`${student.Name}_${student.Class}_${testType}_Marksheet.pdf`);
}
