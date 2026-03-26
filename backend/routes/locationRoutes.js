const express = require('express');
const router = express.Router();
const { Location } = require('../models/Schemas');
const { protect } = require('../middleware/auth');

// @desc    Save user location
// @route   POST /api/location/save
// @access  Private
router.post('/save', protect, async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;
    
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const newLocation = await Location.create({
      userId: req.user._id,
      latitude,
      longitude,
      timestamp: timestamp || new Date()
    });

    res.status(201).json({
      status: 'success',
      data: newLocation
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// @desc    Get recent locations
// @route   GET /api/location/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Location.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
