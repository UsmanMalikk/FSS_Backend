const mailjet = require('node-mailjet');
const fs = require('fs');

require('dotenv').config();

const mailer = mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await mailer
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "usman.malik8015@gmail.com",
              Name: "FSS App"
            },
            To: [
              {
                Email: to,
                Name: "You"
              }
            ],
            Subject: subject,
            TextPart: text,
            HTMLPart: html
          }
        ]
      });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};


// const sendEmailForQuotation = async (to, subject, text, html, attachmentPath) => {
//   const attachment = attachmentPath
//     ? [{
//         ContentType: 'application/pdf',
//         Filename: 'Quotation.pdf',
//         Base64Content: fs.readFileSync(attachmentPath).toString('base64'),
//       }]
//     : [];

//   const request = mailer.post('send', { version: 'v3.1' }).request({
//     Messages: [
//       {
//         From: {
//           Email: "usman.malik8015@gmail.com",
//           Name: "Fssgulf"
//         },
//         To: [{ Email: to, Name: "Client" }],
//         Subject: subject,
//         TextPart: text,
//         HTMLPart: html,
//         Attachments: attachment,
//       }
//     ]
//   });

//   await request;
//   console.log(attachment,to,subject);
// };


// module.exports = {sendEmail, sendEmailForQuotation};
module.exports = {sendEmail};

