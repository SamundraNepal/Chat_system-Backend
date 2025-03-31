const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.HOST,
    auth: {
      user: process.env.HOST_USER_EMAIL,
      pass: process.env.HOST_USER_PASSWORD,
    },
  });

  //define email options
  const mailOptions = {
    from: `Chat me <${process.env.HOST_USER_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  //send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
