const express = require("express");
const multer = require("multer");
const cors = require("cors");
const Mailjet = require("node-mailjet");
require("dotenv").config();

const app = express();

/* =========================
   VALIDATE ENVIRONMENT VARIABLES
========================= */

const requiredEnvVars = [
  "MJ_APIKEY_PUBLIC",
  "MJ_APIKEY_PRIVATE",
  "MJ_SENDER_EMAIL",
  "RECEIVER_EMAIL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.warn(
      "⚠️  Some features may not work correctly without this variable.",
    );
  }
});

if (
  process.env.MJ_APIKEY_PUBLIC &&
  process.env.MJ_APIKEY_PRIVATE &&
  process.env.MJ_SENDER_EMAIL &&
  process.env.RECEIVER_EMAIL
) {
  console.log("✅ All Mailjet environment variables are configured");
} else {
  console.warn(
    "⚠️  Mailjet is not fully configured. Email functionality may fail.",
  );
}

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
   MAILJET CONFIG
========================= */

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE,
);

/* =========================
   JOB APPLICATION ROUTE
========================= */

app.post("/api/job-application", upload.single("resume"), async (req, res) => {
  try {
    // Check if required environment variables are set
    if (
      !process.env.MJ_APIKEY_PUBLIC ||
      !process.env.MJ_APIKEY_PRIVATE ||
      !process.env.MJ_SENDER_EMAIL ||
      !process.env.RECEIVER_EMAIL
    ) {
      console.error(
        "❌ Mailjet credentials not configured",
        "Public:",
        !!process.env.MJ_APIKEY_PUBLIC,
        "Private:",
        !!process.env.MJ_APIKEY_PRIVATE,
        "Sender:",
        !!process.env.MJ_SENDER_EMAIL,
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

    const attachmentBase64 = req.file.buffer.toString("base64");

    console.log(`📨 Processing job application from: ${email}`);

    /* =========================
       SEND TO HR
    ========================= */

    try {
      await mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name: "Shubh Construction",
            },
            To: [
              {
                Email: process.env.RECEIVER_EMAIL,
                Name: "HR Team",
              },
            ],
            Subject: `New Job Application - ${fullname}`,
            HTMLPart: `
              <h3>New Job Application</h3>
              <p><b>Name:</b> ${fullname}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Mobile:</b> ${mobile}</p>
              <p><b>Total Experience:</b> ${total_experience} years</p>
              <p><b>Current Employer:</b> ${current_employer}</p>
              <p><b>Position Applied:</b> ${position}</p>
            `,
            Attachments: [
              {
                ContentType: req.file.mimetype,
                Filename: req.file.originalname,
                Base64Content: attachmentBase64,
              },
            ],
          },
        ],
      });

      console.log(`✅ HR email sent successfully for: ${email}`);
    } catch (mailError) {
      console.error("❌ Failed to send HR email:", mailError.message);
      throw new Error(`Failed to send HR notification: ${mailError.message}`);
    }

    /* =========================
       AUTO-REPLY TO CANDIDATE
    ========================= */

    try {
      await mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name: "Shubh Construction",
            },
            To: [
              {
                Email: email,
                Name: fullname,
              },
            ],
            Subject: "Application Received",
            HTMLPart: `
              <p>Hi ${fullname},</p>
              <p>Thank you for applying at <b>Shubh Construction</b>.</p>
              <p>We have received your application for the position of <b>${position}</b>.</p>
              <p>Our HR team will contact you if shortlisted.</p>
              <br/>
              <p>Regards,<br/>Shubh Construction Team</p>
            `,
          },
        ],
      });

      console.log(`✅ Auto-reply email sent to: ${email}`);
    } catch (mailError) {
      console.error("❌ Failed to send auto-reply email:", mailError.message);
      // Don't throw here - application is already recorded
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
