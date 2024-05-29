const mongoose = require("mongoose");
const moment = require("moment");

const formattedDate = ()=> moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

// Define your GoalSheet schema
const goalSheetSchema = new mongoose.Schema({
  // your schema definition here
  employee_id: String,
  title: String,
  description: String,

  tasks: [
    {
      name: String,
      description: String,
      startdate: String,
      enddate: String,
      totalduration: Number,
      status: {
        type: String,
        // enum: ['completed', 'not started', 'in progress', 'on hold', 'canceled', 'postponed', 'overdue'],
        enum: require("../config/taskStatus"),
        default: "not started",
      },
      employeeSelfAssessRating: {
        type: Number,
        min: [1, "value out of range"],
        max: [5, "value out of range"],
        default: null,
      },
      reportingManagerAssessment: {
        type: Number,
        min: [1, "value out of range"],
        max: [5, "value out of range"],
        default: null,
      },
      Feedback: String,
    },
  ],
  sheetStatus: {
    type: String,
    enum: require("../config/goalSheetStatus"),
    default: 'not approved',
  },
  sheetSubmitted: {
    type: Boolean,
    default: false,
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

goalSheetSchema.pre("save", function (next) {
  this.updated_at = formattedDate();
  if (this.isNew) this.created_at = formattedDate();
  next();
});

module.exports = mongoose.model("GoalSheet", goalSheetSchema);
