const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  company_link: {
    type: String,
    required: true,
  },
});

const Assignment = mongoose.model("Assingment", assignmentSchema);

module.exports = Assignment;
