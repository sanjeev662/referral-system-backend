const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./db/connection");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
// app.use(
//   cors({
//     origin: "http://localhost:3001",
//   })
// );
app.use(bodyParser.json()); // Parse incoming requests with JSON payloads

// Connect to the database
connectDB();

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/transaction", transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
