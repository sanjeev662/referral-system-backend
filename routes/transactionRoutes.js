const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Assignment = require("../models/Assignment");
const Employee = require("../models/Employee");
const TransactionHistory = require("../models/TransactionHistory");
const Lead = require("../models/Lead");
const config = require("../config/config");

//for employee create withdraw request
router.post("/employee/withdraw", async (req, res) => {
  try {
    const { amount, employee_id } = req.body;

    const employeeDetail = await Employee.findById(employee_id);

    if (!employeeDetail) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const previousTransactions = await TransactionHistory.find({
      employee_id,
      status: "pending",
    });

    if (previousTransactions && previousTransactions.length > 0) {
      return res.status(404).json({
        success: false,
        message: "Previous transactions are pending",
      });
    }

    if (employeeDetail.accessibleBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance for withdrawal",
      });
    }

    const transactionHistory = new TransactionHistory({
      name: employeeDetail.name,
      email: employeeDetail.email,
      account_no: employeeDetail.account_no,
      ifsc_code: employeeDetail.ifsc_code,
      upi_id: employeeDetail.upi_id,
      accessibleBalance: employeeDetail.accessibleBalance,
      amount,
      employee_id,
    });

    await transactionHistory.save();

    res.status(201).json({
      success: true,
      data: {
        transactionHistory,
      },
      message: "Transaction Request added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add Request",
    });
  }
});

//for employee Get withdraw request
router.get("/employee/withdraw", async (req, res) => {
  try {
    const { employee_id } = req.query;

    const transactions = await TransactionHistory.find({ employee_id });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found",
      });
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

//for admin getAll withdrawn request
router.get("/admin/withdraw", async (req, res) => {
  try {
    const transactions = await TransactionHistory.find({
      "transaction.status": { $ne: "accepted" },
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found with status not equal to 'accepted'",
      });
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

// Delete a withdrawn request by ID
router.delete("/admin/withdraw/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  try {
    const deletedTransaction = await TransactionHistory.deleteOne({
      _id: transactionId,
    });

    if (deletedTransaction.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
});

// Update status and balance for a withdrawal request by the admin
router.put("/admin/withdraw/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { status } = req.body;

  try {
    const transaction = await TransactionHistory.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (status === "accepted") {
      transaction.status = status;
      const employee = await Employee.findById(transaction.employee_id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      transaction.accessibleBalance = employee.accessibleBalance;

      // Assuming balance adjustments are needed here
      // For instance, increase employee's accessibleBalance after approval
      if (transaction.description === "deposite") {
        employee.accessibleBalance += transaction.amount;
        employee.balance += transaction.amount;
      }

      if (
        transaction.description === "withdraw" &&
        transaction.amount <= employee.accessibleBalance
      ) {
        employee.accessibleBalance -= transaction.amount;
        employee.balance -= transaction.amount;
      }

      // Save the updated employee details
      await employee.save();
    } else {
      transaction.status = status;
    }

    // Save the transaction history with the updated status or balance
    await transaction.save();

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
      message: `Transaction status updated to '${status}' successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update transaction status",
    });
  }
});

module.exports = router;
