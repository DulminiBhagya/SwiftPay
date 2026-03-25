// app.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON body

// Routes
const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api", transactionRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});