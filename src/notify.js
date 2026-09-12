const nodemailer = require('nodemailer');
const config = require('./config');

// mailer/notify.js
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS, not implicit TLS
  auth: { user: config.mail.user, pass: config.mail.appPassword },
});

async function notifyNewListing(item) {
  await transporter.sendMail({
    from: config.mail.user,
    to: config.mail.notifyTo,
    subject: `New placement listing: ${item.company}`,
    text: `${item.title}\nCompany: ${item.company}\nDeadline: ${item.deadline}`,
  });
}

module.exports = { notifyNewListing };
