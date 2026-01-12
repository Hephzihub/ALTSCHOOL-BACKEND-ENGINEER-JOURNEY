import BirthdayService from "./birthday.service.js";
import FileProcessingService from "../services/fileProcessingService.js";
import path from "path";

export default class BirthdayController {
  static async createBirthday(req, res) {
    try {
      const birthday = await BirthdayService.createBirthday(req.body);
      res.status(201).json(birthday);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createBulkBirthdays(req, res) {
    try {
      const birthdays = req.body; // Expecting an array of birthday objects
      const results = await BirthdayService.createBulkBirthdays(birthdays);
      res.status(201).json(results); // 207 Multi-Status can also be used
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createBulkBirthdaysUpload(req, res) {
    try {
      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();

      let processed;
      if (ext === ".xlsx" || ext === ".xls") {
        processed = await FileProcessingService.processExcelFile(filePath);
      } else if (ext === ".csv") {
        processed = await FileProcessingService.processCSVFile(filePath);
      }

      const { validData, error } = processed;

      if (validData.length === 0) {
        return res.status(400).json({ error: "No valid data found in file" });
      }

      const results = await BirthdayService.createBulkBirthdays(validData);
      res.status(201).json({
        message: `${results.success.length} records created, ${results.failed.length} records failed.`,
        results,
      }); // 207 Multi-Status
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message, message: "File upload Failed" });
    }
  }

  static async getAllBirthdays(req, res) {
    try {
      const birthdays = await BirthdayService.getAllBirthdays();
      res.status(200).json(birthdays);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTodaysBirthdays(req, res) {
    try {
      const birthdays = await BirthdayService.getTodaysBirthdays();
      res.status(200).json(birthdays);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getBirthdayById(req, res) {
    try {
      const birthday = await BirthdayService.getBirthdayById(req.params.id);
      res.status(200).json(birthday);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async deleteBirthday(req, res) {
    try {
      await BirthdayService.deleteBirthday(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    console.log("Fetching stats...");
    try {
      const stats = await BirthdayService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error });
    }
  }
}
