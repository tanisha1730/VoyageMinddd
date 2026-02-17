const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Regenerate a specific day in an itinerary
 */
router.post('/:id/regenerate-day', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day } = req.body;
    
    logger.info(`🔄 Regenerating day ${day} for itinerary ${id}`);
    
    // Get the itinerary
    let itinerary;
    if (id.startsWith('session_') || id.startsWith('realtime_')) {
      itinerary = global.sessionItineraries?.get(id);
    } else {
      itinerary = await Itinerary.findById(id);
    }
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // TODO: Implement regeneration logic
    // For now, return success message
    res.json({
      message: `Day ${day} regeneration requested`,
      note: 'Feature coming soon - will fetch new places for this day'
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * Swap two places in an itinerary
 */
router.post('/:id/swap-places', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day1, placeIndex1, day2, placeIndex2 } = req.body;
    
    logger.info(`🔄 Swapping places in itinerary ${id}`);
    
    // Get the itinerary
    let itinerary;
    if (id.startsWith('session_') || id.startsWith('realtime_')) {
      itinerary = global.sessionItineraries?.get(id);
    } else {
      itinerary = await Itinerary.findById(id);
    }
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Swap the places
    const dayPlan1 = itinerary.plan.find(p => p.day === day1);
    const dayPlan2 = itinerary.plan.find(p => p.day === day2);
    
    if (!dayPlan1 || !dayPlan2) {
      return res.status(400).json({ error: 'Invalid day numbers' });
    }
    
    const temp = dayPlan1.places[placeIndex1];
    dayPlan1.places[placeIndex1] = dayPlan2.places[placeIndex2];
    dayPlan2.places[placeIndex2] = temp;
    
    // Save
    if (id.startsWith('session_') || id.startsWith('realtime_')) {
      global.sessionItineraries.set(id, itinerary);
    } else {
      await itinerary.save();
    }
    
    res.json({
      message: 'Places swapped successfully',
      itinerary
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * Remove a place from itinerary
 */
router.delete('/:id/day/:day/place/:placeIndex', authenticateToken, async (req, res, next) => {
  try {
    const { id, day, placeIndex } = req.params;
    
    logger.info(`🗑️ Removing place from day ${day} in itinerary ${id}`);
    
    // Get the itinerary
    let itinerary;
    if (id.startsWith('session_') || id.startsWith('realtime_')) {
      itinerary = global.sessionItineraries?.get(id);
    } else {
      itinerary = await Itinerary.findById(id);
    }
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Remove the place
    const dayPlan = itinerary.plan.find(p => p.day === parseInt(day));
    if (!dayPlan) {
      return res.status(400).json({ error: 'Invalid day number' });
    }
    
    dayPlan.places.splice(parseInt(placeIndex), 1);
    
    // Save
    if (id.startsWith('session_') || id.startsWith('realtime_')) {
      global.sessionItineraries.set(id, itinerary);
    } else {
      await itinerary.save();
    }
    
    res.json({
      message: 'Place removed successfully',
      itinerary
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
