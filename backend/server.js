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

/* ---------- MULTER (MEMORY STORAGE) ---------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ---------- API ---------- */
app.post("/api/job-application", upload.single("resume"), async (req, res) => {
  try {
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

    res.status(200).json({ message: "Application sent successfully" });
  } catch (error) {
    console.error("MAIL ERROR 👉", error);
    res.status(500).json({ message: "Mail failed" });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
