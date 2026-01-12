export default class BirthdayMiddleware {
  static validateBirthdayData(req, res, next) {
    const { username, dateOfBirth, email } = req.body;
    if (!username || !dateOfBirth || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Additional validations can be added here (e.g., email format, date format)
    next();
  }
}