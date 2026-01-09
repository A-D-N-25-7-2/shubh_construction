const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("Backend is running properly");
});

/* ---------- MULTER (MEMORY STORAGE + FILE FILTER) ---------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files are allowed"));
    }
  },
});

/* ---------- API ---------- */
app.post("/api/job-application", upload.single("resume"), async (req, res) => {
  try {
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file ? req.file.originalname : "NO FILE");

    const {
      fullname,
      email,
      mobile,
      total_experience,
      current_employer,
      position,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Resume file missing" });
    }

    /* ---------- ENV CHECK (IMPORTANT FOR RENDER) ---------- */
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email environment variables not set");
    }

    /* ---------- MAIL CONFIG ---------- */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"Careers - Shubh Construction" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Job Application - ${fullname}`,
      html: `
        <h2>New Job Application</h2>
        <p><b>Name:</b> ${fullname}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mobile:</b> ${mobile}</p>
        <p><b>Experience:</b> ${total_experience} years</p>
        <p><b>Current Employer:</b> ${current_employer}</p>
        <p><b>Position:</b> ${position}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Application sent successfully" });
  } catch (error) {
    console.error("MAIL ERROR 👉", error.message);

    return res.status(500).json({
      message: error.message || "Mail failed",
    });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
