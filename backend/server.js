const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();

/* =========================
   VALIDATE ENVIRONMENT VARIABLES
========================= */

const requiredEnvVars = ["RESEND_API_KEY", "SENDER_EMAIL", "RECEIVER_EMAIL"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.warn(
      "⚠️  Some features may not work correctly without this variable.",
    );
  }
});

if (
  process.env.RESEND_API_KEY &&
  process.env.SENDER_EMAIL &&
  process.env.RECEIVER_EMAIL
) {
  console.log("✅ All Resend environment variables are configured");
} else {
  console.warn(
    "⚠️  Resend is not fully configured. Email functionality may fail.",
  );
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   CORS CONFIGURATION
========================= */

// Parse allowed origins from environment variable or use defaults
const getAllowedOrigins = () => {
  const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://www.shubhconstructions.com",
    "https://shubhconstructions.com",
  ];

  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
      origin.trim(),
    );
  }

  return defaultOrigins;
};

const allowedOrigins = getAllowedOrigins();

console.log("Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

// Handle preflight requests

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is running properly");
});

/* =========================
   MULTER CONFIG
========================= */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files allowed"));
    }
  },
});

/* =========================
   JOB APPLICATION ROUTE
========================= */

app.post("/api/job-application", upload.single("resume"), async (req, res) => {
  try {
    // Check if required environment variables are set
    if (
      !process.env.RESEND_API_KEY ||
      !process.env.SENDER_EMAIL ||
      !process.env.RECEIVER_EMAIL
    ) {
      console.error(
        "❌ Resend credentials not configured",
        "API Key:",
        !!process.env.RESEND_API_KEY,
        "Sender:",
        !!process.env.SENDER_EMAIL,
        "Receiver:",
        !!process.env.RECEIVER_EMAIL,
      );
      return res.status(500).json({
        message: "Server configuration error: Email service not configured",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file missing" });
    }

    const {
      fullname,
      email,
      mobile,
      total_experience,
      current_employer,
      position,
    } = req.body;

    // Validate required fields
    if (
      !fullname ||
      !email ||
      !mobile ||
      !total_experience ||
      !current_employer ||
      !position
    ) {
      const missingFields = [];
      if (!fullname) missingFields.push("Full Name");
      if (!email) missingFields.push("Email");
      if (!mobile) missingFields.push("Mobile");
      if (!total_experience) missingFields.push("Total Experience");
      if (!current_employer) missingFields.push("Current Employer");
      if (!position) missingFields.push("Position");

      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Resume file too large (max 5MB)",
      });
    }

    console.log(`📨 Processing job application from: ${email}`);

    /* =========================
       SEND TO HR
    ========================= */

    try {
      const hrEmailResult = await resend.emails.send({
        from: process.env.SENDER_EMAIL,
        to: process.env.RECEIVER_EMAIL,
        subject: `New Job Application - ${fullname}`,
        html: `
          <h3 style="color: #d32f2f;">New Job Application</h3>
          <p><strong>Name:</strong> ${fullname}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobile:</strong> ${mobile}</p>
          <p><strong>Total Experience:</strong> ${total_experience} years</p>
          <p><strong>Current Employer:</strong> ${current_employer}</p>
          <p><strong>Position Applied:</strong> ${position}</p>
          <hr/>
          <p><em>Resume attached</em></p>
        `,
        attachments: [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
          },
        ],
      });

      if (hrEmailResult.error) {
        throw new Error(`HR email failed: ${hrEmailResult.error.message}`);
      }

      console.log(`✅ HR email sent successfully for: ${email}`);
    } catch (mailError) {
      console.error("❌ Failed to send HR email:", mailError.message);
      throw new Error(`Failed to send HR notification: ${mailError.message}`);
    }

    /* =========================
       AUTO-REPLY TO CANDIDATE
    ========================= */

    try {
      const autoReplyResult = await resend.emails.send({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Application Received - Shubh Construction",
        html: `
          <p>Hi ${fullname},</p>
          <p>Thank you for applying at <strong>Shubh Construction</strong>.</p>
          <p>We have received your application for the position of <strong>${position}</strong>.</p>
          <p>Our HR team will review your application and contact you if shortlisted.</p>
          <br/>
          <p>Best regards,<br/><strong>Shubh Construction Team</strong></p>
        `,
      });

      if (autoReplyResult.error) {
        console.error(
          "❌ Failed to send auto-reply email:",
          autoReplyResult.error.message,
        );
        console.warn("⚠️  Auto-reply failed but application was recorded");
      } else {
        console.log(`✅ Auto-reply email sent to: ${email}`);
      }
    } catch (mailError) {
      console.error("❌ Failed to send auto-reply email:", mailError.message);
      console.warn("⚠️  Auto-reply failed but application was recorded");
    }

    return res.status(200).json({
      message: "Job application submitted successfully",
    });
  } catch (error) {
    console.error("❌ JOB APPLICATION ERROR:", error.message);
    console.error("Stack:", error.stack);

    // Return appropriate error based on error type
    if (error.message.includes("Failed to send HR notification")) {
      return res.status(500).json({
        message:
          "Failed to submit application. Please contact HR directly or try again later.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "An error occurred while processing your application",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
});

/* =========================
   ERROR HANDLING MIDDLEWARE
========================= */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`✅ Server started successfully\n`);
});
