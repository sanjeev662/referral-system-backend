const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
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
  accessibleBalance: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "withdraw",
  },
  status: {
    type: String,
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  employee_id: {
    type: String,
    required: true,
  },
});

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);

module.exports = TransactionHistory;
