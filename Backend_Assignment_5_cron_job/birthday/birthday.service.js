import { BirthdayModel } from "./birthday.model.js";
import { EmailLog } from "../emailLog/email.model.js";

export default class BirthdayService {
  static async createBirthday(data) {
    const { username, email, dateOfBirth } = data;

    const existing = await BirthdayModel.findOne({ email });
    if (existing) {
      throw new Error("Email already exists");
    }
    const birthday = new BirthdayModel({
      username,
      email,
      dateOfBirth: new Date(dateOfBirth),
    });
    return await birthday.save();
  }

  // Bulk create birthdays using excel/csv data
  static async createBulkBirthdays(dataArray) {
    const results = { success: [], failed: [] };
    for (const data of dataArray) {
      try {
        const birthday = await this.createBirthday(data);
        results.success.push(birthday);
      } catch (error) {
        results.failed.push({ data, error: error.message });
      }
    }
    return results;
  }

  static async getAllBirthdays() {
    return await BirthdayModel.find();
  }

  static async getTodaysBirthdays() {
    const today = new Date();
    const month = today.getUTCMonth() + 1;
    const day = today.getUTCDate();

    return await BirthdayModel.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    });
  }

  static async getBirthdayById(id) {
    const birthday = await BirthdayModel.findById(id);

    if (!birthday) {
      throw new Error("Birthday record not found");
    }

    return birthday;
  }

  // Later Features
  static async updateBirthday(id, data) {
    return await BirthdayModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteBirthday(id) {
    const birthday = await BirthdayModel.findByIdAndDelete(id);

    if (!birthday) {
      throw new Error("Birthday record not found");
    }
    return await BirthdayModel.findByIdAndDelete(id);
  }

  static async getBirthdaysByMonthDay(month, day) {
    return await BirthdayModel.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    });
  }

  static async getStats() {
    // Total birthdays count, Emails sent today, Total emails sent, last email run time
    const totalBirthdays = await BirthdayModel.countDocuments();
    const todayEmailSent = await EmailLog.getTodayCount();
    const totalEmailSent = await EmailLog.getTotalCount();
    const lastEmailRunTime = await EmailLog.getLastRunTime();
    // Use Last cron job status boolean if status is "sent"
    const cronStatus = await EmailLog.getLastCronStatus();
    return {
      cronStatus,
      totalBirthdays,
      todayEmailSent,
      totalEmailSent,
      lastEmailRunTime,
    };
  }
}
