const express = require('express')
const router = express.Router()
const { generateItinerary } = require('../controllers/generateController')
const protect = require('../middleware/auth')

router.post('/', protect, generateItinerary)

module.exports = router