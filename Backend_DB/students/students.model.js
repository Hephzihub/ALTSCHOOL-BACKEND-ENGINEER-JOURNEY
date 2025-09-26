const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String
})

const StudentsModel = mongoose.model('students', studentSchema)

module.export = {
  StudentModel: StudentsModel
}