const Trip = require('../models/Trip')

// Save a trip
const saveTrip = async (req, res) => {
  try {
    const { destination, days, people, budget, travelStyle, itinerary } = req.body

    const trip = await Trip.create({
      userId: req.user.id,
      destination,
      days,
      people,
      budget,
      travelStyle,
      itinerary,
    })

    res.status(201).json({ message: 'Trip saved successfully!', trip })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong!' })
  }
}

// Get all trips for a user
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ trips })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong!' })
  }
}

// Delete a trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found!' })
    }

    // Make sure user owns the trip
    if (trip.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized!' })
    }

    await Trip.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Trip deleted successfully!' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong!' })
  }
}

module.exports = { saveTrip, getTrips, deleteTrip }