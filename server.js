const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


// Middleware
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const tripRoutes = require("./routes/tripRoutes");
app.use("/api/trips", tripRoutes);

const generateRoutes = require("./routes/generateRoutes");
app.use("/api/generate", generateRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "WandrAI Backend is running!" });
});

// Connect to MongoDB and start server
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)

const tripRoutes = require('./routes/tripRoutes')
app.use('/api/trips', tripRoutes)

const generateRoutes = require('./routes/generateRoutes')
app.use('/api/generate', generateRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'WandrAI Backend is running!' })
})

// Safe PORT
const PORT = process.env.PORT || 5000

//  Start server FIRST
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Connect Mongo separately (don’t block server)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
  })