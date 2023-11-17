const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./db/connection");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

connectDB(); // Connect to the database

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
