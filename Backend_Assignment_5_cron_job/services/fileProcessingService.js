import XLSX from "xlsx";
import fs from "fs";
import csv from "csv-parser";

export default class FileProcessingService {
  static async processExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      fs.unlinkSync(filePath); // Clean up the uploaded file

      return this.validateAndFormatData(data);
    } catch (error) {
      // Clean up the uploaded file in case of error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error("Error processing Excel file: " + error.message);
    }
  }

  static async processCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          fs.unlinkSync(filePath); // Clean up the uploaded file
          resolve(this.validateAndFormatData(results));
        })
        .on("error", (error) => {
          fs.unlinkSync(filePath); // Clean up the uploaded file in case of error
          reject(new Error("Error processing CSV file: " + error.message));
        });
    });
  }

  validateAndFormatData(data) {
    const validData = [];
    const errors = [];

    data.foreach((row, index) => {
      const rowNumber = index + 2; // considering header is on row 1

      // Basic validations
      const username =
        row["username"] ||
        row["Username"] ||
        row["USERNAME"] ||
        row["name"] ||
        row["Name"] ||
        row["NAME"];
      const email = row["email"] || row["Email"] || row["EMAIL"];
      const dateOfBirth =
        row["dateOfBirth"] ||
        row["DateOfBirth"] ||
        row["DATEOFBIRTH"] ||
        row["date_of_birth"] ||
        row["Date_of_Birth"] ||
        row["DATE_OF_BIRTH"] ||
        row["dob"] ||
        row["DOB"] ||
        row["Dob"];

      if (!username || !email || !dateOfBirth) {
        errors.push({
          row: rowNumber,
          error: "Missing required fields",
          data: row,
        });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({
          row: rowNumber,
          error: "Invalid email format",
          data: row,
        });
        return;
      }

      // Date of Birth validation
      const parsedDate = this.parseDate(dateOfBirth);
      if (!parsedDate) {
        errors.push({
          row: rowNumber,
          error: "Invalid date format",
          data: row,
        });
        return;
      }

      validData.push({ username, email, dateOfBirth: parsedDate });
    });

    return { validData, errors };
  }

  parseDate(dateString) {
    if (typeof dateString === "number") {
      const date = XLSX.SSF.parse_date_code(dateString);
      if (date) {
        return new Date(Date.UTC(date.y, date.m - 1, date.d));
      }
      // const excelEpoch = new Date(1899, 11, 30);
      // return new Date(excelEpoch.getTime() + dateString * 86400000);
    }

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  }
}
