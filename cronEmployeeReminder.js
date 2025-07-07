



// const db = require("./firebase");
// const cron = require("node-cron");
// const { sendEmail } = require("./mailer");

// function daysBetween(dateString) {
//   const today = new Date();
//   const target = new Date(dateString);
//   return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
// }

// const REMINDER_CONFIG = [
//   {
//     threshold: 50,
//     // emails: ["ops1@fssgulf.com", "usmanmunir@fssgulf.com"],
//     emails: ["ops1@fssgulf.com"],

//   },
//   {
//     threshold: 35,
//     // emails: ["ops1@fssgulf.com", "usmanmunir@fssgulf.com"],
//     emails: ["ops1@fssgulf.com"],

//   },
//   {
//     threshold: 29,
//     // emails: ["ops1@fssgulf.com", "usmanmunir@fssgulf.com"],
//     emails: ["ops1@fssgulf.com"],

//   },
// ];

// // const EXPIRED_ALERT_EMAILS = ["ops1@fssgulf.com", "usmanmunir@fssgulf.com"];
// const EXPIRED_ALERT_EMAILS = ["usman.malik1223@gmail.com", "ops1@fssgulf.com"];


// function scheduleEmployeeReminderJob() {
//   cron.schedule("42 18 * * *", async () => {
//     console.log("🔁 Checking employee expiry reminders...");

//     const snapshot = await db.collection("employees").get();
//     const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//     for (const employee of employees) {
//       const fieldsToCheck = [
//         { label: "Iqama Expiry", key: "iqamaExpiry" },
//         { label: "Insurance Expiry", key: "insuranceExpiry" },
//         { label: "Contract Expiry", key: "endContract" },
//       ];

//       for (const { label, key } of fieldsToCheck) {
//         if (!employee[key]) continue;

//         const daysLeft = daysBetween(employee[key]);

//         // 1. Send reminder if within thresholds
//         const reminder = REMINDER_CONFIG.find(cfg => cfg.threshold === daysLeft);
//         if (reminder) {
//           const subject = `Reminder: ${label} for ${employee.name} is in ${daysLeft} days`;
//           const html = `<p>${label} for <strong>${employee.name}</strong> (Iqama: ${employee.iqamaNumber || "-"}) is on <strong>${employee[key]}</strong>.</p>`;
//           const text = `${label} for ${employee.name} is expiring on ${employee[key]}`;

//           for (const email of reminder.emails) {
//             await sendEmail({ to: email, subject, text, html });
//           }
//         }

//         // 2. Send email if Iqama is expired, but only once every 3 days
//         if (label === "Iqama Expiry" && daysLeft < 0) {
//           const lastSent = employee.lastExpiredIqamaEmailSent
//             ? new Date(employee.lastExpiredIqamaEmailSent)
//             : null;

//           const now = new Date();
//           const diffDays =
//             lastSent ? Math.floor((now - lastSent) / (1000 * 60 * 60 * 24)) : Infinity;

//           if (diffDays >= 3) {
//             const subject = `⚠️ ALERT: Iqama Expired for ${employee.name}`;
//             const html = `<p>The Iqama for <strong>${employee.name}</strong> (Iqama: ${employee.iqamaNumber || "-"}) <strong>expired on ${employee[key]}</strong>.</p>`;
//             const text = `ALERT: Iqama for ${employee.name} has expired on ${employee[key]}`;

//             for (const email of EXPIRED_ALERT_EMAILS) {
//               await sendEmail({ to: email, subject, text, html });
//             }

//             // Update last email sent timestamp in Firestore
//             await db.collection("employees").doc(employee.id).update({
//               lastExpiredIqamaEmailSent: now.toISOString(),
//             });
//           }
//         }
//       }
//     }

//     console.log("✅ Employee expiry reminder check complete.");
//   });
// }

// module.exports = scheduleEmployeeReminderJob;


const db = require("./firebase");
const cron = require("node-cron");
const { sendEmail } = require("./mailer");

