const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mob_no: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
