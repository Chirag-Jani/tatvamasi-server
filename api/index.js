const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const dotenv = require("dotenv");

const app = express();
const port = 9000;

dotenv.config();

// Middleware
app.use(bodyParser.json());

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
app.post("/sendmail", (req, res) => {
  const { subject, name, email, contactNumber, purposeOfMeeting } = req.body;

  // Email body
  const body = `
    You have received a meeting request from ${name}.
    
    Details:
    Name: ${name}
    Email: ${email}
    Contact Number: ${contactNumber}
    Purpose of Meeting: ${purposeOfMeeting}
  `;

  // Email options
  const mailOptions = {
    from: process.env.FROM_MAIL_ADDRESS, // Sender address
    to: process.env.TO_MAIL_ADDRESS, // Receiver address
    subject: subject, // Subject line
    text: body, // Plain text body
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
