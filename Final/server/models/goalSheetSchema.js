const mongoose = require("mongoose");
const moment = require("moment");

// function to format the current date and time
const formattedDate = () => moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

// define the schema for goal sheets
const goalSheetSchema = new mongoose.Schema({
  employee_id: String,
  title: String,
  description: String,

  // array of tasks associated with the goal sheet
  tasks: [
    {
      name: String,
      description: String,
      startdate: String,
      enddate: String,
      totalduration: Number,
      status: {
        type: String,
        enum: require("../config/taskStatus"),
        default: "not started",
      },

      // employee self-assessment rating (default: null, min: 1, max: 5)
      employeeSelfAssessRating: {
        type: Number,
        min: [1, "value out of range"],
        max: [5, "value out of range"],
        default: null,
      },

      // reporting manager assessment rating (default: null, min: 1, max: 5)
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
    default: "not approved",
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

// pre-save hook to update timestamps
goalSheetSchema.pre("save", function (next) {
  this.updated_at = formattedDate();
  if (this.isNew) this.created_at = formattedDate();
  next();
});

module.exports = mongoose.model("GoalSheet", goalSheetSchema); //export the goalSheetSchema function
