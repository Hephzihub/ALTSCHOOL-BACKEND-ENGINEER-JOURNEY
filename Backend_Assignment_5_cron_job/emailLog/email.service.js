import { EmailLog } from "./email.model.js";
import BirthdayService from "../birthday/birthday.service.js";
import transporter from "../configs/mailer.js";

export default class EmailService {
  static async logEmail(birthdayId, email, status, errorMessage = null) {
    const emailLog = new EmailLog({
      birthdayId,
      email,
      status,
      errorMessage,
    });
    await emailLog.save();
  }

  // Send birthday email
  static async sendBirthdayEmail(user) {
    const age =
      new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "🎂 Happy Birthday! 🎉",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px; text-align: center; }
          .cake { font-size: 64px; margin-bottom: 20px; }
          .name { font-size: 24px; color: #1e293b; font-weight: 600; }
          .message { color: #64748b; font-size: 16px; line-height: 1.6; margin-top: 16px; }
          .age-badge { display: inline-block; background: #f1f5f9; color: #6366f1; padding: 8px 20px; border-radius: 20px; font-weight: 600; margin-top: 20px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Happy Birthday! 🎉</h1>
          </div>
          <div class="content">
            <div class="cake">🎂</div>
            <div class="name">Dear ${user.username},</div>
            <div class="message">
              Wishing you a fantastic birthday filled with joy, laughter, and all the things that make you happy!
              May this special day bring you wonderful memories and the start of an amazing year ahead.
            </div>
            <div class="age-badge">Turning ${age} 🎈</div>
          </div>
          <div class="footer">
            Sent with ❤️ from Birthday Reminder App
          </div>
        </div>
      </body>
      </html>
    `,
    };

    return transporter.sendMail(mailOptions);
  }

  // Send bulk birthday emails based on today's birthdays also handle logging and
  static async sendBulkBirthdayEmails() {
    const todayBirthdays = await BirthdayService.getTodaysBirthdays();

    for (const user of todayBirthdays) {
      try {
        await this.sendBirthdayEmail(user);
        await this.logEmail(user._id, user.email, "sent");
      } catch (error) {
        await this.logEmail(user._id, user.email, "failed", error.message);
      }
    }
  }
}
