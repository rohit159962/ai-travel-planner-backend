const mongoose = require('mongoose')

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  days: Number,
  people: Number,
  budget: String,
  travelStyle: String,
  itinerary: Object,
}, { timestamps: true })

module.exports = mongoose.model('Trip', tripSchema)