const mongoose = require("mongoose");
const moment = require("moment");

// function to format the current date and time
const formattedDate = ()=> moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

// define the schema for user data
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: require("../config/userRoles"),
    default: "Employee",
  },
  
  // timestamp for user was created
  created_at: {
    type: String,
    default: formattedDate,
  },
    // timestamp for user was last updated
  updated_at: {
    type: String,
    default: formattedDate,
  },
});

// pre-save hook to update timestamps
userSchema.pre("save", function (next) {
  this.updated_at = formattedDate();
  if (this.isNew) this.created_at = formattedDate();
  next();
});

module.exports = mongoose.model("UserData", userSchema); //export the userSchema function
