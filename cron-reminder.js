// const admin = require("firebase-admin");
// const db = require("./firebase");
// const cron = require("node-cron");
// const {sendEmail} = require("./mailer");

// function scheduleEmailJob() {
//   cron.schedule("0 8 * * * ", async () => {
//     console.log("⏰ Checking reminders...");

//     const now = new Date();
//     const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     // Convert dates to ISO strings for comparison
//     const nowISO = now.toISOString();
//     const oneDayLaterISO = oneDayLater.toISOString();

//     const visitsRef = db.collection("visits");
//     const snapshot = await visitsRef
//       .where("meetingDate", ">=", nowISO)
//       .where("meetingDate", "<=", oneDayLaterISO)
//       .get();

//     const visitsWithUserData = [];
    
//     for (const doc of snapshot.docs) {
//       const visit = doc.data();
//       const userId = visit.userId;
    
//       // Get user data
//       const userDoc = await admin.firestore().collection('users').doc(userId).get();
//       const userData = userDoc.exists ? userDoc.data() : null;
    
//       // Parse meetingDate string to Date object
//       const meetingDate = new Date(visit.meetingDate);
      
//       // Calculate one day before meeting
//       const oneDayBefore = new Date(meetingDate.getTime() - 24 * 60 * 60 * 1000);
      
//       // Check if we should send reminder
//       const shouldSend = now >= oneDayBefore && now <= meetingDate;

//       if (shouldSend) {
//         const visitWithUser = {
//           id: doc.id,
//           ...visit,
//           user: {
//             ...userData,
//             id: userId // Ensure user id is included
//           }
//         };
//         visitsWithUserData.push(visitWithUser);

//         const html = `<p>Meeting with ${visit.companyName} on ${meetingDate.toLocaleString()}</p>`;
//         const text = `Meeting scheduled with ${visit.companyName} on ${meetingDate.toLocaleString()}`;

//         // Prepare list of recipients
//         const recipients = [];

//         // Add user email if available
//         if (userData && userData.email) {
//           recipients.push(userData.email);
//         }

//         // Always send to admin
//         recipients.push("usman.malik1223@gmail.com");

//         // Remove duplicates
//         const uniqueRecipients = [...new Set(recipients)];
//         // console.log(uniqueRecipients);
//         // Send emails to all recipients
//         for (const recipient of uniqueRecipients) {
//           try {
//             await sendEmail({
//               to: recipient,
//               subject: `Reminder: Meeting with ${visit.companyName}`,
//               text,
//               html,
//             });
//             // console.log(`Email sent to ${recipient}`);
//           } catch (error) {
//             console.error(`Failed to send email to ${recipient}:`, error);
//           }
//         }
//       }
//     }

//     // console.log("Processed visits:", visitsWithUserData);
//   });
// }

// module.exports = scheduleEmailJob;