const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mob_no: {
    type: String,
  },
  account_no: {
    type: String,
  },
  ifsc_code: {
    type: String,
  },
  upi_id: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
  accessibleBalance: {
    type: Number,
    default: 0,
  },
  account_status: {
    type: String,
  },
  agent_code: {
    type: String,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
