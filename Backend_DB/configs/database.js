const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = async () => {
  try {
    await mongoose.connect('', {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    })
    console.log('connected');
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  connectDB
}