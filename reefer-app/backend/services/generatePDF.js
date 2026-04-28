const fs = require("fs");
const PDFDocument = require("pdfkit");

// Base path
const basePath = "./DOCS";

// Helper function to create PDF
function createPDF(filePath, title) {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text("This is a dummy document generated for system testing.");
    doc.text("Department: Reefer Operations");
    doc.text("Generated automatically using Node.js");

    doc.end();
}

// Generate TRAINING BEGINNER (10)
for (let i = 1; i <= 10; i++) { 
    const name = `BEGINNER MODULE ${String(i).padStart(2, "0")}.pdf`;
    const path = `${basePath}/TRAINING_BEGINNER DOCS/${name}`;
    createPDF(path, `Reefer Basics Training ${i}`);
}

// Generate INTERMEDIATE (5)
for (let i = 1; i <= 5; i++) {
    const name = `INTERMEDIATE MODULE ${String(i).padStart(2, "0")}.pdf`;
    const path = `${basePath}/TRAINING_INTERMEDIATE DOCS/${name}`;
    createPDF(path, `Intermediate Training ${i}`);
}

// Generate ADVANCED (5)
for (let i = 1; i <= 5; i++) {
    const name = `ADVANCED MODULE ${String(i).padStart(2, "0")}.pdf`;
    const path = `${basePath}/TRAINING_ADVANCED DOCS/${name}`;
    createPDF(path, `Advanced Diagnostics ${i}`);
}

// ISO DOCS (4)
for (let i = 1; i <= 4; i++) {
    const name = `ISO PROCEDURE ${String(i).padStart(2, "0")}.pdf`;
    const path = `${basePath}/ISO DOCS/${name}`;
    createPDF(path, `ISO Procedure ${i}`);
}

// SOP DOCS (3)
for (let i = 1; i <= 3; i++) {
    const name = `SOP REEFER HANDLING ${String(i).padStart(2, "0")}.pdf`;
    const path = `${basePath}/SOP DOCS/${name}`;
    createPDF(path, `SOP Reefer Handling ${i}`);
}

// JD DOCS (3)
const jdFiles = [
    "JOB DESCRIPTION TECHNICIAN.pdf",
    "JOB DESCRIPTION SUPERVISOR.pdf",
    "JOB DESCRIPTION EXECUTIVE.pdf"
];  

jdFiles.forEach((file) => {
    const path = `${basePath}/JD DOCS/${file}`;
    createPDF(path, file.replace(".pdf", ""));
});

console.log("✅ All dummy PDFs generated successfully!");