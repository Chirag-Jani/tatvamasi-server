const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const app = express();
const port = 9000;

dotenv.config();

// Middleware
app.use(bodyParser.json());
const upload = multer({
  dest: "attachments/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_MAIL_ADDRESS, // Your Gmail address
    pass: process.env.APP_PASSWORD, // Your Gmail password
  },
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server running successfully :)",
  });
});

// API endpoint to send email
app.post("/sendmail", upload.single("file"), (req, res) => {
  const { subject, body } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("Please upload a file");
  }

  // Rename the file to have a .pdf extension
  const oldPath = file.path;
  const newPath = path.join(path.dirname(oldPath), file.originalname + ".pdf");
  fs.renameSync(oldPath, newPath);

  // Read the PDF file
  const pdfAttachment = fs.readFileSync(newPath);

  // Email options
  const mailOptions = {
    from: process.env.FROM_MAIL_ADDRESS, // Sender address
    to: process.env.TO_MAIL_ADDRESS, // Receiver address
    subject: subject, // Subject line
    text: body, // Plain text body
    attachments: [
      {
        filename: file.originalname + ".pdf",
        content: pdfAttachment,
        contentType: "application/pdf",
      },
    ],
  };

  // Sending email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Email sending failed");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
