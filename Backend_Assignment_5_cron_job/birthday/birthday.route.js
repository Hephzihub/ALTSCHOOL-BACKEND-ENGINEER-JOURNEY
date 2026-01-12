import { Router } from "express";
import BirthdayController from "./birthday.controller.js";
import BirthdayMiddleware from "./birthday.middleware.js";
import { uploadCsvExcel } from "../middlewares/upload.js";

const birthdayRouter = Router();

birthdayRouter.get("/", BirthdayController.getTodaysBirthdays);
birthdayRouter.get("/all", BirthdayController.getAllBirthdays);
birthdayRouter.post(
  "/",
  BirthdayMiddleware.validateBirthdayData,
  BirthdayController.createBirthday
);
birthdayRouter.post(
  "/bulk",
  BirthdayController.createBulkBirthdays
);
birthdayRouter.get("/status", BirthdayController.getStats);
// New route for bulk upload via CSV/Excel
birthdayRouter.post(
  "/bulkupload",
  uploadCsvExcel.single("file"),
  BirthdayController.createBulkBirthdaysUpload
);
birthdayRouter.get("/:id", BirthdayController.getBirthdayById);
birthdayRouter.delete("/:id", BirthdayController.deleteBirthday);


export default birthdayRouter;
