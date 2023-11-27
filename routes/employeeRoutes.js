const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Assignment = require("../models/Assignment");
const Employee = require("../models/Employee");
const TransactionHistory = require("../models/TransactionHistory");
const Lead = require("../models/Lead");
const config = require("../config/config");

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: "employee not found" });
    }

    if (employee.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ employeeId: employee._id }, config.secret, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      data: {
        employee,
        token,
      },
      message: "Sign-in successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to authenticate",
    });
  }
});

//get logged in employee detail
router.get("/detail", async (req, res) => {
  const { employee_id } = req.query; // Extract the employee ID from the query parameter

  try {
    const employee = await Employee.findById(employee_id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // If employee found, send the employee details in the response
    res.status(200).json({
      success: true,
      data: {
        balance: employee.balance,
        accessibleBalance: employee.accessibleBalance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee details",
    });
  }
});

// get all Assignment added by admin
router.get("/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find();

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assignments found created by admin",
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: {
        assignments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments created by admin",
    });
  }
});

// add lead
router.post("/lead", async (req, res) => {
  try {
    const { company_name, name, mob_no, employee_id } = req.body;
    const lead = await Lead.create({
      company_name,
      name,
      mob_no,
      employee_id,
    });

    const employee = await Employee.findById(employee_id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    //for deposite of balance due to lead
    employee.balance += 500;
    await employee.save();

    res.status(201).json({
      success: true,
      data: {
        lead,
      },
      message: "Lead added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add lead",
    });
  }
});

// Get added leads of loggedIn employee
router.get("/leads", async (req, res) => {
  try {
    const { employee_id } = req.query; // Accessing employee_id from query parameters

    const leads = await Lead.find({ employee_id });

    if (!leads || leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leads found",
      });
    }

    res.status(200).json({
      success: true,
      count: leads.length,
      data: {
        leads,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
});

//Get all leads
router.get("/getallLeads", async (req, res) => {
  try {
    const leads = await Lead.find();

    if (!leads || leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leads found",
      });
    }

    res.status(200).json({
      success: true,
      count: leads.length,
      data: {
        leads,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
});

//get employee dashboard data
router.get("/dashboard", async (req, res) => {
  const { employee_id } = req.query;
  try {
    const today = new Date();
    const lastWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7
    );

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);

    const transactionHistory = await TransactionHistory.find({
      status: "accepted",
      employee_id,
      date: { $gte: todayStart, $lt: todayEnd },
    });

    const lastWeekTransactionHistory = await TransactionHistory.find({
      status: "accepted",
      employee_id,
      date: { $gte: lastWeek, $lt: todayStart },
    });

    if (!transactionHistory || !lastWeekTransactionHistory) {
      return res.status(404).json({
        success: false,
        message: "No transaction found",
      });
    }

    const todayEarning = transactionHistory.reduce(
      (acc, cur) => acc + cur.amount,
      0
    );
    const lastWeekEarning = lastWeekTransactionHistory.reduce(
      (acc, cur) => acc + cur.amount,
      0
    );

    const allTransactions = await TransactionHistory.find({
      status: "accepted",
      employee_id,
    });
    const totalEarning = allTransactions.reduce(
      (acc, cur) => acc + cur.amount,
      0
    );

    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee found",
      });
    }
    const availableBalance = employee.accessibleBalance;

    res.status(200).json({
      success: true,
      data: {
        today_earning: todayEarning,
        last_week_earning: lastWeekEarning,
        total_earning: totalEarning,
        available_balance: availableBalance,
      },
      message: "Dashboard statistics fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
});

module.exports = router;
