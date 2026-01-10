const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


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

    const resume = req.file;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
          filename: resume.originalname,
          path: resume.path,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Application sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mail failed" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running at http://localhost:${process.env.PORT}`);
});
