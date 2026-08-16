const axios = require("axios");

const sendEmail = async ({ to, subject, html }) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "TaskFlow", email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
};

module.exports = sendEmail;