function daysBetween(dateString) {
  const today = new Date();
  const target = new Date(dateString);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

const REMINDER_CONFIG = [
  {
    threshold: 50,
    emails: ["ops1@fssgulf.com", "usmanmunir@fssgulf.com", "usman.malik1223@gmail.com"],
  },
  {
    threshold: 35,
    emails: ["ops1@fssgulf.com", "usmanmunir@fssgulf.com", "usman.malik1223@gmail.com"],
  },
  {
    threshold: 29,
    emails: ["ops1@fssgulf.com", "usmanmunir@fssgulf.com", "usman.malik1223@gmail.com"],
  },
];

const EXPIRED_ALERT_EMAILS = ["ops1@fssgulf.com", "usmanmunir@fssgulf.com", "usman.malik1223@gmail.com"];
// const EXPIRED_ALERT_EMAILS = ["ops1@fssgulf.com"];

function scheduleEmployeeReminderJob() {
  cron.schedule("11 10 * * *", async () => {
    console.log("🔁 Checking employee expiry reminders...");

    const snapshot = await db.collection("employees").get();
    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const reminderSummary = {}; // { threshold: [html strings] }
    const expiredIqamas = []; // array of HTML rows

    const now = new Date();

    for (const employee of employees) {
      const fieldsToCheck = [
        { label: "Iqama Expiry", key: "iqamaExpiry" },
        { label: "Insurance Expiry", key: "insuranceExpiry" },
        { label: "Contract Expiry", key: "endContract" },
      ];

      for (const { label, key } of fieldsToCheck) {
        if (!employee[key]) continue;

        const daysLeft = daysBetween(employee[key]);

        // Collect data for combined REMINDER email
        const reminder = REMINDER_CONFIG.find(cfg => cfg.threshold === daysLeft);
        if (reminder) {
          const infoHtml = `<li><strong>${label}</strong> for <strong>${employee.name}</strong> (Iqama: ${employee.iqamaNumber || "-"}) is on <strong>${employee[key]}</strong> (${daysLeft} days left)</li>`;
          if (!reminderSummary[reminder.threshold]) {
            reminderSummary[reminder.threshold] = {
              emails: reminder.emails,
              items: [],
            };
          }
          reminderSummary[reminder.threshold].items.push(infoHtml);
        }

        // Collect data for combined EXPIRED IQAMA email
        if (label === "Iqama Expiry" && daysLeft < 0) {
          const lastSent = employee.lastExpiredIqamaEmailSent
            ? new Date(employee.lastExpiredIqamaEmailSent)
            : null;
          const diffDays = lastSent ? Math.floor((now - lastSent) / (1000 * 60 * 60 * 24)) : Infinity;

          if (diffDays >= 3) {
            expiredIqamas.push({
              html: `<li><strong>${employee.name}</strong> (Iqama: ${employee.iqamaNumber || "-"}) expired on <strong>${employee[key]}</strong></li>`,
              id: employee.id,
            });
          }
        }
      }
    }

    // 🔹 Send combined REMINDER emails
    for (const threshold in reminderSummary) {
      const { emails, items } = reminderSummary[threshold];
      const subject = `Reminder: Employee Documents Expiring in ${threshold} days`;
      const html = `<p>The following employee documents are expiring in <strong>${threshold} days</strong>:</p><ul>${items.join("")}</ul>`;
      const text = `Employee documents expiring in ${threshold} days:\n` + items.map(item => item.replace(/<\/?[^>]+(>|$)/g, "")).join("\n");

      for (const email of emails) {
        await sendEmail({ to: email, subject, text, html });
      }
    }

    // 🔸 Send combined EXPIRED IQAMA email
    if (expiredIqamas.length > 0) {
      const subject = `⚠️ ALERT: Expired Iqamas Summary`;
      const html = `<p>The following employees have expired Iqamas:</p><ul>${expiredIqamas.map(e => e.html).join("")}</ul>`;
      const text = `Expired Iqamas:\n` + expiredIqamas.map(e => e.html.replace(/<\/?[^>]+(>|$)/g, "")).join("\n");

      for (const email of EXPIRED_ALERT_EMAILS) {
        await sendEmail({ to: email, subject, text, html });
      }

      // Update Firestore: lastExpiredIqamaEmailSent
      const batch = db.batch();
      for (const { id } of expiredIqamas) {
        const ref = db.collection("employees").doc(id);
        batch.update(ref, {
          lastExpiredIqamaEmailSent: now.toISOString(),
        });
      }
      await batch.commit();
    }

    console.log("✅ Employee expiry reminder check complete.");
  });
}

module.exports = scheduleEmployeeReminderJob;
