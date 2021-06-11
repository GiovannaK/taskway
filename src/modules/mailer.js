const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid')

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport(nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY
  }))

  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: options.to,
    subject: options.subject,
    html: options.text
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
    console.log(info);
  });
}

module.exports = sendEmail;