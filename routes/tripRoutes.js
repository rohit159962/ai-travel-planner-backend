const express = require('express')
const router = express.Router()
const { saveTrip, getTrips, deleteTrip } = require('../controllers/tripController')
const protect = require('../middleware/auth')

router.post('/', protect, saveTrip)
router.get('/', protect, getTrips)
router.delete('/:id', protect, deleteTrip)

module.exports = router