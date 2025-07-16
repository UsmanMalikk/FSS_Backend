const express = require("express");
// const scheduleEmailJob = require("./cron-reminder");
const scheduleEmployeeReminderJob = require("./cronEmployeeReminder");
// const { handleSendQuotation, handlePreviewQuotation, handlePreviewPDF } = require('./quotationHandler');
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 5689;

app.use(express.json());
app.use(cors());
app.use('/employees', employeeRoutes);

// Static file access (for PDF downloads)
// app.use('/output', express.static(path.join(__dirname, 'output')));

// Quotation routes
// app.post('/preview-quotation', handlePreviewQuotation);
// app.post('/preview-pdf', handlePreviewPDF);
// app.post("/send-quotation", handleSendQuotation);

// Health check
app.get("/", (req, res) => {
  res.send("Sales Visit Tracker Backend Running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
  // scheduleEmailJob();
  scheduleEmployeeReminderJob();
});
