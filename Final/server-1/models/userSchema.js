const mongoose = require("mongoose");
const moment = require("moment");

const formattedDate = ()=> moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: require("../config/userRoles"),
    default: "Employee",
  },
  created_at: {
    type: String,
    default: formattedDate,
  },
  updated_at: {
    type: String,
    default: formattedDate,
  },
});

userSchema.pre("save", function (next) {
  this.updated_at = formattedDate();
  if (this.isNew) this.created_at = formattedDate();
  next();
});

module.exports = mongoose.model("UserData", userSchema);
