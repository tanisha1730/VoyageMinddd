// Cleanup route to remove old fake itineraries
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Itinerary = require('../models/Itinerary');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /cleanup/fake-itineraries:
 *   delete:
 *     summary: Delete old fake itineraries for current user
 *     tags: [Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fake itineraries deleted successfully
 */
router.delete('/fake-itineraries', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete itineraries that don't have realtime_generated flag (old fake ones)
    const result = await Itinerary.deleteMany({
      user_id: userId,
      $or: [
        { realtime_generated: { $ne: true } },
        { realtime_generated: { $exists: false } }
      ]
    });

    // Also clean up user's saved_itineraries array
    req.user.saved_itineraries = [];
    await req.user.save();

    logger.info(`🧹 Cleaned up ${result.deletedCount} fake itineraries for user ${userId}`);

    res.json({
      message: 'Fake itineraries cleaned up successfully',
      deleted_count: result.deletedCount,
      note: 'Only real-time generated itineraries are kept'
    });

  } catch (error) {
    logger.error('❌ Cleanup failed:', error);
    next(error);
  }
});

/**
 * @swagger
 * /cleanup/all-itineraries:
 *   delete:
 *     summary: Delete ALL itineraries for current user (fresh start)
 *     tags: [Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All itineraries deleted successfully
 */
router.delete('/all-itineraries', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete ALL itineraries for this user
    const result = await Itinerary.deleteMany({ user_id: userId });

    // Clean up user's saved_itineraries array
    req.user.saved_itineraries = [];
    await req.user.save();

    logger.info(`🧹 Deleted ALL ${result.deletedCount} itineraries for user ${userId}`);

    res.json({
      message: 'All itineraries deleted successfully - fresh start!',
      deleted_count: result.deletedCount,
      note: 'You can now create new itineraries with real places'
    });

  } catch (error) {
    logger.error('❌ Cleanup failed:', error);
    next(error);
  }
});

module.exports = router;